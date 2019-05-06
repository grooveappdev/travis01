const Bottleneck = require('bottleneck');
const _ = require("lodash");
const fs = require("fs");
const elasticsearch = require("elasticsearch");
const KeyObject = require('./KeyObject');
const SimilarWeb = require('./SimilarWeb');
const Contact = require('./contact');

const similarWeb = new SimilarWeb({
  minTime: 100,
  maxConcurrent: 20,
  maxRetry: 5
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

  parseShodanHostData(data, unusedProps) {
    return new Promise((resolve, reject) => {
      const hostArraySet = Object.values(data).map(entry => entry.hosts);
      const hostArraySetSuccessful = hostArraySet.filter(item => {
        return _.isEmpty(item) === false;
      });
      const hostData = _.flatten(hostArraySetSuccessful);
      console.log('host data', hostData.length)
      const finalHostData = [];
      const promises = [];
      let success = 0;
      let error = 0;
      similarWeb.initAgent().then(() => {
        hostData.map(host => {
          let promiseDomain = Promise.resolve('');
          let promiseContact = Promise.resolve([]);
          let promiseWhois = Promise.resolve({});
          const finalHost = KeyObject.deleteKeysFromObject(host, unusedProps);
          finalHost.groove = {};
          const domain = KeyObject.getPropertyByKeyPath(host, ['ssl', 'cert', 'subject', 'CN']);
          if (typeof domain === 'string') {
            finalHost.groove.business_domain = domain.replace('*.', '').replace('www.', '');
            finalHost.groove.business_domain_extract_by_cert = 1;
            promiseDomain = similarWeb.getDomainInfo(finalHost.groove.business_domain).then(info => {
              success += 1;
              console.log('done', finalHost.groove.business_domain, ' - count', success);
              finalHost.groove.similar_web = info;
              finalHost.groove.domain_info_extract_by_similar_web = 1;
            }).catch(err => {
              error += 1;
              console.log('error', err.statusCode);
            });
            promiseContact = Contact.searchContactFromWebsite(finalHost.groove.business_domain).then(contact => {
              console.log('done contact', contact);
              finalHost.groove.contact = contact;
            }).catch(err => {
              console.log('error contact', err.message);
            });
            promiseWhois = Contact.getDomainRegisterInfoFromWhois(finalHost.groove.business_domain).then(contact => {
              finalHost.groove.whois = contact;
            }).catch(err => {
              console.log('error contact', err.message);
            });
          } else {
            finalHost.groove.business_domain = null;
            finalHost.groove.business_domain_extract_by_cert = 0;
          }
          finalHostData.push(finalHost);
          promises.push(promiseDomain);
          promises.push(promiseContact);
          promises.push(promiseWhois);
        });

        // const domains = finalHostData.map(host => {
        //   const domain = KeyObject.getPropertyByKeyPath(host, ['ssl', 'cert', 'subject', 'CN']);
        //   if (typeof domain === 'string') {
        //     return domain.replace('*.', '').replace('www.', '');
        //   }
        //   return domain;
        // });
        // fs.writeFile(
        //   "./domains.json",
        //   JSON.stringify(domains),
        //   "utf8",
        //   () => console.log("done domains.json")
        // );
    
        console.log('before', hostArraySet.length, '- after', hostArraySetSuccessful.length);
        console.log('final data', finalHostData.length);
  
        Promise.all(promises).then(() => {
          console.log('similar web:', success);
          console.log('error', error);
          similarWeb.destroyAgent();
          resolve(finalHostData);
        });
      });
    });
  }
  
  buildShodanBulk(hostData, indexName, type) {
    const bulk = [];
    const test = [];
    const ip = [];
    hostData.map(match => {
      if (match && match.ip_str) {
        bulk.push({
          index: {
            _index: indexName,
            _type: type,
            _id: `shodan_${match.ip_str}_${match.port}`
          }
        });
        bulk.push(match);
        test.push(`shodan_${match.ip_str}_${match.port}`);
        ip.push(match.ip_str)
      };
    });
    fs.writeFile(
      "./ip.json",
      JSON.stringify(ip),
      "utf8",
      () => console.log("done ip.json")
    );
    console.log('unique', _.uniq(test).length);
    return bulk;
  };
}

module.exports = ShodanElasticSearch;