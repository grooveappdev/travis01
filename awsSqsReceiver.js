const AWS = require('aws-sdk');
const awsconfig = require('./awsconfig.json')

AWS.config.update(awsconfig.auth);

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueURL = awsconfig.queueUrl;

const receiveMessage = () => new Promise((resolve, reject) => {
  const params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 20
  };

  return sqs.receiveMessage(params, function (err, data) {
    if (err) {
      console.log("Receive Error", err);
      return reject(err);
    } else if (data) {
      console.log('Received message:', data);
      return resolve(data);
    }
  });
});

module.exports = {
  receiveMessage
};
