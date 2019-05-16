const SCHEMA =  [
  {
    name: 'hostId',
    type: 'STRING',
    mode: 'REQUIRED'
  },
  {
    name: 'Category',
    type: 'STRING',
  },
  {
    name: 'CategoryRank',
    type: 'RECORD',
    fields: [
      {
        name: 'Category',
        type: 'STRING',
      },
      {
        name: 'Direction',
        type: 'STRING',
      },
      {
        name: 'Rank',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'CountryRank',
    type: 'RECORD',
    fields: [
      {
        name: 'Country',
        type: 'STRING',
      },
      {
        name: 'Direction',
        type: 'STRING',
      },
      {
        name: 'Rank',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'DailyVisitsMinDate',
    type: 'STRING',
  },
  {
    name: 'DailyVisitsMaxDate',
    type: 'STRING',
  },
  {
    name: 'Description',
    type: 'STRING',
  },
  {
    name: 'DisplayAdsRatio',
    type: 'STRING',
  },
  {
    name: 'Engagments',
    type: 'RECORD',
    fields: [
      {
        name: 'BounceRate',
        type: 'STRING',
      },
      {
        name: 'Month',
        type: 'STRING',
      },
      {
        name: 'PagePerVisit',
        type: 'STRING',
      },
      {
        name: 'TimeOnSite',
        type: 'STRING',
      },
      {
        name: 'Visits',
        type: 'STRING',
      },
      {
        name: 'Year',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'GlobalRank',
    type: 'RECORD',
    fields: [
      {
        name: 'Direction',
        type: 'STRING',
      },
      {
        name: 'Rank',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'IsSiteVerified',
    type: 'BOOLEAN',
  },
  {
    name: 'IsSmall',
    type: 'BOOLEAN',
  },
  {
    name: 'LargeScreenshot',
    type: 'STRING',
  },
  {
    name: 'OrganicKeywordsRollingUniqueCount',
    type: 'BOOLEAN',
  },
  {
    name: 'OrganicSearchShare',
    type: 'BOOLEAN',
  },
  {
    name: 'PaidKeywordsRollingUniqueCount',
    type: 'STRING',
  },
  {
    name: 'PaidSearchShare',
    type: 'BOOLEAN',
  },
  {
    name: 'ReachMonths',
    type: 'BOOLEAN',
  },
  {
    name: 'RedirectUrl',
    type: 'STRING',
  },
  {
    name: 'ReferralsRatio',
    type: 'BOOLEAN',
  },
  {
    name: 'SearchRatio',
    type: 'BOOLEAN',
  },
  {
    name: 'SimilarSites',
    type: 'RECORD',
    fields: [
      {
        name: 'Rank',
        type: 'STRING',
      },
      {
        name: 'Screenshot',
        type: 'STRING',
      },
      {
        name: 'Site',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'SimilarSitesByRank',
    type: 'RECORD',
    fields: [
      {
        name: 'Rank',
        type: 'STRING',
      },
      {
        name: 'Screenshot',
        type: 'STRING',
      },
      {
        name: 'Site',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'SiteName',
    type: 'STRING',
  },
  {
    name: 'SmallSiteMessage',
    type: 'STRING',
  },
  {
    name: 'SmallSiteMessageTitle',
    type: 'STRING',
  },
  {
    name: 'SocialRatio',
    type: 'STRING',
  },
  {
    name: 'Title',
    type: 'STRING',
  },
  {
    name: 'TopAdNetworks',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Site',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopCountryShares',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Country',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopDestinations',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Site',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopOrganicKeywords',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Keyword',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopPaidKeywords',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Keyword',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopPublishers',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Site',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopReferring',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Site',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
      {
        name: 'Change',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TopSocial',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'Site',
        type: 'STRING',
      },
      {
        name: 'Value',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'TotalCountries',
    type: 'STRING',
  },
  {
    name: 'TotalDestinations',
    type: 'STRING',
  },
  {
    name: 'TotalReferring',
    type: 'STRING',
  },
  {
    name: 'TrafficSources',
    type: 'RECORD',
    fields: [
      {
        name: 'Search',
        type: 'STRING',
      },
      {
        name: 'Social',
        type: 'STRING',
      },
      {
        name: 'Mail',
        type: 'STRING',
      },
      {
        name: 'Paid Referrals',
        type: 'STRING',
      },
      {
        name: 'Direct',
        type: 'STRING',
      },
      {
        name: 'Referrals',
        type: 'STRING',
      },
    ]
  },
  {
    name: 'wappalyzer',
    type: 'RECORD',
    mode: 'REPEATED',
    fields: [
      {
        name: 'name',
        type: 'STRING',
      },
      {
        name: 'confidence',
        type: 'STRING',
      },
      {
        name: 'version',
        type: 'STRING',
      },
      {
        name: 'icon',
        type: 'STRING',
      },
      {
        name: 'website',
        type: 'STRING',
      },
      {
        name: 'categories',
        type: 'STRING',
        mode: 'REPEATED',
      },
    ]
  },
  {
    name: 'contact',
    type: 'STRING',
    mode: 'REPEATED',
  },
];

// EstimatedMonthlyVisits

// Delete MobileApps prop

module.exports = SCHEMA;