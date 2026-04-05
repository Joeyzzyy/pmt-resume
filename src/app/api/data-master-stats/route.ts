import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 模拟数据（当环境变量未配置时使用）
const mockData = {
  queryCount: 7897,
  pageCount: 6917,
  totalCount: 14814,
  topQueries: [
    { query: "香港外傭最低工資 2026", impressions: 331, clicks: 0, ctr: 0, position: 4.2 },
    { query: "外傭最低工資2026", impressions: 312, clicks: 2, ctr: 0.0064, position: 11.2 },
    { query: "工人姐姐返大陸簽證收費", impressions: 203, clicks: 5, ctr: 0.0246, position: 10.8 },
    { query: "工人黑名單", impressions: 145, clicks: 12, ctr: 0.0828, position: 4.5 },
    { query: "外傭黑名單", impressions: 106, clicks: 4, ctr: 0.0377, position: 2.3 },
    { query: "工人姐姐黑名單", impressions: 77, clicks: 8, ctr: 0.1039, position: 2.3 },
    { query: "工人姐姐人工2026", impressions: 77, clicks: 0, ctr: 0, position: 10.8 },
    { query: "印傭人工", impressions: 67, clicks: 0, ctr: 0, position: 12.1 },
    { query: "外傭人工2026", impressions: 67, clicks: 0, ctr: 0, position: 11.6 },
    { query: "夏季宝宝衣物洗滌消毒最新方法", impressions: 58, clicks: 0, ctr: 0, position: 9.1 },
  ],
  topPages: [
    { page: "https://maidinhk.com/blog/minimum-wage-and-budget", impressions: 3249, clicks: 21, ctr: 0.0065, position: 7.8 },
    { page: "https://maidinhk.com/blog/visa-application-process", impressions: 4188, clicks: 106, ctr: 0.0253, position: 9.3 },
    { page: "https://maidinhk.com/blog/filipino-vs-indonesian-salary-cost", impressions: 2390, clicks: 19, ctr: 0.0080, position: 10.2 },
    { page: "https://maidinhk.com/blog/long-service-payment-rules", impressions: 872, clicks: 12, ctr: 0.0138, position: 13.6 },
    { page: "https://maidinhk.com/blog/local-vs-overseas-helper-contract-differences", impressions: 1202, clicks: 39, ctr: 0.0324, position: 8.6 },
    { page: "https://maidinhk.com/blog/local-vs-overseas-helper-timeline-comparison", impressions: 1468, clicks: 50, ctr: 0.0341, position: 11.1 },
    { page: "https://maidinhk.com/blog/apply-for-helper", impressions: 504, clicks: 1, ctr: 0.0020, position: 15.0 },
    { page: "https://maidinhk.com/blog/local-helper-interview-guide-10-questions", impressions: 691, clicks: 19, ctr: 0.0275, position: 8.9 },
    { page: "https://maidinhk.com/blog/baby-burping-techniques", impressions: 288, clicks: 3, ctr: 0.0104, position: 7.8 },
    { page: "https://maidinhk.com/blog/newborn-milk-volume", impressions: 312, clicks: 5, ctr: 0.0160, position: 7.5 },
  ],
  optimizationTargets: [
    { page: "https://maidinhk.com/blog/minimum-wage-and-budget", impressions: 3249, clicks: 21, ctr: 0.0065, position: 7.8 },
    { page: "https://maidinhk.com/blog/filipino-vs-indonesian-salary-cost", impressions: 2390, clicks: 19, ctr: 0.0080, position: 10.2 },
    { page: "https://maidinhk.com/blog/long-service-payment-rules", impressions: 872, clicks: 12, ctr: 0.0138, position: 13.6 },
    { page: "https://maidinhk.com/blog/apply-for-helper", impressions: 504, clicks: 1, ctr: 0.0020, position: 15.0 },
    { page: "https://maidinhk.com/blog/baby-burping-techniques", impressions: 288, clicks: 3, ctr: 0.0104, position: 7.8 },
  ],
  rankingDistribution: [
    { range: "top1-5", label: "Top 1-5", count: 8, percentage: 3.4, color: "#27c3da", description: "首页顶部，冲刺 Top 3" },
    { range: "top6-10", label: "Top 6-10", count: 174, percentage: 73.7, color: "#5fd4e6", description: "首页中部，稳定流量" },
    { range: "top11-30", label: "Top 11-30", count: 33, percentage: 14.0, color: "#8e24aa", description: "第2-3页，潜力待挖" },
    { range: "beyond30", label: "31+", count: 21, percentage: 8.9, color: "#e0e0e0", description: "第4页后，需重点优化" },
  ],
  searchIntent: [
    { dimension: "信息价值", siteAverage: 72, highClickPages: 85, topKeywords: ["外傭黑名單", "工人姐姐工作清單", "外傭每日工作程序表"], description: "用户主动搜索外佣相关政策、流程类信息 (占比 93%)", weight: 0.9 },
    { dimension: "交易转化", siteAverage: 45, highClickPages: 92, topKeywords: ["工人姐姐返大陸簽證收費", "請工人心得", "外傭欠債如何處理"], description: "用户有明确问题需要解决 (占比 6%)", weight: 1.2 },
    { dimension: "商业潜力", siteAverage: 58, highClickPages: 78, topKeywords: ["工人姐姐規矩", "請工人注意", "外傭管理方法"], description: "用户处于学习和评估阶段 (占比 1%)", weight: 1.0 },
    { dimension: "品牌知名度", siteAverage: 38, highClickPages: 65, topKeywords: ["maidinhk", "maidinhk.com", "外傭僱傭中心"], description: "用户主动搜索品牌 (占比 <1%)", weight: 0.8 },
    { dimension: "长尾覆盖", siteAverage: 65, highClickPages: 70, topKeywords: ["工人姐姐斷約處理", "外傭偷懶點算", "菲傭情緒問題"], description: "覆盖细分痛点问题，体现内容深度", weight: 0.85 },
  ],
};

