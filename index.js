require('dotenv').config()
const fs = require("fs");
const _ = require("lodash");
const ShodanRequest = require("./lib/ShodanRequest");
const ShodanElasticSearch = require("./lib/ShodanElasticSearch");
const GoogleBigQuery = require("./lib/BigQuery");
const config = require('./config.json');

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
const EDIT_PROPERTIES = [
  'CategoryRank.Rank',
  'CountryRank.Rank',
  'GlobalRank.Rank',
];

const key = 'csrftoken';
const keywords = [key, 'country:GB', 'port:443'];

const domains = [
  'pipelineservicesuk.com',
  'mobile.shearer-candles.com',
  'plscivilengineering.com',
  'enigmapowertrain.co.uk',
  'niconat.net',
  'graphic.plc.uk',
  'iprojects.costain.com',
  'millerextra.com',
  'blackmore.co.uk',
  'walkerhamill.com',
]

Promise.all(domains.map(d => shodanReq.exploreDomain(d, EDIT_PROPERTIES).then(extra => {
  extra.hostId = d;
  return extra;
})))
  .then(data => {
    console.log('DONE');
    const bigQueryData = bigQuery.parseBigQueryData(data);
    bigQuery.initClient().then(() => {
      bigQuery.insertDataAsChunk('van_test', 'extra', bigQueryData, 100).then(res => {
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
    });
    fs.writeFile(
      "./data.json",
      JSON.stringify(data),
      "utf8",
      () => console.log("done data.json")
    );
  });
// shodanReq.exploreDomain('pipelineservicesuk.com', EDIT_PROPERTIES)
//   .then(data => {
//     console.log('DONE');
//     fs.writeFile(
//       "./data.json",
//       JSON.stringify(data),
//       "utf8",
//       () => console.log("done data.json")
//     );
//     // const finalData = shodanReq.purifyData(data, key, UNUSED_PROPERTIES);
//     // const bigQueryData = bigQuery.parseBigQueryData(finalData);
//     // bigQuery.initClient().then(() => {
//     //   bigQuery.insertDataAsChunk('van_test', 'shodan', bigQueryData, 100).then(res => {
//     //     console.log(res);
//     //     fs.writeFile(
//     //       "./bigquery.json",
//     //       JSON.stringify(res),
//     //       "utf8",
//     //       () => console.log("done bigquery.json")
//     //     );
//     //   }).catch(err => {
//     //     fs.writeFile(
//     //       "./bigquery.json",
//     //       JSON.stringify(err),
//     //       "utf8",
//     //       () => console.log("done bigquery.json")
//     //     );
//     //   })
//     // });
//   });

// shodanES.client.search({
//   index: 'shodan_host',
//   type: 'host',
//   body: {
//     query: {
//       wildcard: { "groove.business_domain": "*uk" } // match, term, match_all, wildcard
//     },
//   }
// },function (error, response, status) {
//     if (error){
//       console.log("search error: "+error)
//     }
//     else {
//       // console.log("--- Response ---");
//       // console.log(response);
//       console.log("--- Hits ---");
//       console.log(response.hits.hits.length)
//       // response.hits.hits.forEach(function(hit){
//       //   console.log(hit);
//       // })
//     }
// });

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

