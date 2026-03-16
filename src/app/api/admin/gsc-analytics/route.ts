import { NextResponse } from 'next/server';
import { verifyAdmin, supabaseAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { admin, error: authError } = await verifyAdmin(req);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin is not initialized' }, { status: 500 });
    }

    // 获取最近两次导入的日期范围
    const importPeriodsRes = await supabaseAdmin
      .from('gsc_import_logs')
      .select('date_from, date_to')
      .order('created_at', { ascending: false })
      .limit(10);
      
    const importPeriods = [
      ...new Set(
        (importPeriodsRes.data || []).map((i) => `${i.date_from}|${i.date_to}`),
      ),
    ];
    const latestPeriod = importPeriods[0] || null;
    const prevPeriod = importPeriods[1] || null;

    const latestPeriodFrom = latestPeriod ? latestPeriod.split('|')[0] : null;
    const latestPeriodTo = latestPeriod ? latestPeriod.split('|')[1] : null;
    const prevPeriodFrom = prevPeriod ? prevPeriod.split('|')[0] : null;
    const prevPeriodTo = prevPeriod ? prevPeriod.split('|')[1] : null;

    // 并行查询所有数据
    const [
      dailyRes,
      importHistoryRes,
      latestQueriesRes,
      prevQueriesRes,
      latestPagesRes,
      prevPagesRes,
      latestCountriesRes,
      latestDevicesRes,
    ] = await Promise.all([
      // 每日趋势（全量，按日期排序）
      supabaseAdmin
        .from('gsc_daily_metrics')
        .select('date, clicks, impressions, ctr, position')
        .order('date', { ascending: true }),

      // 导入历史
      supabaseAdmin
        .from('gsc_import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),

      // Top 搜索词（最新）
      latestPeriod
        ? supabaseAdmin
            .from('gsc_queries')
            .select(
              'query, clicks, impressions, ctr, position, date_from, date_to',
            )
            .eq('date_from', latestPeriodFrom)
            .eq('date_to', latestPeriodTo)
            .order('clicks', { ascending: false })
            .limit(1000)
        : Promise.resolve({ data: [] }),

      // Top 搜索词（上期）
      prevPeriod
        ? supabaseAdmin
            .from('gsc_queries')
            .select(
              'query, clicks, impressions, ctr, position, date_from, date_to',
            )
            .eq('date_from', prevPeriodFrom)
            .eq('date_to', prevPeriodTo)
            .order('clicks', { ascending: false })
            .limit(1000)
        : Promise.resolve({ data: [] }),

      // Top 页面（最新）
      latestPeriod
        ? supabaseAdmin
            .from('gsc_pages')
            .select(
              'page, clicks, impressions, ctr, position, date_from, date_to',
            )
            .eq('date_from', latestPeriodFrom)
            .eq('date_to', latestPeriodTo)
            .order('clicks', { ascending: false })
            .limit(1000)
        : Promise.resolve({ data: [] }),

      // Top 页面（上期）
      prevPeriod
        ? supabaseAdmin
            .from('gsc_pages')
            .select(
              'page, clicks, impressions, ctr, position, date_from, date_to',
            )
            .eq('date_from', prevPeriodFrom)
            .eq('date_to', prevPeriodTo)
            .order('clicks', { ascending: false })
            .limit(1000)
        : Promise.resolve({ data: [] }),

      // Top 国家（最新）
      latestPeriod
        ? supabaseAdmin
            .from('gsc_countries')
            .select(
              'country, clicks, impressions, ctr, position, date_from, date_to',
            )
            .eq('date_from', latestPeriodFrom)
            .eq('date_to', latestPeriodTo)
            .order('clicks', { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [] }),

      // 设备分布（最新）
      latestPeriod
        ? supabaseAdmin
            .from('gsc_devices')
            .select(
              'device, clicks, impressions, ctr, position, date_from, date_to',
            )
            .eq('date_from', latestPeriodFrom)
            .eq('date_to', latestPeriodTo)
            .order('clicks', { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [] }),
    ]);

    const dailyTrend = dailyRes.data || [];
    const importHistory = importHistoryRes.data || [];
    const latestQueries = latestQueriesRes.data || [];
    const prevQueries = prevQueriesRes.data || [];
    const latestPages = latestPagesRes.data || [];
    const prevPages = prevPagesRes.data || [];
    const latestCountries = latestCountriesRes.data || [];
    const latestDevices = latestDevicesRes.data || [];

    const allQueries = [...latestQueries, ...prevQueries];
    const allPages = [...latestPages, ...prevPages];

    const topQueries = latestQueries.slice(0, 20);
    const topPages = latestPages.slice(0, 20);
    const topCountries = latestCountries.slice(0, 10);
    const deviceBreakdown = latestDevices;

    const queryGrowth = computeGrowth(latestQueries, prevQueries, 'query');
    const pageGrowth = computeGrowth(latestPages, prevPages, 'page');
    const insights = generateInsights(
      latestQueries,
      prevQueries,
      latestPages,
      prevPages,
    );
    const quadrantAnalysis = computeQuadrants(latestPages);
    const rankingDistribution = computeRankingDistribution(
      latestPages,
      latestQueries,
    );
    const trendAnalysis = computeTrendAnalysis(
      allQueries,
      allPages,
      importPeriods,
    );

    return NextResponse.json({
      dailyTrend,
      topQueries,
      topPages,
      topCountries,
      deviceBreakdown,
      queryGrowth,
      pageGrowth,
      importHistory,
      insights,
      quadrantAnalysis,
      rankingDistribution,
      trendAnalysis,
    });
  } catch (err: any) {
    console.error('GSC 分析错误:', err);
    return NextResponse.json({ error: '分析数据获取失败: ' + err.message }, { status: 500 });
  }
}

