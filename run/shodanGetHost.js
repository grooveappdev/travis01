require('dotenv').config()
const fs = require("fs");
const _ = require("lodash");
const ShodanRequest = require("../lib/ShodanRequest");
const ShodanElasticSearch = require("../lib/ShodanElasticSearch");
const GoogleBigQuery = require("../lib/BigQuery");
const SQS = require('../lib/AwsSqs');
const config = require('../config.json');
const schema = require('../schema/shodan')

const awsSqs = new SQS();
const shodanReq = new ShodanRequest({
  shodanToken: process.env.SHODAN_TOKEN,
  minTime: 2000,
  maxConcurrent: 8
});
const shodanES = new ShodanElasticSearch({
  host: config.esHost,
  requestTimeout: 180000
});
const bigQuery = new GoogleBigQuery();

const UNUSED_PROPERTIES = [
  "http.html",
  "http.favicon",
  "ssl.cert.serial",
  "ssl.chain",
  "ssl.dhparams.generator"
];
const queueURL = `${config.queueHost}/${config.queueKeywordName}`;

awsSqs.receiveMessage(queueURL).then(message => {
  console.log('receive', message.Body);
  const keyword = awsSqs.parseMessage(message.Body);
  const fullKeyword = [keyword, 'country:GB', 'port:443'];
  bigQuery.initClient()
    .then(() => {
      return bigQuery.createTableIfNotExist('testing', 'shodan', schema);
    })
    .then(() => {
      return shodanReq.getHosts(fullKeyword.join(' '), {
        timeout: 120000
      }, 3)
    })
    .then(data => {
      const hostList = shodanReq.purifyData(data, keyword, UNUSED_PROPERTIES);
      const domainList = hostList.map(host => ({
        hostId: host.hostId,
        domain: host.business_domain
      }));
      const domainChunkList = _.chunk(domainList, 15);
      const insertQueue = awsSqs.createQueue(config.queueDomainName).then(res => {
        var params = {
          entries: domainChunkList,
          groupId: 'domain',
          queueUrl: res.QueueUrl,
          distributeGroup: true
        };
        return awsSqs.sendMessageBatch(params).then(data => {
          console.log("Sent message with payload", data);
        });
      });
      const bigQueryData = bigQuery.parseBigQueryData(hostList);
      const insertBigQuery = bigQuery.insertDataAsChunk('testing', 'shodan', bigQueryData, 100);
      return Promise.all([insertQueue, insertBigQuery]);
    })
    .then(() => {
      console.log('DONE');
      message.ack().then(data => {
        console.log('ack', data)
        process.exit(0);
      });
    })
    .catch(err => {
      fs.writeFile(
        "./bigquery.json",
        JSON.stringify(err),
        "utf8",
        () => console.log("done bigquery.json")
      );
    });
});

