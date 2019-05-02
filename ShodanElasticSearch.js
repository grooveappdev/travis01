const Bottleneck = require('bottleneck');
const _ = require("lodash");
const fs = require("fs");
const elasticsearch = require("elasticsearch");
const KeyObject = require('./KeyObject');
const SimilarWeb = require('./SimilarWeb');

const similarWeb = new SimilarWeb();

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
              "index.mapping.total_fields.limit": 2000,
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
        if (_.isEmpty(item)) {
          console.log(item)
        }
        return _.isEmpty(item) === false;
      });
      const hostData = _.flatten(hostArraySetSuccessful);
      const finalHostData = [];
      const promises = [];
      let count = 0;
      similarWeb.initAgent().then(() => {
        hostData.map(host => {
          let promise = Promise.resolve(null);
          const finalHost = KeyObject.deleteKeysFromObject(host, unusedProps);
          finalHost.groove = {};
          const domain = KeyObject.getPropertyByKeyPath(host, ['ssl', 'cert', 'subject', 'CN']);
          if (typeof domain === 'string') {
            finalHost.groove.business_domain = domain.replace('*.', '');
            finalHost.groove.business_domain_extract_by_cert = 1;
            promise = similarWeb.getDomainInfo(finalHost.groove.business_domain).then(info => {
              count += 1;
              console.log('done', finalHost.groove.business_domain, ' - count', count);
              finalHost.groove.similar_web = info;
              finalHost.groove.domain_info_extract_by_similar_web = 1;
            }).catch(err => {
              
            });
          } else {
            finalHost.groove.business_domain = null;
            finalHost.groove.business_domain_extract_by_cert = 0;
          }
          finalHostData.push(finalHost);
          promises.push(promise);
        });
        const domains = finalHostData.map(host => {
          const domain = KeyObject.getPropertyByKeyPath(host, ['ssl', 'cert', 'subject', 'CN']);
          if (typeof domain === 'string') {
            return domain.replace('*.', '');
          }
          return domain;
        });
        fs.writeFile(
          "./domains.json",
          JSON.stringify(domains),
          "utf8",
          () => console.log("done domains.json")
        );
    
        console.log('before', hostArraySet.length, '- after', hostArraySetSuccessful.length);
        console.log('final data', finalHostData.length);
  
        Promise.all(promises).then(() => {
          console.log('similar web:', count)
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