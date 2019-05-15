const { BigQuery, Table } = require('@google-cloud/bigquery');
require('dotenv').config();
const fs = require("fs");

class GoogleBigQuery {
  constructor() {
    this.client = null;
  }

  initClient() {
    const that = this;
    if (this.client) {
      return Promise.resolve(true);
    }
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
          resolve(true);
        }
      );
    });
  }
  encodeValue(value) {
    return Table.encodeValue_(value);
  }
  parseBigQueryData(dataList) {
    return dataList.map(data => ({
      insertId: data.hostId,
      json: this.encodeValue(data),
    }));
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
  createTable(datasetName, tableName, schema) {
    return this.client.dataset(datasetName).createTable(tableName, { schema });
  }
  deleteTable(datasetName, tableName) {
    return this.client.dataset(datasetName).table(tableName).delete();
  }
  getAllData(datasetName, tableName) {
    return this.client.dataset(datasetName).table(tableName).getRows();
  }
  insertData(datasetName, tableName, data) {
    return this.client.dataset(datasetName).table(tableName).insert(data, {
      ignoreUnknownValues: true,
      skipInvalidRows: true,
      raw: true
    });
  }
}

module.exports = GoogleBigQuery;

// const bigQuery = new GoogleBigQuery();
// const schema = require('../schema/shodan');
// bigQuery.initClient().then(() => {
//   bigQuery.createTable('van_test', 'shodan', schema).then(res => {
//     console.log(res);
//   }).catch(err => console.log('err', err))
// });
