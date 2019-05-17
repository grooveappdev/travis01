require('dotenv').config()
const fs = require("fs");
const _ = require("lodash");
const ShodanElasticSearch = require("../lib/ShodanElasticSearch");
const ShodanRequest = require("../lib/ShodanRequest");
const GoogleBigQuery = require("../lib/BigQuery");
const SQS = require('../lib/AwsSqs');
const config = require('../config.json');
const schema = require('../schema/extra')

console.log('TESTTTTT')

const awsSqs = new SQS();
const shodanES = new ShodanElasticSearch({
  host: config.esHost,
  requestTimeout: 180000
});
const shodanReq = new ShodanRequest({
  shodanToken: process.env.SHODAN_TOKEN,
  minTime: 2000,
  maxConcurrent: 8
});
const bigQuery = new GoogleBigQuery();

const EDIT_PROPERTIES = [
  'CategoryRank.Rank',
  'CountryRank.Rank',
  'GlobalRank.Rank',
];
const queueURL = `${config.queueHost}/${config.queueDomainName}`;

awsSqs.receiveMessage(queueURL).then(message => {
  console.log('receive', message);
  const domainChunk = awsSqs.parseMessage(message.Body);
  bigQuery.initClient()
    .then(() => {
      return bigQuery.createTableIfNotExist('testing', 'extra', schema);
    })
    .then(() => {
      return Promise.all(domainChunk.map(chunk => {
        return shodanReq.exploreDomain(chunk.domain, EDIT_PROPERTIES).then(extraInfo => {
          extraInfo.hostId = chunk.hostId;
          return extraInfo;
        })
      }))
    })
    .then(extraInfoList => {
      const bigQueryData = bigQuery.parseBigQueryData(extraInfoList);
      return bigQuery.insertDataAsChunk('testing', 'extra', bigQueryData, 100).then(res => {
        console.log(res);
        fs.writeFile(
          "./bigquery.json",
          JSON.stringify(res),
          "utf8",
          () => console.log("done bigquery.json")
        );
      }).catch(err => {
        fs.writeFile(
          "./bigquery.json",
          JSON.stringify(err),
          "utf8",
          () => console.log("done bigquery.json")
        );
      })
    }).then(() => {
      console.log('update completed')
      message.ack().then(() => {
        console.log('message ACK');
        process.exit(0);
      });
    });
}).catch(err => console.log(err.message))