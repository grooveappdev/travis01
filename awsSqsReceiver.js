const AWS = require('aws-sdk');

AWS.config.update({
  "accessKeyId": process.env.AWS_ACCESS_KEY,
  "secretAccessKey": process.env.AWS_SECRET_KEY,
  "region": "ap-southeast-1"
});

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueURL = 'https://sqs.ap-southeast-1.amazonaws.com/784184982766/van-test';

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
    VisibilityTimeout: 120,
    WaitTimeSeconds: 20
  };

  return sqs.receiveMessage(params, function (err, data) {
    if (err) {
      console.log("Receive Error", err);
      return reject(err);
    }
    console.log('***************************************')
    if (data && data.Messages && data.Messages[0]) {
      const message = data.Messages[0];
      message.ack = () => new Promise((ackRes, ackRej) => {
        const deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: message.ReceiptHandle
        };
        sqs.deleteMessage(deleteParams, function(err, data) {
          if (err) {
            ackRej(err);
          } else {
            ackRes(data);
          }
        });
      });
      return resolve(message);
    }
    return reject(new Error('Queue Empty'))
  });
});

module.exports = {
  receiveMessage
};

// receiveMessage().then(data => {
//   console.log(data);
//   data.ack();
// }).catch(err => console.log(err.message))
