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

  _getHostPerPage(query, searchOpts = {}, page) {
    if (page) {
      return shodan.search(query, this.shodanToken, {
        ...searchOpts,
        page
      }).then(result => {
        if (result.matches) {
          return Promise.resolve({
            page,
            hosts: result.matches,
            error: null,
          });
        } else {
          console.log('error', page, 'No Data');
          return Promise.resolve({
            page,
            hosts: null,
            error: 'No Data'
          });
        }
      }).catch(error => {
        console.log('error', page, error);
        return Promise.resolve({
          page,
          hosts: null,
          error
        });
      });
    } else {
      console.log('error', page, 'No Page');
      return Promise.resolve({
        page,
        hosts: null,
        error: 'No Page'
      });
    }
  }

  _getHostWithRetry(query, searchOpts = {}, page, retry = 0, time = 0, errorPage) {
    if (time > retry) {
      return errorPage;
    } else {
      if (time > 0) {
        console.log(`retry ${time} time on page ${page}`);
      }
      return this._getHostPerPage(query, searchOpts, page).then(hostPage => {
        if (hostPage.error === null) {
          return hostPage;
        } else {
          return this._getHostWithRetry(query, searchOpts, page, retry, time + 1, hostPage);
        }
      });
    }
  }

  getHosts(query, searchOpts = {}, retry = 0) {
    const shodanHostPageSet = {};
    return this.getHostCount(query, searchOpts).then(count => {
      console.log('count', count)
      const pageCount = Math.ceil(count / 100);
      const pageArray = this.createPageArray(pageCount);
      const getHostsRequests = pageArray.map(page => this.limiter.schedule(() => {
        return this._getHostWithRetry(query, searchOpts, page, retry);
      }));
      return Promise.all(getHostsRequests).then(hostPageArr => {
        hostPageArr.map(entry => {
          shodanHostPageSet[entry.page] = entry;
        });
        return shodanHostPageSet;
      });
    });
  }
}

module.exports = ShodanRequest;