require('dotenv').config()
const fs = require("fs");
const _ = require("lodash");
const ShodanRequest = require("../lib/ShodanRequest");
const ShodanElasticSearch = require("../lib/ShodanElasticSearch");
// const Queue = require('./awsSqsReceiver');

const shodanReq = new ShodanRequest({
  shodanToken: process.env.SHODAN_TOKEN,
  minTime: 2000,
  maxConcurrent: 8
});

const shodanES = new ShodanElasticSearch({
  host:
    "https://search-asearchtool-yky3obkk6kzzx2dxrbkmlnqk3e.ap-southeast-1.es.amazonaws.com",
  requestTimeout: 180000
});

const UNUSED_PROPERTIES = [
  "http.html",
  "http.favicon",
  "ssl.cert.serial",
  "ssl.chain",
  "ssl.dhparams.generator"
];

const keywords = ['wsgi', 'country:GB', 'port:443'];
shodanES
  .createIndexIfNotExist("van_test")
  .then(() =>
    shodanReq.getHosts(keywords.join(' '), {
      timeout: 120000
    }, 3)
  )
  .then(data => {
    const hostData = shodanES.purifyData(data, UNUSED_PROPERTIES)
    return shodanES.batchInsert(hostData, 'van_test', 'host', keywords[0])
  })
  .then(() => {
    console.log('DONE');
    // message.ack().then(data => {
    //   console.log('ack', data)
    //   process.exit(0);
    // });
  });

// Queue.receiveMessage().then(message => {
//   console.log('receive', message.Body)
  
// });

