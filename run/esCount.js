const ShodanElasticSearch = require("../lib/ShodanElasticSearch");

const shodanES = new ShodanElasticSearch({
  host:
    "https://search-asearchtool-yky3obkk6kzzx2dxrbkmlnqk3e.ap-southeast-1.es.amazonaws.com",
  requestTimeout: 180000
});

// client.cluster.health({},function(err, resp, status) {
//   console.log("-- Client Health --", resp);
// });

shodanES.count('van_test', 'host').then(count => console.log("count", count));