// 意图检测函数
function detectIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  const informationalPatterns = [
    '流程', '点样', '指南', '手续', '如何', '怎样', '教程',
    '攻略', '方法', '步骤', '介绍', '解释', '是什么', '为什么',
    '怎么', '何如', '求', '問', '问题', 'FAQ', 'what', 'how to',
    'guide', 'tutorial', 'step', 'process', 'procedure'
  ];

  const commercialPatterns = [
    '中介', '比较', '边间好', '推荐', '评测', '对比', '哪个好',
    '最好', '排名', '排行榜', '前十', '评价', '口碑', 'vs',
    'versus', 'compare', 'best', 'top', 'review', 'recommend'
  ];

  const transactionalPatterns = [
    // 简体
    '预约', '价格', '收费', '地址', '电话', '联系', '购买',
    '订购', '报名', '申请', '下载', '免费', '优惠', '报价',
    '试用', '咨询', '服务', '付款', '费用', '多少钱', '怎么收费',
    // 繁体/香港常用
    '預約', '價格', '收費', '電話', '聯繫', '聯絡', '購買',
    '訂購', '報名', '申請', '下載', '免費', '優惠', '報價',
    '試用', '諮詢', '服務', '付款', '費用', '多少錢', '點收費',
    '幾錢', '價錢', '月費', '年費', '手續費', '代辦費', '中介費',
    '續約', '解約', '賠償', '保險', '合約', '簽證費', '機票',
    // 英文
    'discount', 'price', 'cost', 'buy', 'purchase', 'order', 'book',
    'download', 'fee', 'charge', 'payment', 'pay', 'quote', 'service'
  ];

  const navigationalPatterns = [
    'maidinhk', 'maidin', '美迪', '官网', '首页', '网站',
    'official', 'homepage', 'login', 'sign in'
  ];

  if (transactionalPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) return 'Transactional';
  if (commercialPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) return 'Commercial';
  if (informationalPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) return 'Informational';
  if (navigationalPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) return 'Navigational';

  return 'Informational';
}

