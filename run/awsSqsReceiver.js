const SQS = require('../lib/AwsSqs');

const awsSqs = new SQS();

const queueURL = 'https://sqs.ap-southeast-1.amazonaws.com/784184982766/test.fifo';

awsSqs.receiveMessage(queueURL).then(data => {
  console.log(data);
  data.ack().then(() => console.log('ok'));
}).catch(err => console.log(err.message))
