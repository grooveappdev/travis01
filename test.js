const _ = require('lodash');
const request = require('request-promise');
const shodan = require('shodan-client');
const fs = require('fs');
// const AWS = require('aws-sdk');
// AWS.config.loadFromPath(options.config.keyFilename);
// AWS.config.update({ region: options.config.region });
// const awsS3 = new AWS.S3();

// var options = {
//   uri: 'http://dummy.restapiexample.com/api/v1/employees',
//   json: true,
// };
// request(options).then(data => {
//   console.log(data.map(emp => emp.employee_name).join(', '));
// });
const searchOpts = {
  facets: 'port:12,country:12',
};
shodan.search('visual basic', '0A37HAs9cJey9gw4W7NfCFwLGk1WmQ0o', searchOpts).then(res => {
  const matches = res.matches.slice(0, 10);
  const data = {
    matches,
    facets: res.facets
  }
  console.log(JSON.stringify(data))
  // fs.writeFile('./data.json', JSON.stringify(data), 'utf8', () => console.log('done'))
  // console.log(util.inspect(res, { depth: 6 }));
})
console.log('lodash', _.isEmpty(2));
console.log('TEST TRAVIS')