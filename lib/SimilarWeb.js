const Bottleneck = require('bottleneck');
const _ = require("lodash");
// const fs = require("fs");
const request = require("request-promise");
const TorAgent = require('toragent');

class SimilarWeb {
  constructor(options) {
    this.minTime = options.minTime || 0;
    this.maxConcurrent = options.maxConcurrent || null;
    this.maxRetry = options.maxRetry || 0;

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
  _getDomainInfo(domain, time = 0, error) {
    const maxRetry = this.maxRetry;
    if (time > maxRetry || (error && error.statusCode < 500)) {
      return Promise.reject(error);
    } else {
      if (time > 0) {
        console.log(`retry ${time} time on domain ${domain}`);
      }
      // return this.agent.rotateAddress().then(() => {
        
      // });
      return request({
        uri: `https://api.similarweb.com/SimilarWebAddon/${domain}/all`,
        json: true,
        // resolveWithFullResponse: true,
        // agent: this.agent,
        timeout: 30000,
        headers: {
          'Referer': 'chrome-extension://hoklmmgfnpapgjgcpechhaamimifchmp/panel/panel.html'
        },
      }).catch(err => {
        return this._getDomainInfo(domain, time + 1, err);
      });
    }
  }
  getDomainInfo(domain) {
    // return this._getDomainInfo(domain, 0);
    return this.limiter.schedule(() => {
      return this._getDomainInfo(domain, 0);
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