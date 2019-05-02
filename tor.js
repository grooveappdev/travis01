const SimilarWeb = require('./SimilarWeb');
const domains = require('./test.json')
const fs = require("fs");
const similarWeb = new SimilarWeb();

let count = 0;
let error = 0;
let errMes = [];
const host = [];
similarWeb.initAgent().then(() => {
  const pros = domains.map(entry => {
    return similarWeb.getDomainInfo(entry.business_domain).then(() => {
      host.push(entry.business_domain);
      count += 1;
      console.log('done', entry.business_domain, ' - count', count);
    }).catch(err => {
      console.log('error')
      errMes.push(err.message)
      error += 1;
    });
  });
  console.log(pros.length);
  Promise.all(pros).then(() => {
    console.log('success', count);
    console.log('errors', error);
    fs.writeFile(
      "./tor2.json",
      JSON.stringify(errMes),
      "utf8",
      () => console.log("done tor.json")
    );
    similarWeb.destroyAgent();
  });
});
