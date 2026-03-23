// =====================================================
// GSC (Google Search Console) API 客户端
// =====================================================

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const GSC_SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:maidinhk.com';

// 初始化 GSC API 客户端
export function createGSCClient() {
  const credentials = process.env.GSC_KEY_JSON 
    ? JSON.parse(process.env.GSC_KEY_JSON)
    : null;

  if (!credentials) {
    throw new Error('GSC_KEY_JSON not set');
  }

  const client = new JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    ['https://www.googleapis.com/auth/webmasters.readonly']
  );

  return google.webmasters({ version: 'v3', auth: client });
}

// 获取搜索分析数据
export async function fetchSearchAnalytics(
  startDate: string,
  endDate: string,
  dimensions: string[] = ['date']
) {
  const webmasters = createGSCClient();
  
  const res = await webmasters.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit: 25000,
    },
  });

  return res.data.rows || [];
}

// 获取每日汇总数据
export async function fetchDailyMetrics(startDate: string, endDate: string) {
  const rows = await fetchSearchAnalytics(startDate, endDate, ['date']);
  
  return rows.map((row: any) => ({
    date: row.keys[0],
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

// 获取页面数据
export async function fetchPageMetrics(startDate: string, endDate: string) {
  const rows = await fetchSearchAnalytics(startDate, endDate, ['date', 'page']);
  
  return rows.map((row: any) => ({
    date: row.keys[0],
    page: row.keys[1],
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

// 获取查询数据
export async function fetchQueryMetrics(startDate: string, endDate: string) {
  const rows = await fetchSearchAnalytics(startDate, endDate, ['date', 'query']);
  
  return rows.map((row: any) => ({
    date: row.keys[0],
    query: row.keys[1],
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}
