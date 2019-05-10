const ShodanElasticSearch = require("../lib/ShodanElasticSearch");
const config = require('../config.json');

const shodanES = new ShodanElasticSearch({
  host: config.esHost,
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

shodanES.deleteIndex(config.esIndexName).then(() => console.log('Indexes have been deleted!'));