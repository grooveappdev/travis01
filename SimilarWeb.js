const Bottleneck = require('bottleneck');
const _ = require("lodash");
// const fs = require("fs");
const request = require("request-promise");
const TorAgent = require('toragent');

class SimilarWeb {
  constructor(options) {
    this.minTime = options.minTime || 0;
    this.maxConcurrent = options.maxConcurrent || null;
    this.maxRetry = options.maxRetry || 5;

    this.agent = null;
    this.limiter = new Bottleneck({
      minTime: this.minTime,
      maxConcurrent: this.maxConcurrent
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
        // console.log('rotate agent')
        return request({
          uri: `https://api.similarweb.com/SimilarWebAddon/${domain}/all`,
          // uri: 'http://ip-api.com/json',
          json: true,
          // resolveWithFullResponse: true,
          agent: this.agent,
          timeout: 60000,
          headers: {
            'Referer': 'chrome-extension://hoklmmgfnpapgjgcpechhaamimifchmp/panel/panel.html'
          },
        }).catch(err => {
          count += 1;
          if (count < maxRetry && err.statusCode >= 500) {
            return similarWebReq();
          } else {
            return Promise.reject(err);
          }
        });
      });
    }
    return this.limiter.schedule(() => {
      return similarWebReq();
    });
  }
  destroyAgent() {
    if (this.agent) {
      return this.agent.destroy();
    }
    return Promise.resolve();
  }
}

// const similar = new SimilarWeb({
//   minTime: 100,
//   maxConcurrent: 20,
//   maxRetry: 5
// });
// similar.initAgent().then(() => {
//   console.log('create agent')
//   similar.getDomainInfo('www.unisalt-uk.com').then(res => console.log('info1', res.statusCode, res.body));
//   // similar.getDomainInfo('google.com').then(info => console.log('info1', info));
//   // similar.getDomainInfo('google.com').then(info => console.log('info2', info));
// });

module.exports = SimilarWeb;