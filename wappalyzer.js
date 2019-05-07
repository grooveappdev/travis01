const Bottleneck = require('bottleneck');
const Wappalyzer = require('wappalyzer');

const urlFormat = rawUrl => {
  if (/^https:\/\//.test(rawUrl) || /^http:\/\//.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl}`;
}

const OPTIONS = {
  debug: false,
  delay: 500,
  maxDepth: 3,
  maxUrls: 10,
  maxWait: 5000,
  recursive: true,
  userAgent: 'Wappalyzer',
  htmlMaxCols: 2000,
  htmlMaxRows: 2000,
};

const limiter = new Bottleneck({
  maxConcurrent: 5
});

const detectTechnologies = (url) => limiter.schedule(
  () => new Promise((resolve, reject) => {
    const wappalyzer = new Wappalyzer(urlFormat(url), OPTIONS);

    return wappalyzer.analyze()
      .then(json => {
        return resolve(json);
      })
      .catch(error => {
        return reject({});
      });
  })
);

module.exports = {
  detectTechnologies
}
