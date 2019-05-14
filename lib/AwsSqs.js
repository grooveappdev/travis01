const AWS = require('aws-sdk');
require('dotenv').config()
const uuid = require('uuid/v4');
const _ = require("lodash");
const Bottleneck = require('bottleneck');

AWS.config.update({
  "accessKeyId": process.env.AWS_ACCESS_KEY,
  "secretAccessKey": process.env.AWS_SECRET_KEY,
  "region": "ap-southeast-1"
});

class AwsSqs {
  constructor() {
    this.sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
  }

  convertToBody(message) {
    if (_.isNil(message)) {
      throw new Error('Message must not be empty');
    }
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return typeof message.toString === 'function' ? message.toString() : message;
  }
  parseMessage(body) {
    try {
      return JSON.parse(body);
    } catch(err) {
      return body;
    }
  }
  createQueue(queueName) {
    return new Promise((resolve, reject) => {
      const createQueueParams = {
        QueueName: queueName,
        Attributes: {
          FifoQueue: 'true',
          ContentBasedDeduplication: 'true'
        }
      }
      this.sqs.createQueue(createQueueParams, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }
  deleteQueue(queueUrl) {
    return new Promise((resolve, reject) => {
      var params = {
        QueueUrl: queueUrl
      };
      this.sqs.deleteQueue(params, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }
  sendMessage({ body, groupId, queueUrl }) {
    return new Promise((resolve, reject) => {
      const messageParams = {
        QueueUrl: queueUrl,
        MessageBody: this.convertToBody(body),
        MessageDeduplicationId: uuid(),
        MessageGroupId: groupId
      }
      this.sqs.sendMessage(messageParams, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }
  _sendMessageBatch({ entries, groupId, queueUrl, distributeGroup }) {
    return new Promise((resolve, reject) => {
      const distributor = 10;
      let index = 0;
      const messageEntries = entries.map(entry => {
        index = index > distributor - 1 ? 1 : index + 1;
        const id = uuid();
        const groupDistributed = distributeGroup ? `${groupId}_${index}` : groupId;
        return {
          Id: id,
          MessageBody: this.convertToBody(entry),
          MessageDeduplicationId: id,
          MessageGroupId: groupDistributed,
        }
      });
      var messageParams = {
        Entries: messageEntries,
        QueueUrl: queueUrl
      };
      this.sqs.sendMessageBatch(messageParams, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }
  sendMessageBatch({ entries, groupId, queueUrl, distributeGroup = false }) {
    const entriesChunk = _.chunk(entries, 10);
    const limiter = new Bottleneck({
      maxConcurrent: 2
    });
    return Promise.all(entriesChunk.map(chunk => {
      const params = {
        entries: chunk,
        groupId,
        queueUrl,
        distributeGroup
      }
      return limiter.schedule(() => this._sendMessageBatch(params));
    }));
  }
  deleteMessage({ receiptHandle, queueUrl }) {
    return new Promise((resolve, reject) => {
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle
      };
      this.sqs.deleteMessage(deleteParams, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }
  receiveMessage(queueUrl) {
    const that = this;
    return new Promise((resolve, reject) => {
      const params = {
        QueueUrl: queueUrl,
        AttributeNames: ['All'],
        MessageAttributeNames: ['All'],
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 120,
        WaitTimeSeconds: 20
      };
      this.sqs.receiveMessage(params, (err, result) => {
        if (err) {
          return reject(err);
        } else {
          if (result && result.Messages && result.Messages[0]) {
            const message = result.Messages[0];
            message.ack = () => that.deleteMessage({
              receiptHandle: message.ReceiptHandle,
              queueUrl
            });
            return resolve(message);
          }
          return reject(new Error('Queue Empty'))
        }
      });
    });
  }
  getMessageCount(queueUrl) {
    return new Promise((resolve, reject) => {
      var params = {
        QueueUrl: queueUrl,
        AttributeNames: [
          'ApproximateNumberOfMessages'
        ]
      };
      this.sqs.getQueueAttributes(params, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      });
    });
  }
}

module.exports = AwsSqs;