function computeGrowth(latestData: any[], prevData: any[], keyField: string) {
  if (!prevData.length) return [];

  const prevMap = new Map();
  for (const item of prevData) {
    prevMap.set(item[keyField], item);
  }

  const results = [];
  for (const item of latestData) {
    const prev = prevMap.get(item[keyField]);
    if (!prev) continue;
    const oldClicks = prev.clicks || 0;
    if (oldClicks === 0) continue;
    const growthRate = ((item.clicks - oldClicks) / oldClicks) * 100;
    results.push({
      [keyField]: item[keyField],
      clicks: item.clicks,
      prevClicks: oldClicks,
      impressions: item.impressions,
      prevImpressions: prev.impressions || 0,
      position: item.position,
      prevPosition: prev.position || 0,
      growthRate: Math.round(growthRate * 10) / 10,
    });
  }

  results.sort((a, b) => b.growthRate - a.growthRate);
  return results.slice(0, 10);
}

function generateInsights(latestQueries: any[], prevQueries: any[], latestPages: any[], prevPages: any[]) {
  const insights = [];

  const topPagesByClicks = [...latestPages]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
  if (topPagesByClicks.length > 0) {
    insights.push({
      type: 'top_pages',
      title: '核心优势页面',
      items: topPagesByClicks.map((p) => ({
        label: new URL(p.page).pathname,
        clicks: p.clicks,
        impressions: p.impressions,
      })),
    });
  }

  const bestRankedQueries = [...latestQueries]
    .filter((q) => q.position > 0)
    .sort((a, b) => a.position - b.position)
    .slice(0, 10);
  if (bestRankedQueries.length > 0) {
    insights.push({
      type: 'best_ranked',
      title: '排名最好的搜索词',
      items: bestRankedQueries.map((q) => ({
        label: q.query,
        position: q.position,
        clicks: q.clicks,
      })),
    });
  }

  if (prevQueries.length > 0) {
    const prevQueryMap = new Map();
    for (const q of prevQueries) prevQueryMap.set(q.query, q);

    const growingQueries = latestQueries
      .filter((q) => {
        const prev = prevQueryMap.get(q.query);
        if (!prev || prev.clicks === 0) return false;
        const growth = ((q.clicks - prev.clicks) / prev.clicks) * 100;
        return q.clicks > 5 && growth > 50;
      })
      .map((q) => {
        const prev = prevQueryMap.get(q.query);
        const growth = ((q.clicks - prev.clicks) / prev.clicks) * 100;
        return {
          label: q.query,
          clicks: q.clicks,
          prevClicks: prev.clicks,
          growth: Math.round(growth),
        };
      })
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 10);

    if (growingQueries.length > 0) {
      insights.push({
        type: 'growing_queries',
        title: '增长迅猛的搜索词',
        items: growingQueries,
      });
    }

    const decliningQueries = latestQueries
      .filter((q) => {
        const prev = prevQueryMap.get(q.query);
        if (!prev || prev.clicks === 0) return false;
        const change = ((q.clicks - prev.clicks) / prev.clicks) * 100;
        return change < -30;
      })
      .map((q) => {
        const prev = prevQueryMap.get(q.query);
        const change = ((q.clicks - prev.clicks) / prev.clicks) * 100;
        return {
          label: q.query,
          clicks: q.clicks,
          prevClicks: prev.clicks,
          change: Math.round(change),
        };
      })
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    if (decliningQueries.length > 0) {
      insights.push({
        type: 'declining_queries',
        title: '下降预警搜索词',
        items: decliningQueries,
      });
    }
  }

  if (prevPages.length > 0) {
    const prevPageMap = new Map();
    for (const p of prevPages) prevPageMap.set(p.page, p);

    const growingPages = latestPages
      .filter((p) => {
        const prev = prevPageMap.get(p.page);
        if (!prev || prev.clicks === 0) return false;
        const growth = ((p.clicks - prev.clicks) / prev.clicks) * 100;
        return p.clicks > 5 && growth > 50;
      })
      .map((p) => {
        const prev = prevPageMap.get(p.page);
        const growth = ((p.clicks - prev.clicks) / prev.clicks) * 100;
        return {
          label: new URL(p.page).pathname,
          clicks: p.clicks,
          prevClicks: prev.clicks,
          growth: Math.round(growth),
        };
      })
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 10);

    if (growingPages.length > 0) {
      insights.push({
        type: 'growing_pages',
        title: '增长迅猛的页面',
        items: growingPages,
      });
    }

    const decliningPages = latestPages
      .filter((p) => {
        const prev = prevPageMap.get(p.page);
        if (!prev || prev.clicks === 0) return false;
        const change = ((p.clicks - prev.clicks) / prev.clicks) * 100;
        return change < -30;
      })
      .map((p) => {
        const prev = prevPageMap.get(p.page);
        const change = ((p.clicks - prev.clicks) / prev.clicks) * 100;
        return {
          label: new URL(p.page).pathname,
          clicks: p.clicks,
          prevClicks: prev.clicks,
          change: Math.round(change),
        };
      })
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    if (decliningPages.length > 0) {
      insights.push({
        type: 'declining_pages',
        title: '下降预警页面',
        items: decliningPages,
      });
    }
  }

  return insights;
}

