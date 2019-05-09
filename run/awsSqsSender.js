const SQS = require('../lib/AwsSqs');

const awsSqs = new SQS();

const queueName = "test.fifo";
const data = [1,2,3,4,5,6];

awsSqs.createQueue(queueName).then(res => {
  var params = {
    entries: data,
    groupId: 'test',
    queueUrl: res.QueueUrl
  };
  return awsSqs.sendMessageBatch(params).then(data => {
    console.log("Sent message with payload", data);
  });
})

// const queueUrl = 'https://sqs.ap-southeast-1.amazonaws.com/784184982766/van.fifo';
// awsSqs.deleteQueue(queueUrl).then(res => console.log(res));