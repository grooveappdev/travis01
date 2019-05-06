const SimilarWeb = require('./SimilarWeb');
const domains = require('./test.json')
const fs = require("fs");
const similarWeb = new SimilarWeb({
  minTime: 100,
  maxConcurrent: 20,
  maxRetry: 5
});

let count = 0;
let error404 = 0;
let error503 = 0;
let errDomain = [];
const host = [];

similarWeb.initAgent().then(() => {
  const pros = domains.map(entry => {
    return similarWeb.getDomainInfo(entry.business_domain).then(() => {
      host.push(entry.business_domain);
      count += 1;
      console.log('done', entry.business_domain, ' - count', count);
    }).catch(err => {
      errDomain.push(entry.business_domain)
      if (err.statusCode >= 500) {
        error503 += 1;
      } else {
        error404 += 1;
      }
    });
  });
  console.log(pros.length);
  Promise.all(pros).then(() => {
    console.log('success', count);
    console.log('error404', error404, '- error503', error503);
    fs.writeFile(
      "./tor.json",
      JSON.stringify(errDomain),
      "utf8",
      () => console.log("done tor.json")
    );
    similarWeb.destroyAgent();
  });
})
