// =====================================================
// SEO 数据对比 API
// GET /api/seo-compare?batch1=xxx&batch2=xxx&page=xxx
// 对比两个批次之间的数据变化
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ComparisonResult {
  page: string;
  batch1: string;
  batch2: string;
  before: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  after: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  changes: {
    clicks: number;
    clicksPercent: number;
    impressions: number;
    impressionsPercent: number;
    ctr: number;
    position: number;
  };
}

// 模拟数据
function generateMockComparison(batch1: string, batch2: string): ComparisonResult[] {
  const pages = [
    'https://maidinhk.com/blog/minimum-wage-and-budget',
    'https://maidinhk.com/blog/visa-application-process',
    'https://maidinhk.com/blog/helper-blacklist',
    'https://maidinhk.com/blog/work-schedule',
    'https://maidinhk.com/blog/filipino-vs-indonesian-salary-cost',
  ];

  return pages.map(page => {
    const beforeClicks = Math.floor(Math.random() * 100) + 20;
    const afterClicks = Math.floor(beforeClicks * (1 + (Math.random() * 0.4 - 0.1)));
    const beforeImpressions = Math.floor(Math.random() * 3000) + 500;
    const afterImpressions = Math.floor(beforeImpressions * (1 + (Math.random() * 0.3 - 0.05)));
    const beforePosition = 8 + Math.random() * 6;
    const afterPosition = beforePosition + (Math.random() * 2 - 1);

    return {
      page,
      batch1,
      batch2,
      before: {
        clicks: beforeClicks,
        impressions: beforeImpressions,
        ctr: (beforeClicks / beforeImpressions) * 100,
        position: beforePosition,
      },
      after: {
        clicks: afterClicks,
        impressions: afterImpressions,
        ctr: (afterClicks / afterImpressions) * 100,
        position: afterPosition,
      },
      changes: {
        clicks: afterClicks - beforeClicks,
        clicksPercent: ((afterClicks - beforeClicks) / beforeClicks) * 100,
        impressions: afterImpressions - beforeImpressions,
        impressionsPercent: ((afterImpressions - beforeImpressions) / beforeImpressions) * 100,
        ctr: ((afterClicks / afterImpressions) - (beforeClicks / beforeImpressions)) * 100,
        position: afterPosition - beforePosition,
      },
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batch1 = searchParams.get('batch1');
    const batch2 = searchParams.get('batch2');
    const pageFilter = searchParams.get('page');

    if (!batch1 || !batch2) {
      return NextResponse.json(
        { error: '请提供两个批次号进行比较' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 如果没有环境变量，返回模拟数据
    if (!supabaseUrl || !supabaseKey) {
      console.log("[SEO Compare] Using mock data (no env vars)");
      const mockData = generateMockComparison(batch1, batch2);
      return NextResponse.json({
        data: mockData,
        batch1,
        batch2,
        isMock: true,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 查询 batch1 的数据
    const { data: batch1Data, error: error1 } = await supabase
      .from('maidinhk_gsc_history')
      .select('page, clicks, impressions, position, data_type')
      .eq('upload_batch', batch1)
      .eq('data_type', 'page')
      .neq('page', '_SUMMARY_');

    // 查询 batch2 的数据
    const { data: batch2Data, error: error2 } = await supabase
      .from('maidinhk_gsc_history')
      .select('page, clicks, impressions, position, data_type')
      .eq('upload_batch', batch2)
      .eq('data_type', 'page')
      .neq('page', '_SUMMARY_');

    if (error1 || error2) {
      console.error('[SEO Compare] Error fetching data:', error1, error2);
      const mockData = generateMockComparison(batch1, batch2);
      return NextResponse.json({
        data: mockData,
        batch1,
        batch2,
        isMock: true,
        error: '获取数据失败',
      });
    }

    // 如果没有数据，返回模拟数据
    if (!batch1Data?.length || !batch2Data?.length) {
      console.log('[SEO Compare] No data found, using mock data');
      const mockData = generateMockComparison(batch1, batch2);
      return NextResponse.json({
        data: mockData,
        batch1,
        batch2,
        isMock: true,
      });
    }

    // 构建数据映射
    const batch1Map = new Map(batch1Data.map((r: any) => [r.page, r]));
    const batch2Map = new Map(batch2Data.map((r: any) => [r.page, r]));

    // 获取所有页面（取两个批次的并集）
    const allPages = [...new Set([...batch1Map.keys(), ...batch2Map.keys()])];

    // 构建对比结果
    const results: ComparisonResult[] = allPages
      .filter(page => !pageFilter || page === pageFilter)
      .map(page => {
        const before = batch1Map.get(page) || { clicks: 0, impressions: 0, position: 0 };
        const after = batch2Map.get(page) || { clicks: 0, impressions: 0, position: 0 };

        const beforeCtr = before.impressions > 0 ? (before.clicks / before.impressions) * 100 : 0;
        const afterCtr = after.impressions > 0 ? (after.clicks / after.impressions) * 100 : 0;

        return {
          page,
          batch1,
          batch2,
          before: {
            clicks: before.clicks || 0,
            impressions: before.impressions || 0,
            ctr: beforeCtr,
            position: before.position || 0,
          },
          after: {
            clicks: after.clicks || 0,
            impressions: after.impressions || 0,
            ctr: afterCtr,
            position: after.position || 0,
          },
          changes: {
            clicks: (after.clicks || 0) - (before.clicks || 0),
            clicksPercent: before.clicks > 0 
              ? (((after.clicks || 0) - before.clicks) / before.clicks) * 100 
              : 0,
            impressions: (after.impressions || 0) - (before.impressions || 0),
            impressionsPercent: before.impressions > 0 
              ? (((after.impressions || 0) - before.impressions) / before.impressions) * 100 
              : 0,
            ctr: afterCtr - beforeCtr,
            position: (after.position || 0) - (before.position || 0),
          },
        };
      })
      .sort((a, b) => Math.abs(b.changes.clicks) - Math.abs(a.changes.clicks)); // 按点击变化量排序

    return NextResponse.json({
      data: results,
      batch1,
      batch2,
      isMock: false,
      summary: {
        totalPages: results.length,
        improvedPages: results.filter(r => r.changes.clicks > 0).length,
        declinedPages: results.filter(r => r.changes.clicks < 0).length,
        totalClickChange: results.reduce((sum, r) => sum + r.changes.clicks, 0),
      },
    });

  } catch (error) {
    console.error('[SEO Compare] Error:', error);
    const batch1 = new URL(request.url).searchParams.get('batch1') || 'batch1';
    const batch2 = new URL(request.url).searchParams.get('batch2') || 'batch2';
    const mockData = generateMockComparison(batch1, batch2);
    return NextResponse.json({
      data: mockData,
      batch1,
      batch2,
      isMock: true,
      error: '服务器错误',
    });
  }
}
