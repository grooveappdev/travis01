require('dotenv').config()
const fs = require("fs");
const _ = require("lodash");
const ShodanRequest = require("./lib/ShodanRequest");
const ShodanElasticSearch = require("./lib/ShodanElasticSearch");
const config = require('./config.json');
// const Queue = require('./awsSqsReceiver');

const shodanReq = new ShodanRequest({
  shodanToken: process.env.SHODAN_TOKEN,
  minTime: 2000,
  maxConcurrent: 8
});

const shodanES = new ShodanElasticSearch({
  host: config.esHost,
  requestTimeout: 180000
});

const UNUSED_PROPERTIES = [
  "http.html",
  "http.favicon",
  "ssl.cert.serial",
  "ssl.chain",
  "ssl.dhparams.generator"
];
const EDIT_PROPERTIES = [
  'groove.similar_web.CategoryRank.Rank',
  'groove.similar_web.CountryRank.Rank',
  'groove.similar_web.GlobalRank.Rank',
  'groove.similar_web.SimilarSites.Rank',
  'groove.similar_web.SimilarSitesByRank.Rank'
];

const keywords = ['wsgi', 'country:GB', 'port:443'];
// shodanES
//   .createIndexIfNotExist(config.esIndexName)
//   .then(() =>
//     shodanReq.getHosts(keywords.join(' '), {
//       timeout: 120000
//     }, 3)
//   )
//   .then(data => shodanES.parseShodanHostData(data, UNUSED_PROPERTIES, EDIT_PROPERTIES))
//   .then(hostList => shodanES.batchInsert(hostList, config.esIndexName, 'host', keywords[0]))
//   .then(() => {
//     console.log('DONE');
//     // message.ack().then(data => {
//     //   console.log('ack', data)
//     //   process.exit(0);
//     // });
//   });
shodanES.client.search({
  index: 'shodan_host',
  type: 'host',
  body: {
    query: {
      wildcard: { "groove.business_domain": "*uk" } // match, term, match_all, wildcard
    },
  }
},function (error, response,status) {
    if (error){
      console.log("search error: "+error)
    }
    else {
      // console.log("--- Response ---");
      // console.log(response);
      console.log("--- Hits ---");
      console.log(response.hits.hits.length)
      // response.hits.hits.forEach(function(hit){
      //   console.log(hit);
      // })
    }
});

// Queue.receiveMessage().then(message => {
//   console.log('receive', message.Body)
  
// });

// console.log(process.env.SHODAN_TOKEN)

// shodanES
//   .createIndexIfNotExist("shodan_host")
//   .then(() => {
//     return shodanES.client
//     .reindex({
//       body: {
//         source: {
//           index: config.esIndexName,
//           query: {
//             "match_all": {}
//           }
//         },
//         dest: {
//           index: "shodan_host"
//         },
//       },
//     })
//     .then(res => {
//       console.log('res', res)
//     })
//     .catch(err => console.log("error", err));
//   });

