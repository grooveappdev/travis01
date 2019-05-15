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

const shodan =  [
  {
    name: 'asn',
    type: 'STRING',
  },
  {
    name: 'cpe',
    type: 'STRING',
    mode: 'REPEATED',
  },
  {
    name: 'data',
    type: 'STRING',
  },
  {
    name: 'domains',
    type: 'STRING',
    mode: 'REPEATED',
  },
  {
    name: 'hash',
    type: 'STRING',
  },
  {
    name: 'hostId',
    type: 'STRING',
    mode: 'REQUIRED'
  },
  {
    name: 'http',
    type: 'RECORD',
    fields: [
      {
        name: 'host',
        type: 'STRING',
      },
      {
        name: 'html_hash',
        type: 'STRING',
      },
      {
        name: 'location',
        type: 'STRING',
      },
      {
        name: 'redirects',
        type: 'STRING',
        mode: 'REPEATED',
      },
      {
        name: 'server',
        type: 'STRING',
      },
      {
        name: 'title',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'info',
    type: 'STRING',
  },
  {
    name: 'ip_str',
    type: 'STRING',
  },
  {
    name: 'isp',
    type: 'STRING',
  },
  {
    name: 'cpe',
    type: 'STRING',
    mode: 'REPEATED'
  },
  {
    name: 'cpe',
    type: 'STRING',
    mode: 'REPEATED'
  },
  {
    name: 'cpe',
    type: 'STRING',
    mode: 'REPEATED'
  },
];
const schema =  [
  {
    name: 'a',
    type: 'string',
  },
  {
    name: 'b',
    type: 'string',
    mode: 'repeated'
  },
];
const data = [
  {
    insertId: '3511111122',
    json: Table.encodeValue_({
      a: '1', b: ['2'],
    })
  },
  {
    insertId: '1415111122',
    json: Table.encodeValue_({
      a: '1', b: ['2'],
    })
  },
  {
    insertId: '6511111122',
    json: Table.encodeValue_({
      a: '1', b: ['2'],
    })
  },
  {
    insertId: '11311122',
    json: Table.encodeValue_({
      a: '1', b: '2',
    })
  }
];
const bigQuery = new GoogleBigQuery();
bigQuery.initClient().then(() => {
  bigQuery.insertData('van_test', 'table_test', data).then(res => {
    console.log(res);
  }).catch(err => console.log('err', err.response.insertErrors[0].errors))
});
console.log(Table.encodeValue_)
