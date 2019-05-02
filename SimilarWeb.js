const Bottleneck = require('bottleneck');
const _ = require("lodash");
// const fs = require("fs");
const request = require("request-promise");
const TorAgent = require('toragent');

class SimilarWeb {
  constructor() {
    this.agent = null;
    this.maxRetry = 10;

    this.limiter = new Bottleneck({
      minTime: 1000,
      maxConcurrent: 10
    });
  }
  initAgent() {
    return TorAgent.create().then(agent => {
      this.agent = agent;
      return agent;
    });
  }
  getDomainInfo(domain) {
    let count = 0;
    const maxRetry = this.maxRetry;
    const similarWebReq = () => {
      return this.agent.rotateAddress().then(() => {
        console.log('rotate agent')
        const agent = _.cloneDeep(this.agent);
        return request({
          // uri: `https://api.similarweb.com/SimilarWebAddon/${domain}/all`,
          uri: 'http://ip-api.com/json',
          json: true,
          agent,
          timeout: 60000
        }).catch(err => {
          count += 1;
          console.log('partial error', count)
          if (count < maxRetry) {
            return similarWebReq();
          } else {
            return Promise.reject(err);
          }
        });
      })
    }
    return similarWebReq();
  }
  destroyAgent() {
    if (this.agent) {
      return this.agent.destroy();
    }
    return Promise.resolve();
  }
}

const similar = new SimilarWeb();
similar.initAgent().then(() => {
  console.log('create agent')
  similar.getDomainInfo('google.com').then(info => console.log('info1', info))
  similar.getDomainInfo('google.com').then(info => console.log('info2', info))
});

module.exports = SimilarWeb;