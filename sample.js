const _ = require("lodash");
const request = require("request-promise");
const shodan = require("shodan-client");
const fs = require("fs");
const Bottleneck = require('bottleneck');
const ShodanRequest = require('./ShodanRequest');

new ShodanRequest({
  shodanToken: 'Uya3hUc1ocXUhRSxm9aqyA8xPLZRRKAj',
  minTime: 3000,
  maxConcurrent: 4
}).getHosts('csrftoken country:GB port:443', {
  timeout: 60000
}).then(res => {
  fs.writeFile('./data.json', JSON.stringify(res), 'utf8', () => console.log('done', res));
});

var elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({ host: "http://localhost:9200" });

const limiter = new Bottleneck({
  minTime: 500,
  maxConcurrent: 5
});

const pro = (name) => new Promise(res => {
  setTimeout(() => res(name), 3000);
});

const sche = (name) => limiter.schedule(() => {
  const arr = [pro(name),pro(name),pro(name),pro(name)]
  return Promise.all(arr);
});

// sche('TQV').then(res => console.log(res))
// sche('TQV').then(res => console.log(res))
// sche('TQV').then(res => console.log(res))
// sche('TQV').then(res => console.log(res))
// sche('TQV').then(res => console.log(res))
// const AWS = require('aws-sdk');
// AWS.config.loadFromPath(options.config.keyFilename);
// AWS.config.update({ region: options.config.region });
// const awsS3 = new AWS.S3();

// var options = {
//   uri: 'https://api.shodan.io/shodan/host/search?key=Uya3hUc1ocXUhRSxm9aqyA8xPLZRRKAj&query=csrftoken',
//   json: true,
// };
// request(options).then(data => {
//   fs.writeFile('./data.json', JSON.stringify(data), 'utf8', () => console.log('done', data.matches.length));
// });
const shodanSearch = () => {

}
const bulkBuilder = data => {
  const bulk = [];
  data.map(match => {
    bulk.push({
      index: {
        _index: "shodan_ip",
        _type: "host",
        _id: `shodan_${match.ip_str}_${match.port}`
      }
    });
    bulk.push(match);
  });
  return bulk;
};

// 100 records per request
const searchOpts = {
  timeout: 60000,
  page: 17
};
// shodan.search('csrftoken country:GB port:443', 'Uya3hUc1ocXUhRSxm9aqyA8xPLZRRKAj', searchOpts).then(res => {
//   const matches = res.matches;
//   // const data = {
//   //   matches,
//   //   facets: res.facets
//   // }
//   // const infos = res.matches.map(match => match.ip_str);
//   // res.matches = {};

//   console.log(res)
//   // const body = bulkBuilder(matches);
//   // client.bulk({
//   //   body
//   // }, function (err, resp) {
//   //     console.log(err, resp)
//   // });
//   // fs.writeFile('./data.json', JSON.stringify(infos), 'utf8', () => console.log('done', matches.length));
// })

// client.cluster.health({},function(err, resp, status) {
//   console.log("-- Client Health --", resp);
// });
// client.indices.create({  
//   index: 'shodan_ip'
// },function(err,resp,status) {
//   if(err) {
//     console.log(err);
//   }
//   else {
//     console.log("create",resp);
//   }
// });
// client.index({
//   index: 'shodan_ip',
//   type: 'host',
//   body: {}
// },function(err,resp,status) {
//     console.log(resp);
// });
// client.count(
//   {
//     index: "shodan_ip",
//     type: "host",
//     body: {
//       query: { 'match': { 'port' : 443} }
//     }
//   },
//   function(err, resp, status) {
//     console.log("host", resp);
//   }
// );
// client.search({
//   index: 'shodan_ip',
//   type: 'host',
//   body: {
//     query: {
//       match: { "isp": "Czech" }
//     },
//   }
// },function (error, response,status) {
//     if (error){
//       console.log("search error: "+error)
//     }
//     else {
//       console.log("--- Response ---");
//       console.log(response);
//       console.log("--- Hits ---");
//       response.hits.hits.forEach(function(hit){
//         console.log(hit);
//       })
//     }
// });
// client.get({
//   index: 'shodan_ip',
//   type: 'host',
//   id: 'QWkeU2oBpY6_f4WjVqnZ'
// }, function (error, response) {
//   console.log(response);
// });
// client.deleteByQuery({
//   index: 'shodan_ip',
//   type: 'host',
//   body: {
//     query: { 'match_all': {} }
//   }
// },function(err,resp,status) {
//     console.log(err, resp);
// });

// console.log("lodash", _.isEmpty(2));
// console.log("TEST TRAVIS");

shodanES.client.indices.delete({
  index: 'van_test'
}, function(err, res) {

  if (err) {
      console.error(err.message);
  } else {
      console.log('Indexes have been deleted!');
  }
});
