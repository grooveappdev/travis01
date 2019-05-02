var elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({
  host: "https://search-asearchtool-yky3obkk6kzzx2dxrbkmlnqk3e.ap-southeast-1.es.amazonaws.com",
  requestTimeout: 180000,
});

// client.cluster.health({},function(err, resp, status) {
//   console.log("-- Client Health --", resp);
// });

// client.indices.exists({  
//   index: 'shodan_host'
// }).then(exists => {
//   if (exists) {
//     return Promise.resolve('index existed');
//   } else {
//     return client.indices.create({  
//       index: 'shodan_host'
//     });
//   }
// });

// client.count(
//   {
//     index: "shodan_host",
//     type: "host",
//     body: {
//       query: { 'match_all': {} }
//     }
//   }
// ).then(count => console.log("count", count));

// client.deleteByQuery({
//   index: 'shodan_host',
//   type: 'host',
//   body: {
//     query: { 'match_all': {} }
//   }
// },function(err,resp,status) {
//     console.log(err, resp);
// });

client.indices.delete({
  index: 'van_test'
}, function(err, res) {

  if (err) {
      console.error(err.message);
  } else {
      console.log('Indexes have been deleted!');
  }
});