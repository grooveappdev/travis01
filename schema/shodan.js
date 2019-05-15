const SCHEMA =  [
  {
    name: 'hostId',
    type: 'STRING',
    mode: 'REQUIRED'
  },
  {
    name: 'asn',
    type: 'STRING',
  },
  {
    name: 'data',
    type: 'STRING',
  },
  {
    name: 'hash',
    type: 'STRING',
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
    name: 'org',
    type: 'STRING',
  },
  {
    name: 'os',
    type: 'STRING',
  },
  {
    name: 'port',
    type: 'STRING',
  },
  {
    name: 'product',
    type: 'STRING',
  },
  {
    name: 'timestamp',
    type: 'STRING',
  },
  {
    name: 'transport',
    type: 'STRING',
  },
  {
    name: 'version',
    type: 'STRING',
  },
  {
    name: 'cpe',
    type: 'STRING',
    mode: 'REPEATED',
  },
  {
    name: 'domains',
    type: 'STRING',
    mode: 'REPEATED',
  },
  {
    name: 'tags',
    type: 'STRING',
    mode: 'REPEATED'
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
    name: 'location',
    type: 'RECORD',
    fields: [
      {
        name: 'area_code',
        type: 'STRING',
      },
      {
        name: 'city',
        type: 'STRING',
      },
      {
        name: 'country_code',
        type: 'STRING',
      },
      {
        name: 'country_code3',
        type: 'STRING',
      },
      {
        name: 'country_name',
        type: 'STRING',
      },
      {
        name: 'dma_code',
        type: 'STRING',
      },
      {
        name: 'latitude',
        type: 'STRING',
      },
      {
        name: 'longitude',
        type: 'STRING',
      },
      {
        name: 'postal_code',
        type: 'STRING',
      },
      {
        name: 'region_code',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'ssl',
    type: 'RECORD',
    fields: [
      {
        name: 'cert',
        type: 'RECORD',
        fields: [
          {
            name: 'expired',
            type: 'BOOLEAN',
          },
          {
            name: 'expires',
            type: 'STRING',
          },
          {
            name: 'fingerprint',
            type: 'RECORD',
            fields: [
              {
                name: 'sha1',
                type: 'STRING',
              },
              {
                name: 'sha256',
                type: 'STRING',
              },
            ],
          },
          {
            name: 'issued',
            type: 'STRING',
          },
          {
            name: 'pubkey',
            type: 'RECORD',
            fields: [
              {
                name: 'bits',
                type: 'STRING',
              },
              {
                name: 'type',
                type: 'STRING',
              },
            ],
          },
          {
            name: 'sig_alg',
            type: 'STRING',
          },
          {
            name: 'subject',
            type: 'RECORD',
            fields: [
              {
                name: 'bits',
                type: 'STRING',
              },
              {
                name: 'type',
                type: 'STRING',
              },
            ],
          },
          {
            name: 'version',
            type: 'STRING',
          },
        ]
      },
      {
        name: 'cipher',
        type: 'RECORD',
        fields: [
          {
            name: 'bits',
            type: 'STRING',
          },
          {
            name: 'name',
            type: 'STRING',
          },
          {
            name: 'version',
            type: 'STRING',
          },
        ]
      },
      {
        name: 'dhparams',
        type: 'RECORD',
        fields: [
          {
            name: 'bits',
            type: 'STRING',
          },
          {
            name: 'fingerprint',
            type: 'STRING',
          },
          {
            name: 'prime',
            type: 'STRING',
          },
          {
            name: 'public_key',
            type: 'STRING',
          },
        ]
      },
      {
        name: 'tlsext',
        type: 'RECORD',
        mode: 'REPEATED',
        fields: [
          {
            name: 'id',
            type: 'STRING',
          },
          {
            name: 'name',
            type: 'STRING',
          },
        ]
      },
      {
        name: 'versions',
        type: 'STRING',
        mode: 'REPEATED',
      },
    ]
  },
];
// ssl.cert.extensions
// ssl.cert.issuer
// ssl.cert.subject

module.exports = SCHEMA;