export async function GET() {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 如果没有环境变量，返回模拟数据
    if (!supabaseUrl || !supabaseKey) {
      console.log("[Data Master Stats] Using mock data (no env vars)");
      return NextResponse.json(mockData);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 并行获取所有数据
    const [
      queryCountResult,
      pageCountResult,
      topQueriesResult,
      topPagesResult,
      optimizationTargetsResult,
      allPagesResult,
      allQueriesResult,
      latestUploadResult,
    ] = await Promise.all([
      // 搜索词总数 - 从 current 表获取 query 类型数据
      supabase
        .from("maidinhk_gsc_current")
        .select("*", { count: "exact", head: true })
        .eq("data_type", "query"),

      // 页面总数 - 从 current 表获取 page 类型数据
      supabase
        .from("maidinhk_gsc_current")
        .select("*", { count: "exact", head: true })
        .eq("data_type", "page")
        .neq("page", "_SUMMARY_"),

      // 热门搜索词 Top 10
      supabase
        .from("maidinhk_gsc_current")
        .select("page, impressions, clicks, ctr, position")
        .eq("data_type", "query")
        .order("impressions", { ascending: false })
        .limit(10),

      // 热门页面 Top 15
      supabase
        .from("maidinhk_gsc_current")
        .select("page, impressions, clicks, ctr, position")
        .eq("data_type", "page")
        .neq("page", "_SUMMARY_")
        .order("impressions", { ascending: false })
        .limit(15),

      // 需要优化的页面
      supabase
        .from("maidinhk_gsc_current")
        .select("page, impressions, clicks, ctr, position")
        .eq("data_type", "page")
        .neq("page", "_SUMMARY_")
        .gte("impressions", 100)
        .lte("ctr", 0.03)
        .order("impressions", { ascending: false })
        .limit(5),

      // 所有页面数据（用于排名分布）
      supabase
        .from("maidinhk_gsc_current")
        .select("page, position")
        .eq("data_type", "page")
        .neq("page", "_SUMMARY_"),

      // 所有查询数据（用于意图分析）
      supabase
        .from("maidinhk_gsc_current")
        .select("page, clicks, impressions, ctr, position")
        .eq("data_type", "query")
        .order("clicks", { ascending: false })
        .limit(100),
      
      // 最新上传批次信息
      supabase
        .from("maidinhk_gsc_upload_log")
        .select("upload_batch, upload_date, notes")
        .order("upload_date", { ascending: false })
        .limit(1)
        .single(),
    ]);

    const queryCount = queryCountResult.count || mockData.queryCount;
    const pageCount = pageCountResult.count || mockData.pageCount;

    // 转换 topQueries 数据格式
    const topQueries = topQueriesResult.data?.map((row: { page: string; impressions: number; clicks: number; ctr: number; position: number }) => ({
      query: row.page,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    })) || mockData.topQueries;

    // 计算排名分布
    let rankingDistribution = mockData.rankingDistribution;
    if (allPagesResult.data && allPagesResult.data.length > 0) {
      const pageRankings: Record<string, number[]> = {};
      allPagesResult.data.forEach((row: { page: string; position: number }) => {
        if (!pageRankings[row.page]) pageRankings[row.page] = [];
        pageRankings[row.page].push(row.position);
      });

      const avgPositions = Object.values(pageRankings).map(positions => 
        positions.reduce((a, b) => a + b, 0) / positions.length
      );

      const top1to5 = avgPositions.filter(p => p <= 5).length;
      const top6to10 = avgPositions.filter(p => p > 5 && p <= 10).length;
      const top11to30 = avgPositions.filter(p => p > 10 && p <= 30).length;
      const beyond30 = avgPositions.filter(p => p > 30).length;
      const total = avgPositions.length;

      rankingDistribution = [
        { range: "top1-5", label: "Top 1-5", count: top1to5, percentage: total > 0 ? Math.round((top1to5 / total) * 100 * 10) / 10 : 0, color: "#27c3da", description: "首页顶部，冲刺 Top 3" },
        { range: "top6-10", label: "Top 6-10", count: top6to10, percentage: total > 0 ? Math.round((top6to10 / total) * 100 * 10) / 10 : 0, color: "#5fd4e6", description: "首页中部，稳定流量" },
        { range: "top11-30", label: "Top 11-30", count: top11to30, percentage: total > 0 ? Math.round((top11to30 / total) * 100 * 10) / 10 : 0, color: "#8e24aa", description: "第2-3页，潜力待挖" },
        { range: "beyond30", label: "31+", count: beyond30, percentage: total > 0 ? Math.round((beyond30 / total) * 100 * 10) / 10 : 0, color: "#e0e0e0", description: "第4页后，需重点优化" },
      ];
    }

    // 计算搜索意图分布
    let searchIntent = mockData.searchIntent;
    if (allQueriesResult.data && allQueriesResult.data.length > 0) {
      const intentGroups: Record<string, { page: string; clicks: number; impressions: number; ctr: number; position: number }[]> = {
        Informational: [],
        Commercial: [],
        Transactional: [],
        Navigational: [],
      };

      allQueriesResult.data.forEach((row: { page: string; clicks: number; impressions: number; ctr: number; position: number }) => {
        const intent = detectIntent(row.page);
        if (intentGroups[intent]) {
          intentGroups[intent].push(row);
        }
      });

      const calculateScore = (items: { clicks: number; position: number }[]) => {
        if (items.length === 0) return 0;
        const avgClicks = items.reduce((sum, item) => sum + item.clicks, 0) / items.length;
        const avgPosition = items.reduce((sum, item) => sum + item.position, 0) / items.length;
        const clickScore = Math.min(avgClicks * 5, 60);
        const positionScore = Math.max(0, (30 - avgPosition) * 1.5);
        return Math.round(Math.min(clickScore + positionScore, 100));
      };

      const infoScore = calculateScore(intentGroups.Informational);
      const commercialScore = calculateScore(intentGroups.Commercial);
      const transScore = calculateScore(intentGroups.Transactional);
      const navScore = calculateScore(intentGroups.Navigational);

      const getTopKeywords = (items: { page: string }[]) => 
        items.slice(0, 3).map((item) => item.page);

      searchIntent = [
        { dimension: "信息价值", siteAverage: Math.round(infoScore * 0.85), highClickPages: infoScore, topKeywords: getTopKeywords(intentGroups.Informational).length > 0 ? getTopKeywords(intentGroups.Informational) : mockData.searchIntent[0].topKeywords, description: "用户主动搜索外佣相关政策、流程类信息", weight: 0.9 },
        { dimension: "交易转化", siteAverage: Math.round(transScore * 0.6), highClickPages: transScore, topKeywords: getTopKeywords(intentGroups.Transactional).length > 0 ? getTopKeywords(intentGroups.Transactional) : mockData.searchIntent[1].topKeywords, description: "用户有明确问题需要解决", weight: 1.2 },
        { dimension: "商业潜力", siteAverage: Math.round(commercialScore * 0.75), highClickPages: commercialScore, topKeywords: getTopKeywords(intentGroups.Commercial).length > 0 ? getTopKeywords(intentGroups.Commercial) : mockData.searchIntent[2].topKeywords, description: "用户处于学习和评估阶段", weight: 1.0 },
        { dimension: "品牌知名度", siteAverage: Math.round(navScore * 0.6), highClickPages: navScore, topKeywords: getTopKeywords(intentGroups.Navigational).length > 0 ? getTopKeywords(intentGroups.Navigational) : mockData.searchIntent[3].topKeywords, description: "用户主动搜索品牌", weight: 0.8 },
        { dimension: "长尾覆盖", siteAverage: Math.round((infoScore + commercialScore) / 2 * 0.9), highClickPages: Math.round((infoScore + commercialScore) / 2), topKeywords: mockData.searchIntent[4].topKeywords, description: "覆盖细分痛点问题，体现内容深度", weight: 0.85 },
      ];
    }

    return NextResponse.json({
      queryCount,
      pageCount,
      totalCount: queryCount + pageCount,
      topQueries,
      topPages: topPagesResult.data || mockData.topPages,
      optimizationTargets: optimizationTargetsResult.data || mockData.optimizationTargets,
      rankingDistribution,
      searchIntent,
      latestUpload: latestUploadResult.data || null,
    });
  } catch (error) {
    console.error("[Data Master Stats] Error:", error);
    console.log("[Data Master Stats] Returning mock data due to error");
    return NextResponse.json(mockData);
  }
}
