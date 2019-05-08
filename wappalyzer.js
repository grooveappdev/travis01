const Bottleneck = require('bottleneck');
const Wappalyzer = require('wappalyzer');
const fs = require("fs");

const urlFormat = rawUrl => {
  if (/^https:\/\//.test(rawUrl) || /^http:\/\//.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl}`;
}

const OPTIONS = {
  debug: false,
  delay: 500,
  maxDepth: 2,
  maxUrls: 1,
  htmlMaxCols: 2000,
  htmlMaxRows: 2000,
  maxWait: 10000,
  recursive: true,
  userAgent: 'Wappalyzer'
};

const limiter = new Bottleneck({
  maxConcurrent: 15
});

const detectTechnologies = url => limiter.schedule(() => {
  return new Wappalyzer(urlFormat(url), OPTIONS).analyze()
  .then(json => {
    const result = json && json.applications ? json.applications : [];
    return result;
  })
  .catch(error => {
    return [];
  });
});

module.exports = {
  detectTechnologies
}

// const urls = require('./domains.json')

// Promise.all(urls.map(url => detectTechnologies(url))).then(res => {
//   fs.writeFile(
//     "./data.json",
//     JSON.stringify(res),
//     "utf8",
//     () => {
//       console.log("done data.json");
//       // process.exit(0);
//     }
//   );
// });