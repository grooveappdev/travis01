require('dotenv').config()
const fs = require("fs");
const _ = require("lodash");
const ShodanElasticSearch = require("../lib/ShodanElasticSearch");
const ShodanRequest = require("../lib/ShodanRequest");
const SQS = require('../lib/AwsSqs');
const config = require('../config.json');

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

const EDIT_PROPERTIES = [
  'CategoryRank.Rank',
  'CountryRank.Rank',
  'GlobalRank.Rank',
];
const queueURL = `${config.queueHost}/${config.queueDomainName}`;

awsSqs.receiveMessage(queueURL).then(message => {
  console.log('receive', message);
  const domainChunk = awsSqs.parseMessage(message.Body);
  return Promise.all(domainChunk.map(chunk => {
    return shodanReq.exploreDomain(chunk.domain, EDIT_PROPERTIES).then(extraInfo => {
      extraInfo.hostId = chunk.hostId;
      return extraInfo;
    })
  })).then(partialHostList => {
    return shodanES.batchUpdate(partialHostList, config.esIndexName, 'host');
  }).then(() => {
    console.log('update completed')
    message.ack().then(() => {
      console.log('message ACK');
      process.exit(0);
    });
  });
}).catch(err => console.log(err.message))