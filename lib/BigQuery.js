const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();
const fs = require("fs");

class GoogleBigQuery {
  constructor() {
    this.client = new BigQuery();
  }

  initClient() {
    const that = this;
    return new Promise((resolve, reject) => {
      fs.writeFile(
        "./credential.json",
        process.env.GOOGLE_CREDENTIAL,
        { encoding: 'base64' },
        () => {
          that.client = new BigQuery({
            projectId: process.env.GOOGLE_PROJECT_ID,
            keyFilename: "./credential.json",
          });
          resolve();
        }
      );
    });
  }
  getDatasetList() {
    return this.client.getDatasets();
  }
  createDataset(datasetName) {
    return this.client.createDataset(datasetName);
  }
  deleteDataset(datasetName) {
    return this.client.dataset(datasetName).delete({ force: true });
  }
  getTableList(datasetName) {
    return this.client.dataset(datasetName).getTables();
  }
  createTable(tableName, datasetName) {
    return this.client.dataset(datasetName).createTable(tableName);
  }
  deleteTable(tableName, datasetName) {
    return this.client.dataset(datasetName).table(tableName).delete();
  }
  getAllData(tableName, datasetName) {
    return this.client.dataset(datasetName).table(tableName).getRows();
  }
  insertData(data, tableName, datasetName) {
    return this.client.dataset(datasetName).table(tableName).insert(data);
  }
}

module.exports = GoogleBigQuery;

const bigQuery = new GoogleBigQuery();
bigQuery.initClient().then(() => {
  bigQuery.createTable('table1', 'van_test').then(res => {
    console.log(res);
  })
});
