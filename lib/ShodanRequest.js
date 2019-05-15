const request = require("request-promise");
const Bottleneck = require('bottleneck');
const shodan = require("shodan-client");
const fs = require("fs");
const _ = require("lodash");
const KeyObject = require('./KeyObject');
const SimilarWeb = require('./SimilarWeb');
const Contact = require('./Contact');
const Wappalyzer = require('./Wappalyzer');

const similarWeb = new SimilarWeb({
  maxConcurrent: 2,
  maxRetry: 2
});

class ShodanRequest {
  constructor(options) {
    this.minTime = options.minTime || 0;
    this.maxConcurrent = options.maxConcurrent || null;
    this.shodanToken = options.shodanToken || '';

    this.limiter = new Bottleneck({
      minTime: this.minTime,
      maxConcurrent: this.maxConcurrent
    });
  }

  createPageArray(pageCount) {
    const pageArr = [];
    for (let page = 1; page <= pageCount; page += 1) {
      pageArr.push(page);
    }
    return pageArr;
  }
  getHostCount(query, searchOpts = {}) {
    return shodan.count(query, this.shodanToken, searchOpts).then(result => result.total || 0);
  }
  _getHostPerPage(query, searchOpts = {}, page) {
    if (page) {
      return shodan.search(query, this.shodanToken, {
        ...searchOpts,
        page
      }).then(result => {
        if (result.matches) {
          return Promise.resolve({
            page,
            hosts: result.matches,
            error: null,
          });
        } else {
          console.log('error', page, 'No Data');
          return Promise.resolve({
            page,
            hosts: null,
            error: 'No Data'
          });
        }
      }).catch(error => {
        console.log('error', page, error);
        return Promise.resolve({
          page,
          hosts: null,
          error
        });
      });
    } else {
      console.log('error', page, 'No Page');
      return Promise.resolve({
        page,
        hosts: null,
        error: 'No Page'
      });
    }
  }
  _getHostWithRetry(query, searchOpts = {}, page, retry = 0, time = 0, errorPage) {
    if (time > retry) {
      return errorPage;
    } else {
      if (time > 0) {
        console.log(`retry ${time} time on page ${page}`);
      }
      return this._getHostPerPage(query, searchOpts, page).then(hostPage => {
        if (hostPage.error === null) {
          return hostPage;
        } else {
          return this._getHostWithRetry(query, searchOpts, page, retry, time + 1, hostPage);
        }
      });
    }
  }
  getHosts(query, searchOpts = {}, retry = 0) {
    const shodanHostPageSet = {};
    return this.getHostCount(query, searchOpts).then(count => {
      console.log('count', count)
      const pageCount = Math.ceil(count / 100);
      const pageArray = this.createPageArray(pageCount);
      const getHostsRequests = pageArray.map(page => this.limiter.schedule(() => {
        return this._getHostWithRetry(query, searchOpts, page, retry);
      }));
      return Promise.all(getHostsRequests).then(hostPageArr => {
        hostPageArr.map(entry => {
          shodanHostPageSet[entry.page] = entry;
        });
        return shodanHostPageSet;
      });
    });
  }

  purifyData(data, keyword, unusedProps) {
    const hostArraySet = Object.values(data).map(entry => entry.hosts);
    const hostArraySetSuccessful = hostArraySet.filter(item => {
      return _.isEmpty(item) === false;
    });
    const hostList = _.flatten(hostArraySetSuccessful);
    console.log('host data', hostList.length)
    const finalHostList = [];
    const domainList = [];
    hostList.map(host => {
      const finalHost = KeyObject.deleteKeysFromObject(host, unusedProps);
      finalHost.hostId = `shodan_${keyword}_${host.ip_str}_${host.port}`;
      finalHost.groove = {};
      const domain = KeyObject.getPropertyByKeyPath(host, 'ssl.cert.subject.CN');
      if (typeof domain === 'string') {
        const finalDomain = domain.replace('*.', '').replace('www.', '');
        finalHost.groove.business_domain = finalDomain;
        finalHost.groove.business_domain_extract_by_cert = 1;
        domainList.push(finalDomain);
      } else {
        finalHost.groove.business_domain = null;
        finalHost.groove.business_domain_extract_by_cert = 0;
      }
      const vulnsObj = KeyObject.vulnsChecker(finalHost);
      if (vulnsObj) {
        finalHost.groove.vulns = {
          all: vulnsObj.vulnsList,
          verified: vulnsObj.vulnsVerified
        };
      }
      const httpComponents = KeyObject.httpComponentsChecker(finalHost);
      if (httpComponents) {
        finalHost.groove.httpComponents = httpComponents;
      }
      finalHostList.push(finalHost);
    });
    // fs.writeFile(
    //   "./domains.json",
    //   JSON.stringify(domainList),
    //   "utf8",
    //   () => console.log("done domains.json")
    // );
    console.log('before', hostArraySet.length, '- after', hostArraySetSuccessful.length);
    console.log('final data', finalHostList.length);
    return finalHostList;
  }
  exploreDomain(domain, editProps) {
    return new Promise((resolve, reject) => {
      const partialHost = {};
      partialHost.groove = {};
      if (typeof domain === 'string') {
        const promiseDomainInfo = similarWeb.getDomainInfo(domain).then(info => {
          console.log('done domain', domain);
          partialHost.groove.similar_web = info;
          partialHost.groove.domain_info_extract_by_similar_web = 1;
          editProps.forEach(props => {
            KeyObject.editPropertyByKeyPath(partialHost, props, 999999999, oldValue => !oldValue);
          });
        }).catch(err => {
          console.log('error domain', err.statusCode ? err.statusCode : err);
        });
        const promiseContact = Contact.searchContactFromWebsite(domain).then(contact => {
          console.log('done contact', contact);
          partialHost.groove.contact = contact;
        }).catch(err => {
          console.log('error contact', err.message);
        });
        const promiseWhois = Contact.getDomainRegisterInfoFromWhois(domain).then(contact => {
          partialHost.groove.whois = contact;
        }).catch(err => {
          console.log('error whois', err.message);
        });
        const promiseWap = Wappalyzer.detectTechnologies(domain).then(tech => {
          partialHost.groove.wappalyzer = tech;
        }).catch(err => {
          console.log('error wappalyzer', err.message);
        });
        Promise.all([
          promiseDomainInfo,
          promiseContact,
          promiseWhois,
          promiseWap
        ]).then(() => {
          resolve(partialHost);
        });
      } else {
        resolve({});
      }
    });
  }
}

module.exports = ShodanRequest;