function computeQuadrants(pages: any[]) {
  if (!pages || pages.length < 4) return null;

  const sorted = [...pages].filter((p) => p.clicks > 0 || p.impressions > 0);
  if (sorted.length < 4) return null;

  const clicksSorted = sorted.map((p) => p.clicks).sort((a, b) => a - b);
  const impressionsSorted = sorted
    .map((p) => p.impressions)
    .sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const clicksMedian =
    sorted.length % 2 === 0
      ? (clicksSorted[mid - 1] + clicksSorted[mid]) / 2
      : clicksSorted[mid];
  const impressionsMedian =
    sorted.length % 2 === 0
      ? (impressionsSorted[mid - 1] + impressionsSorted[mid]) / 2
      : impressionsSorted[mid];

  const quadrants: any = {
    highImpHighClick: [],
    highImpLowClick: [],
    lowImpHighClick: [],
    lowImpLowClick: [],
  };

  for (const p of sorted) {
    const short =
      p.page
        .replace(/^https?:\/\/[^\/]+/, '')
        || '/';
    const item = {
      page: short,
      fullPage: p.page,
      clicks: p.clicks,
      impressions: p.impressions,
      ctr: p.ctr,
      position: p.position,
    };

    const highImp = p.impressions >= impressionsMedian;
    const highClick = p.clicks >= clicksMedian;

    if (highImp && highClick) quadrants.highImpHighClick.push(item);
    else if (highImp && !highClick) quadrants.highImpLowClick.push(item);
    else if (!highImp && highClick) quadrants.lowImpHighClick.push(item);
    else quadrants.lowImpLowClick.push(item);
  }

  for (const key of Object.keys(quadrants)) {
    quadrants[key].sort((a: any, b: any) => b.clicks - a.clicks);
    quadrants[key] = quadrants[key].slice(0, 15);
  }

  return {
    thresholds: {
      clicks: Math.round(clicksMedian * 10) / 10,
      impressions: Math.round(impressionsMedian * 10) / 10,
    },
    totalPages: sorted.length,
    counts: {
      highImpHighClick: quadrants.highImpHighClick.length,
      highImpLowClick: quadrants.highImpLowClick.length,
      lowImpHighClick: quadrants.lowImpHighClick.length,
      lowImpLowClick: quadrants.lowImpLowClick.length,
    },
    ...quadrants,
  };
}

