const SQS = require('../lib/AwsSqs');
const config = require('../config.json');

const awsSqs = new SQS();

const queueURL = `${config.queueHost}/keyword.fifo`;

awsSqs.receiveMessage(queueURL).then(data => {
  console.log(data);
  data.ack().then(() => console.log('ok'));
}).catch(err => console.log(err.message))
