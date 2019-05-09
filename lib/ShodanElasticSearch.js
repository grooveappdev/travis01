const Bottleneck = require('bottleneck');
const _ = require("lodash");
const fs = require("fs");
const elasticsearch = require("elasticsearch");
const KeyObject = require('./KeyObject');
const SimilarWeb = require('./SimilarWeb');
const Contact = require('./Contact');
// const Wappalyzer = require('./wappalyzer');

const similarWeb = new SimilarWeb({
  maxConcurrent: 15,
  maxRetry: 2
});

class ShodanElasticSearch {
  constructor(options) {
    this.host = options.host || 'localhost:9200';
    this.requestTimeout = options.requestTimeout || 60000;

    this.client = new elasticsearch.Client({
      host: this.host,
      requestTimeout: this.requestTimeout,
    });
    // this.limiter = new Bottleneck({
    //   minTime: this.minTime,
    //   maxConcurrent: this.maxConcurrent
    // });
  }

  createIndexIfNotExist(indexName) {
    return this.client.indices.exists({
      index: indexName
    }).then(exists => {
      if (exists) {
        return Promise.resolve('index existed');
      } else {
        return this.client.indices.create({
          index: indexName,
          body: {
            settings: {
              "index.mapping.total_fields.limit": 5000,
            }
          }
        });
      }
    });
  }
  buildShodanBulk(hostData, indexName, type, keyword) {
    const bulk = [];
    const test = [];
    // const ip = [];
    hostData.map(match => {
      if (match && match.ip_str) {
        bulk.push({
          index: {
            _index: indexName,
            _type: type,
            _id: `shodan_${keyword}_${match.ip_str}_${match.port}`
          }
        });
        bulk.push(match);
        test.push(`shodan_${keyword}_${match.ip_str}_${match.port}`);
        // ip.push(match.ip_str)
      };
    });
    // fs.writeFile(
    //   "./ip.json",
    //   JSON.stringify(ip),
    //   "utf8",
    //   () => console.log("done ip.json")
    // );
    console.log('unique', _.uniq(test).length);
    return bulk;
  };
  batchInsert(hostData, indexName, type, keyword) {
    const body = this.buildShodanBulk(hostData, indexName, type, keyword);
    console.log('final body', body.length)
    return this.client.bulk({ body });
  };
  count(indexName, type) {
    return this.client.count(
      {
        index: indexName,
        type,
        body: {
          query: { 'match_all': {} }
        }
      }
    );
  }
  deleteIndex(indexName) {
    return this.client.indices.delete({
      index: indexName
    });
  }
  purifyData(data, unusedProps) {
    const hostArraySet = Object.values(data).map(entry => entry.hosts);
    const hostArraySetSuccessful = hostArraySet.filter(item => {
      return _.isEmpty(item) === false;
    });
    const hostData = _.flatten(hostArraySetSuccessful);
    console.log('host data', hostData.length)
    const finalHostData = [];
    const domainList = [];
    hostData.map(host => {
      const finalHost = KeyObject.deleteKeysFromObject(host, unusedProps);
      finalHost.groove = {};
      const domain = KeyObject.getPropertyByKeyPath(host, 'ssl.cert.subject.CN');
      if (typeof domain === 'string') {
        const finalDomain = domain.replace('*.', '').replace('www.', '');
        finalHost.groove.business_domain = finalDomain;
        finalHost.groove.business_domain_extract_by_cert = 1;
        domainList.push(finalDomain);
      } else {
        console.log('no domain')
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
      finalHostData.push(finalHost);
    });
    // fs.writeFile(
    //   "./domains.json",
    //   JSON.stringify(domainList),
    //   "utf8",
    //   () => console.log("done domains.json")
    // );
    console.log('before', hostArraySet.length, '- after', hostArraySetSuccessful.length);
    console.log('final data', finalHostData.length);
    return finalHostData;
  }
  parseShodanHostData(data, unusedProps, editProps) {
    return new Promise((resolve, reject) => {
      const hostArraySet = Object.values(data).map(entry => entry.hosts);
      const hostArraySetSuccessful = hostArraySet.filter(item => {
        return _.isEmpty(item) === false;
      });
      const hostData = _.flatten(hostArraySetSuccessful);
      console.log('host data', hostData.length)
      const finalHostData = [];
      const promiseDomainInfos = [];
      const promiseContacts = [];
      const promiseWhoiss = [];
      const promiseWaps = [];
      const domains = [];
      let count = 0;
      let success = 0;
      let error = 0;
      similarWeb.initAgent().then(() => {
        hostData.map(host => {
          const finalHost = KeyObject.deleteKeysFromObject(host, unusedProps);
          finalHost.groove = {};
          const domain = KeyObject.getPropertyByKeyPath(host, 'ssl.cert.subject.CN');
          if (typeof domain === 'string') {
            const finalDomain = domain.replace('*.', '').replace('www.', '');
            finalHost.groove.business_domain = finalDomain;
            finalHost.groove.business_domain_extract_by_cert = 1;
            const promiseDomainInfo = similarWeb.getDomainInfo(finalDomain).then(info => {
              success += 1;
              count += 1;
              console.log('done', finalDomain, ' - count', count);
              finalHost.groove.similar_web = info;
              finalHost.groove.domain_info_extract_by_similar_web = 1;
              editProps.forEach(props => {
                KeyObject.editPropertyByKeyPath(finalHost, props, 999999999, oldValue => !oldValue);
              });
            }).catch(err => {
              error += 1;
              count += 1;
              console.log('error', err.statusCode, ' - count', count);
            });
            const promiseContact = Contact.searchContactFromWebsite(finalDomain).then(contact => {
              console.log('done contact', contact);
              finalHost.groove.contact = contact;
            }).catch(err => {
              console.log('error contact', err.message);
            });
            const promiseWhois = Contact.getDomainRegisterInfoFromWhois(finalDomain).then(contact => {
              finalHost.groove.whois = contact;
            }).catch(err => {
              console.log('error whois', err.message);
            });
            // const promiseWap = Wappalyzer.detectTechnologies(finalDomain).then(tech => {
            //   finalHost.groove.wappalyzer = tech;
            // }).catch(err => {
            //   console.log('error wappalyzer', err.message);
            // });
            promiseDomainInfos.push(promiseDomainInfo);
            promiseContacts.push(promiseContact);
            promiseWhoiss.push(promiseWhois);
            // promiseWaps.push(promiseWap);
            domains.push(finalDomain);
          } else {
            console.log('no domain')
            count += 1;
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
          finalHostData.push(finalHost);
        });

        // fs.writeFile(
        //   "./domains.json",
        //   JSON.stringify(domains),
        //   "utf8",
        //   () => console.log("done domains.json")
        // );
    
        console.log('before', hostArraySet.length, '- after', hostArraySetSuccessful.length);
        console.log('final data', finalHostData.length);
  
        Promise.all([
          Promise.all(promiseDomainInfos).then(() => console.log('****** DONE DOMAIN INFO ******')),
          Promise.all(promiseContacts).then(() => console.log('****** DONE CONTACT ******')),
          Promise.all(promiseWhoiss).then(() => console.log('****** DONE WHOIS ******')),
          // Promise.all(promiseWaps).then(() => console.log('****** DONE WAPS ******'))
        ]).then(() => {
          console.log('similar web:', success);
          console.log('error', error);
          similarWeb.destroyAgent();
          resolve(finalHostData);
        });
      });
    });
  }
}

module.exports = ShodanElasticSearch;