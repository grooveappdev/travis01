const Crawler = require("crawler");
const whois = require('whois-json');
const _ = require('lodash');
const Bottleneck = require('bottleneck');
// const domains = require('./domains.json');

const findEmailsInHtmlBody = (html) => html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];

const findContactPage = html => html.match(/<a [^>]*\bhref\s*=\s*"[^"]*contact.*?<\/a>/);

const urlFormat = rawUrl => {
  if (/^https:\/\//.test(rawUrl) || /^http:\/\//.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl}`
}

const crawler = new Crawler({
  maxConnections: 100,
  retries: 1,
  retryTimeout: 1000,
  timeout: 8000
});

const searchContactFromWebsite = (domain) => new Promise((resolve, reject) => {
  const emails = []

  crawler.queue({
    uri: urlFormat(domain),
    callback: (error, res, done) => {
      done();
      if (error) {
        return resolve([]);
      }

      const $ = res.$;
      if (typeof $ !== 'function') {
        return resolve([]);
      }
      const body = $('body').html();
      if (!body) {
        return resolve([]);
      }
      emails.push(...findEmailsInHtmlBody(body));
      const contactPageTags = findContactPage(body);
      if (contactPageTags && contactPageTags[0]) {
        const contactPage = $(contactPageTags[0]).attr('href')
        crawler.queue({
          uri: urlFormat(contactPage),
          callback: (contactPageError, contactPageRes, contactDone) => {
            contactDone();
            if (contactPageError) {
              return resolve([]);
            }

            const $2 = contactPageRes.$;
            const contactPageBody = $2('body').html();
            if (contactPageBody) {
              emails.push(...findEmailsInHtmlBody(contactPageBody));
            }
            return resolve(_.uniq(emails));
          }
        })
      } else {
        return resolve(_.uniq(emails));
      }
    }
  })
});

const limiter = new Bottleneck({
  maxConcurrent: 5
});
const getDomainRegisterInfoFromWhois = (domain) => limiter.schedule(
  () => new Promise((resolve, reject) => {
    return whois(domain).then((result) => {
      return resolve(result);
    }).catch((error) => {
      return resolve({});
    });
  })
 )

module.exports = {
  searchContactFromWebsite,
  getDomainRegisterInfoFromWhois
}
// const domainss = [
//   "commslock.com",
//   "gmxtec.com",
// ];

// Promise.all(domainss.map(domain => getDomainRegisterInfoFromWhois(domain)))
// .then(json => {
//   console.log('result', json);
// })
// .catch(error => console.log('error', error));
