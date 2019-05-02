const request = require("request-promise");
const Bottleneck = require('bottleneck');
const shodan = require("shodan-client");
const fs = require("fs");

class ShodanRequest {
  constructor(options) {
    this.minTime = options.minTime || 0;
    this.maxConcurrent = options.maxConcurrent || null;
    this.shodanToken = options.shodanToken || '';

    this.limiter = new Bottleneck({
      minTime: this.minTime,
      maxConcurrent: this.maxConcurrent
    });
  }

  createPageArray(pageCount) {
    const pageArr = [];
    for (let page = 1; page <= pageCount; page += 1) {
      pageArr.push(page);
    }
    return pageArr;
  }

  getHostCount(query, searchOpts = {}) {
    return shodan.count(query, this.shodanToken, searchOpts).then(result => result.total || 0);
  }

  getHosts(query, searchOpts = {}) {
    return this.getHostCount(query, searchOpts).then(count => {
      const shodanHostPageSet = {};
      const pageCount = Math.ceil(count / 100);
      const pageArray = this.createPageArray(pageCount);
      const getHostPerPage = page => this.limiter.schedule(() => {
        if (page) {
          return shodan.search(query, this.shodanToken, {
            ...searchOpts,
            page
          }).then(result => {
            if (result.matches) {
              shodanHostPageSet[page] = {
                hosts: result.matches,
                error: null,
              };
              return Promise.resolve('done');
            } else {
              console.log('error', page, 'No Data');
              shodanHostPageSet[page] = {
                hosts: null,
                error: 'No Data'
              };
              return Promise.resolve('error');
            }
          }).catch(error => {
            console.log('error', page, error);
            shodanHostPageSet[page] = {
              hosts: null,
              error
            };
            return Promise.resolve('error');
          });
        } else {
          console.log('error', page, 'No Page');
          shodanHostPageSet[page] = {
            hosts: null,
            error: 'No Page'
          };
          return Promise.resolve('No Page');
        }
      });
      const getHostsRequests = pageArray.map(page => getHostPerPage(page));
      return Promise.all(getHostsRequests).then(() => shodanHostPageSet);
    });
  }
}

module.exports = ShodanRequest;