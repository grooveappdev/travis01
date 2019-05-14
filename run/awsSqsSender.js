const SQS = require('../lib/AwsSqs');
const config = require('../config.json');

const awsSqs = new SQS();

const queueName = 'test2.fifo';
const data = [1,2,3,4];

// awsSqs.createQueue(queueName).then(res => {
//   var params = {
//     entries: data,
//     groupId: 'test',
//     queueUrl: res.QueueUrl
//   };
//   return awsSqs.sendMessageBatch(params).then(data => {
//     console.log("Sent message with payload", data);
//   });
// });

const queueUrl = 'https://sqs.ap-southeast-1.amazonaws.com/784184982766/domain.fifo';

// awsSqs.deleteQueue(queueUrl).then(res => console.log(res));

awsSqs.getMessageCount(queueUrl).then(res => console.log(res));