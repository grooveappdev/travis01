const fs = require("fs");
const _ = require("lodash");
const ShodanRequest = require("./ShodanRequest");
var ShodanElasticSearch = require("./ShodanElasticSearch");

const shodanReq = new ShodanRequest({
  shodanToken: "Uya3hUc1ocXUhRSxm9aqyA8xPLZRRKAj",
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
const EDIT_PROPERTIES = [
  'groove.similar_web.CategoryRank.Rank',
  'groove.similar_web.CountryRank.Rank',
  'groove.similar_web.GlobalRank.Rank',
  'groove.similar_web.SimilarSites.Rank',
  'groove.similar_web.SimilarSitesByRank.Rank'
];
// const UNUSED_PROPERTIES = [
//   "http", "ssl"
// ];
const keywords = ['django', 'country:GB', 'port:443'];
shodanES
  .createIndexIfNotExist("van_test")
  .then(() =>
    shodanReq.getHosts(keywords.join(' '), {
      timeout: 120000
    }, 3)
  )
  .then(data => shodanES.parseShodanHostData(data, UNUSED_PROPERTIES, EDIT_PROPERTIES))
  .then(hostData => {
    // fs.writeFile(
    //   "./host.json",
    //   JSON.stringify(hostData.slice(0, 500).map(host => host.info)),
    //   "utf8",
    //   () => console.log("done host.json")
    // );

    const body = shodanES.buildShodanBulk(hostData, "van_test", "host", keywords[0]);
    console.log('final body', body.length)
    shodanES.client
      .bulk({
        body
      })
      .then(res => {
        console.log('DONE');
        fs.writeFile(
          "./data.json",
          JSON.stringify(hostData),
          "utf8",
          () => {
            console.log("done data.json");
            process.exit(0);
          }
        );
        // fs.writeFile(
        //   "./test.json",
        //   JSON.stringify(hostData.map(host => host.groove.whois)),
        //   "utf8",
        //   () => console.log("done test.json")
        // );
      })
      .catch(err => console.log("error", err));
  });

// shodanES
//   .createIndexIfNotExist("shodan_host")
//   .then(() => {
//     return shodanES.client
//     .reindex({
//       body: {
//         source: {
//           index: "van_test",
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

