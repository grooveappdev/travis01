const SQS = require('../lib/AwsSqs');
const config = require('../config.json');

const awsSqs = new SQS();

const keywords = [
  'csrftoken',
  'mod_wsgi',
  'gunicorn',
  'django_language',
  'wsgi',
  'django'
];

awsSqs.createQueue(config.queueKeywordName).then(res => {
  var params = {
    entries: keywords,
    groupId: 'test',
    queueUrl: res.QueueUrl
  };
  return awsSqs.sendMessageBatch(params).then(data => {
    console.log("Sent message with payload", data);
  });
});