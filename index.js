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
// const UNUSED_PROPERTIES = [
//   "http", "ssl"
// ];
shodanES
  .createIndexIfNotExist("van_test")
  .then(() =>
    shodanReq.getHosts("csrftoken country:GB port:443", {
      timeout: 120000
    })
  )
  .then(data => shodanES.parseShodanHostData(data, UNUSED_PROPERTIES))
  .then(hostData => {
    fs.writeFile(
      "./host.json",
      JSON.stringify(hostData.slice(0, 500).map(host => host.info)),
      "utf8",
      () => console.log("done host.json")
    );

    const body = shodanES.buildShodanBulk(hostData, "van_test", "host");
    console.log('final body', body.length)
    shodanES.client
      .bulk({
        body
      })
      .then(res => {
        fs.writeFile(
          "./data.json",
          JSON.stringify(res.items.map(item => item.index.error || null)),
          "utf8",
          () => console.log("done data.json")
        );
        fs.writeFile(
          "./test.json",
          JSON.stringify(hostData.map(host => host.groove.whois)),
          "utf8",
          () => console.log("done test.json")
        );
      })
      .catch(err => console.log("error", err));
  });