function computeRankingDistribution(pages: any[], queries: any[]) {
  if ((!pages || pages.length === 0) && (!queries || queries.length === 0))
    return null;

  const validPages = (pages || []).filter((p) => p.position > 0);
  const validQueries = (queries || []).filter((q) => q.position > 0);

  function groupByPage(items: any[], keyField: string, maxPage: number) {
    const groups: any = {};
    for (let i = 1; i <= maxPage; i++) {
      groups[i] = [];
    }
    groups.other = [];

    for (const item of items) {
      const pageNum = Math.ceil(item.position / 10);
      const short =
        keyField === 'page'
          ? item[keyField]
              .replace(/^https?:\/\/[^\/]+/, '')
              || '/'
          : item[keyField];
      const entry = {
        [keyField]: short,
        fullValue: item[keyField],
        clicks: item.clicks,
        impressions: item.impressions,
        ctr: item.ctr,
        position: item.position,
      };
      if (pageNum >= 1 && pageNum <= maxPage) {
        groups[pageNum].push(entry);
      } else {
        groups.other.push(entry);
      }
    }

    for (const key of Object.keys(groups)) {
      groups[key].sort((a: any, b: any) => a.position - b.position);
    }

    return groups;
  }

  const pageGroups = groupByPage(validPages, 'page', 3);
  const queryGroups = groupByPage(validQueries, 'query', 3);

  return {
    totalPages: validPages.length,
    totalQueries: validQueries.length,
    pageCounts: {
      page1: pageGroups[1].length,
      page2: pageGroups[2].length,
      page3: pageGroups[3].length,
      other: pageGroups.other.length,
    },
    queryCounts: {
      page1: queryGroups[1].length,
      page2: queryGroups[2].length,
      page3: queryGroups[3].length,
      other: queryGroups.other.length,
    },
    pages: pageGroups,
    queries: queryGroups,
  };
}

