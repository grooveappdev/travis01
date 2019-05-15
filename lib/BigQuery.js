const { BigQuery, Table } = require('@google-cloud/bigquery');
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

const schema =  [
  {
    name: 'a',
    type: 'string',
  },
  {
    name: 'b',
    type: 'string',
  },
  {
    name: 'c',
    type: 'record',
    fields: [
      {
        name: 'd',
        type: 'string',
      },
      {
        name: 'e',
        type: 'string',
      },
    ]
  },
];
const data = {
  insertId: '111122',
  json: Table.encodeValue_({
    a: '1', b: '2',
    c: {}
  })
};
const bigQuery = new GoogleBigQuery();
bigQuery.initClient().then(() => {
  bigQuery.getAllData('van_test', 'table_test', data).then(res => {
    console.log(res);
  })
});
console.log(Table.encodeValue_)
