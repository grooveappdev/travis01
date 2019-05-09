const ShodanElasticSearch = require("../lib/ShodanElasticSearch");

const shodanES = new ShodanElasticSearch({
  host:
    "https://search-asearchtool-yky3obkk6kzzx2dxrbkmlnqk3e.ap-southeast-1.es.amazonaws.com",
  requestTimeout: 180000
});

// client.cluster.health({},function(err, resp, status) {
//   console.log("-- Client Health --", resp);
// });

// client.deleteByQuery({
//   index: 'shodan_host',
//   type: 'host',
//   body: {
//     query: { 'match_all': {} }
//   }
// },function(err,resp,status) {
//     console.log(err, resp);
// });

shodanES.deleteIndex('van_test').then(() => console.log('Indexes have been deleted!'));