function computeTrendAnalysis(allQueries: any[], allPages: any[], importPeriods: any[]) {
  const periods = importPeriods.slice(0, 2);

  if (periods.length < 2) {
    return {
      periods: periods.length,
      message: '仅 1 次数据，无法进行变更分析',
    };
  }

  function aggregateByPeriod(data: any[], period: string) {
    const [from, to] = period.split('|');
    return data.filter((d) => d.date_from === from && d.date_to === to);
  }

  function summarizePeriod(queries: any[], pages: any[]) {
    const totalClicks = queries.reduce((s, q) => s + q.clicks, 0);
    const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0);
    const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const validPos = queries.filter((q) => q.position > 0);
    const avgPosition =
      validPos.length > 0
        ? validPos.reduce((s, q) => s + q.position, 0) / validPos.length
        : 0;
    const pageTotalClicks = pages.reduce((s, p) => s + p.clicks, 0);
    return {
      totalClicks,
      totalImpressions,
      avgCTR,
      avgPosition,
      pageTotalClicks,
      queryCount: queries.length,
      pageCount: pages.length,
    };
  }

  const periodData = periods.map((p) => {
    const [from, to] = p.split('|');
    const queries = aggregateByPeriod(allQueries, p);
    const pages = aggregateByPeriod(allPages, p);
    return {
      period: p,
      dateFrom: from,
      dateTo: to,
      queries,
      pages,
      summary: summarizePeriod(queries, pages),
    };
  });

  const latest = periodData[0];
  const prev = periodData[1];

  function pctChange(curr: number, old: number) {
    if (old === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - old) / old) * 1000) / 10;
  }

  const overallChanges = {
    clicks: {
      current: latest.summary.totalClicks,
      previous: prev.summary.totalClicks,
      change: pctChange(latest.summary.totalClicks, prev.summary.totalClicks),
    },
    impressions: {
      current: latest.summary.totalImpressions,
      previous: prev.summary.totalImpressions,
      change: pctChange(
        latest.summary.totalImpressions,
        prev.summary.totalImpressions,
      ),
    },
    ctr: {
      current: latest.summary.avgCTR,
      previous: prev.summary.avgCTR,
      change: pctChange(latest.summary.avgCTR, prev.summary.avgCTR),
    },
    position: {
      current: latest.summary.avgPosition,
      previous: prev.summary.avgPosition,
      change: pctChange(latest.summary.avgPosition, prev.summary.avgPosition),
    },
  };

  const latestQueryMap = new Map();
  for (const q of latest.queries) latestQueryMap.set(q.query, q);
  const prevQueryMap = new Map();
  for (const q of prev.queries) prevQueryMap.set(q.query, q);

  const newQueries = latest.queries
    .filter((q: any) => !prevQueryMap.has(q.query))
    .sort((a: any, b: any) => b.clicks - a.clicks)
    .slice(0, 10)
    .map((q: any) => ({
      query: q.query,
      clicks: q.clicks,
      impressions: q.impressions,
      position: q.position,
    }));

  const lostQueries = prev.queries
    .filter((q: any) => !latestQueryMap.has(q.query))
    .sort((a: any, b: any) => b.clicks - a.clicks)
    .slice(0, 10)
    .map((q: any) => ({
      query: q.query,
      clicks: q.clicks,
      impressions: q.impressions,
      position: q.position,
    }));

  const rankChanges = [];
  for (const q of latest.queries) {
    const pq = prevQueryMap.get(q.query);
    if (!pq) continue;
    const diff = pq.position - q.position;
    if (Math.abs(diff) > 3) {
      rankChanges.push({
        query: q.query,
        currentPos: q.position,
        previousPos: pq.position,
        change: Math.round(diff * 10) / 10,
        clicks: q.clicks,
      });
    }
  }
  rankChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const topRankChanges = rankChanges.slice(0, 10);

  const latestPageMap = new Map();
  for (const p of latest.pages) latestPageMap.set(p.page, p);
  const prevPageMap = new Map();
  for (const p of prev.pages) prevPageMap.set(p.page, p);

  const pageClickChanges = [];
  for (const p of latest.pages) {
    const pp = prevPageMap.get(p.page);
    if (!pp) continue;
    const diff = p.clicks - pp.clicks;
    pageClickChanges.push({
      page: p.page.replace(/^https?:\/\/[^\/]+/, '') || '/',
      fullPage: p.page,
      currentClicks: p.clicks,
      previousClicks: pp.clicks,
      change: diff,
      changePct:
        pp.clicks > 0 ? pctChange(p.clicks, pp.clicks) : p.clicks > 0 ? 100 : 0,
    });
  }
  pageClickChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const topPageChanges = pageClickChanges.slice(0, 5);

  const newPages = latest.pages
    .filter((p: any) => !prevPageMap.has(p.page))
    .sort((a: any, b: any) => b.clicks - a.clicks)
    .slice(0, 5)
    .map((p: any) => ({
      page: p.page.replace(/^https?:\/\/[^\/]+/, '') || '/',
      fullPage: p.page,
      clicks: p.clicks,
      impressions: p.impressions,
    }));

  const lostPages = prev.pages
    .filter((p: any) => !latestPageMap.has(p.page))
    .sort((a: any, b: any) => b.clicks - a.clicks)
    .slice(0, 5)
    .map((p: any) => ({
      page: p.page.replace(/^https?:\/\/[^\/]+/, '') || '/',
      fullPage: p.page,
      clicks: p.clicks,
      impressions: p.impressions,
    }));

  return {
    periods: periods.length,
    periodDetails: periodData.map((p) => ({
      dateFrom: p.dateFrom,
      dateTo: p.dateTo,
      summary: p.summary,
    })),
    overallChanges,
    newQueries,
    lostQueries,
    topRankChanges,
    topPageChanges,
    newPages,
    lostPages,
  };
}
