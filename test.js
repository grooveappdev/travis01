const _ = require('lodash');
const request = require('request-promise');

var options = {
  uri: 'http://dummy.restapiexample.com/api/v1/employees',
  json: true,
};
request(options).then(data => {
  console.log(data.map(emp => emp.employee_name).join(', '))
});
console.log('lodash', _.isEmpty(2));
console.log('TEST TRAVIS')