// change the sheet url to your sheet
const SHEET_URL = '';

const NUMBER_OF_DAYS = 400;

const TABS = {
  searchTerms: {
    headers: ["searchTerm", "keywordText", "campaign", "adGroup", "impr", "clicks", "cost", "conv", "value", "cpc", "ctr", "convRate", "cpa", "roas"],
    query: `SELECT search_term_view.search_term, segments.keyword.info.text, campaign.name, ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM search_term_view WHERE segments.date DURING LAST_30_DAYS AND campaign.advertising_channel_type = "SEARCH" AND metrics.impressions >= 30 ORDER BY metrics.cost_micros DESC`,
    fields: ['search_term_view.search_term', 'segments.keyword.info.text', 'campaign.name', 'ad_group.name'],
    includeCalculatedMetrics: true
  },
  daily: {
    headers: ["campaign", "campaignId", "impr", "clicks", "value", "conv", "cost", "date"],
    query: `SELECT campaign.name, campaign.id, metrics.clicks, metrics.conversions_value, metrics.conversions, metrics.cost_micros, metrics.impressions, segments.date FROM campaign WHERE {DATE_RANGE} ORDER BY segments.date DESC, metrics.cost_micros DESC`,
    fields: ['campaign.name', 'campaign.id', 'segments.date'],
    includeCalculatedMetrics: false
  },
  adGroups: {
    headers: ["campaign", "campaignId", "adGroup", "adGroupId", "impr", "clicks", "value", "conv", "cost", "date", "cpc", "ctr", "convRate", "cpa", "roas"],
    query: `SELECT campaign.name, campaign.id, ad_group.name, ad_group.id, metrics.clicks, metrics.conversions_value, metrics.conversions, metrics.cost_micros, metrics.impressions, segments.date FROM ad_group WHERE {DATE_RANGE} ORDER BY segments.date DESC, metrics.cost_micros DESC`,
    fields: ['campaign.name', 'campaign.id', 'ad_group.name', 'ad_group.id', 'segments.date'],
    includeCalculatedMetrics: true
  },
  assetGroups: {
    headers: ["campaign", "campaignId", "assetGroup", "assetGroupId", "status", "impr", "clicks", "value", "conv", "cost", "date", "cpc", "ctr", "convRate", "cpa", "roas"],
    query: `SELECT campaign.name, campaign.id, asset_group.name, asset_group.id, asset_group.status, metrics.clicks, metrics.conversions_value, metrics.conversions, metrics.cost_micros, metrics.impressions, segments.date FROM asset_group WHERE {DATE_RANGE} AND campaign.advertising_channel_type = "PERFORMANCE_MAX" ORDER BY segments.date DESC, metrics.cost_micros DESC`,
    fields: ['campaign.name', 'campaign.id', 'asset_group.name', 'asset_group.id', 'asset_group.status', 'segments.date'],
    includeCalculatedMetrics: true
  },
  negativeKeywordLists: {
    headers: ["listName", "listId", "listType", "appliedToCampaignName", "appliedToCampaignId"],
    query: `SELECT shared_set.name, shared_set.id, shared_set.type, campaign.name, campaign.id FROM campaign_shared_set WHERE shared_set.type = NEGATIVE_KEYWORDS AND campaign_shared_set.status = "ENABLED" ORDER BY shared_set.name`,
    fields: ['shared_set.name', 'shared_set.id', 'shared_set.type', 'campaign.name', 'campaign.id'],
    includeCalculatedMetrics: false
  },
  campaignNegatives: {
    headers: ["campaignName", "campaignId", "criterionId", "keywordText", "matchType"],
    query: `SELECT campaign.name, campaign.id, campaign_criterion.criterion_id, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion WHERE campaign_criterion.type = KEYWORD AND campaign_criterion.negative = TRUE ORDER BY campaign.name, campaign_criterion.keyword.text`,
    fields: ['campaign.name', 'campaign.id', 'campaign_criterion.criterion_id', 'campaign_criterion.keyword.text', 'campaign_criterion.keyword.match_type'],
    includeCalculatedMetrics: false
  },
  adGroupNegatives: {
    headers: ["campaignName", "campaignId", "adGroupName", "adGroupId", "criterionId", "keywordText", "matchType"],
    query: `SELECT campaign.name, campaign.id, ad_group.name, ad_group.id, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type FROM ad_group_criterion WHERE ad_group_criterion.type = KEYWORD AND ad_group_criterion.negative = TRUE ORDER BY campaign.name, ad_group.name, ad_group_criterion.keyword.text`,
    fields: ['campaign.name', 'campaign.id', 'ad_group.name', 'ad_group.id', 'ad_group_criterion.criterion_id', 'ad_group_criterion.keyword.text', 'ad_group_criterion.keyword.match_type'],
    includeCalculatedMetrics: false
  },
  campaignStatus: {
    headers: ["campaignId", "campaignName", "status", "channelType"],
    query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign ORDER BY campaign.name`,
    fields: ['campaign.id', 'campaign.name', 'campaign.status', 'campaign.advertising_channel_type'],
    includeCalculatedMetrics: false
  },
  sharedListKeywords: {
    headers: ["listId", "criterionId", "keywordText", "matchType", "type"],
    query: `SELECT shared_set.id, shared_criterion.criterion_id, shared_criterion.keyword.text, shared_criterion.keyword.match_type, shared_criterion.type FROM shared_criterion WHERE shared_set.type = NEGATIVE_KEYWORDS AND shared_criterion.type = KEYWORD ORDER BY shared_set.id, shared_criterion.keyword.text`,
    fields: ['shared_set.id', 'shared_criterion.criterion_id', 'shared_criterion.keyword.text', 'shared_criterion.keyword.match_type', 'shared_criterion.type'],
    includeCalculatedMetrics: false
  },
  landingPages: {
    headers: ["url", "impr", "clicks", "cost", "conv", "value", "ctr", "convRate", "cpa", "roas"],
    query: `SELECT landing_page_view.unexpanded_final_url, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM landing_page_view WHERE segments.date DURING LAST_30_DAYS AND metrics.impressions > 30 ORDER BY metrics.impressions DESC`,
    fields: ['landing_page_view.unexpanded_final_url'],
    includeCalculatedMetrics: true
  }
};

const FORMATS = {
  'cost': '$#,##0.00', 'value': '$#,##0.00', 'cpc': '$#,##0.00', 'cpa': '$#,##0.00',
  'roas': '#,##0.0', 'conv': '#,##0.0', 'ctr': '0.0%', 'convRate': '0.0%', 'date': 'yyyy-mm-dd'
};

function getFlexibleDateRangeWhereClause(numDays) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (numDays - 1));
  const format = date => Utilities.formatDate(date, AdsApp.currentAccount().getTimeZone(), 'yyyyMMdd');
  return `segments.date BETWEEN "${format(startDate)}" AND "${format(endDate)}"`;
}

function main() {
  const ss = SHEET_URL ? SpreadsheetApp.openByUrl(SHEET_URL) : createNewSheet();
  const dateRange = getFlexibleDateRangeWhereClause(NUMBER_OF_DAYS);
  
  Object.entries(TABS).forEach(([name, config]) => {
    const query = config.query.replace('{DATE_RANGE}', dateRange);
    processTab(ss, name, config, query);
  });
}

function createNewSheet() {
  const ss = SpreadsheetApp.create("Google Ads Report");
  console.log(`Created sheet: ${ss.getUrl()}`);
  return ss;
}

function processTab(ss, tabName, {headers, fields, includeCalculatedMetrics}, query) {
  const sheet = getOrCreateSheet(ss, tabName);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  
  const data = processRows(AdsApp.report(query).rows(), fields, includeCalculatedMetrics, tabName);
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    applyFormatting(sheet, headers);
  }
  console.log(`${tabName}: ${data.length} rows`);
}

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function processRows(rows, fields, includeCalculatedMetrics, tabName) {
  const data = [];
  while (rows.hasNext()) {
    const row = rows.next();
    const fieldValues = fields.map(field => String(row[field] || ''));
    const metrics = calcMetrics(row);
    
    if (tabName === 'searchTerms') {
      // headers: ["searchTerm", "keywordText", "campaign", "adGroup", "impr", "clicks", "cost", "conv", "value", "cpc", "ctr", "convRate", "cpa", "roas"]
      data.push([...fieldValues, metrics.impressions, metrics.clicks, metrics.cost, metrics.conversions, metrics.conversionValue,
                ...(includeCalculatedMetrics ? [metrics.cpc, metrics.ctr, metrics.convRate, metrics.cpa, metrics.roas] : [])]);
    } else if (tabName === 'daily') {
      // headers: ["campaign", "campaignId", "impr", "clicks", "value", "conv", "cost", "date"]
      // fieldValues: [campaign, campaignId, date]
      data.push([fieldValues[0], fieldValues[1], metrics.impressions, metrics.clicks, metrics.conversionValue, metrics.conversions, metrics.cost, fieldValues[2]]);
    } else if (tabName === 'adGroups') {
      // headers: ["campaign", "campaignId", "adGroup", "adGroupId", "impr", "clicks", "value", "conv", "cost", "date", "cpc", "ctr", "convRate", "cpa", "roas"]
      // fieldValues: [campaign, campaignId, adGroup, adGroupId, date]
      data.push([fieldValues[0], fieldValues[1], fieldValues[2], fieldValues[3], metrics.impressions, metrics.clicks, metrics.conversionValue, metrics.conversions, metrics.cost, fieldValues[4],
                ...(includeCalculatedMetrics ? [metrics.cpc, metrics.ctr, metrics.convRate, metrics.cpa, metrics.roas] : [])]);
    } else if (tabName === 'assetGroups') {
      // headers: ["campaign", "campaignId", "assetGroup", "assetGroupId", "status", "impr", "clicks", "value", "conv", "cost", "date", "cpc", "ctr", "convRate", "cpa", "roas"]
      // fieldValues: [campaign, campaignId, assetGroup, assetGroupId, status, date]
      data.push([fieldValues[0], fieldValues[1], fieldValues[2], fieldValues[3], fieldValues[4], metrics.impressions, metrics.clicks, metrics.conversionValue, metrics.conversions, metrics.cost, fieldValues[5],
                ...(includeCalculatedMetrics ? [metrics.cpc, metrics.ctr, metrics.convRate, metrics.cpa, metrics.roas] : [])]);
    } else if (tabName === 'landingPages') {
      // headers: ["url", "impr", "clicks", "cost", "conv", "value", "ctr", "convRate", "cpa", "roas"]
      data.push([fieldValues[0], metrics.impressions, metrics.clicks, metrics.cost, metrics.conversions, metrics.conversionValue,
                ...(includeCalculatedMetrics ? [metrics.ctr, metrics.convRate, metrics.cpa, metrics.roas] : [])]);
    } else {
      data.push(fieldValues);
    }
  }
  return data;
}

function calcMetrics(row) {
  const impressions = +(row['metrics.impressions'] || 0);
  const clicks = +(row['metrics.clicks'] || 0);
  const cost = +(row['metrics.cost_micros'] || 0) / 1000000;
  const conversions = +(row['metrics.conversions'] || 0);
  const conversionValue = +(row['metrics.conversions_value'] || 0);
  
  return {
    impressions, clicks, cost, conversions, conversionValue,
    cpc: clicks ? cost / clicks : 0,
    ctr: impressions ? clicks / impressions : 0,
    convRate: clicks ? conversions / clicks : 0,
    cpa: conversions ? cost / conversions : 0,
    roas: cost ? conversionValue / cost : 0
  };
}

function applyFormatting(sheet, headers) {
  headers.forEach((header, i) => {
    if (FORMATS[header]) {
      sheet.getRange(2, i + 1, sheet.getMaxRows() - 1, 1).setNumberFormat(FORMATS[header]);
    }
  });
}