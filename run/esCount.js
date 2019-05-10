const ShodanElasticSearch = require("../lib/ShodanElasticSearch");
const config = require('../config.json');

const shodanES = new ShodanElasticSearch({
  host: config.esHost,
  requestTimeout: 180000
});

// client.cluster.health({},function(err, resp, status) {
//   console.log("-- Client Health --", resp);
// });

shodanES.count('van_test', 'host').then(count => console.log("count", count));