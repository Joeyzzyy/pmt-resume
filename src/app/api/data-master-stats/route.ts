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
};

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
    ] = await Promise.all([
      // 搜索词总数
      supabase
        .from("maidinhk_gsc_data")
        .select("*", { count: "exact", head: true }),

      // 页面总数
      supabase
        .from("maidinhk_gsc_pages")
        .select("*", { count: "exact", head: true }),

      // 热门搜索词 Top 10
      supabase
        .from("maidinhk_gsc_data")
        .select("query, impressions, clicks, ctr, position")
        .order("impressions", { ascending: false })
        .limit(10),

      // 热门页面 Top 10
      supabase
        .from("maidinhk_gsc_pages")
        .select("page, impressions, clicks, ctr, position")
        .order("impressions", { ascending: false })
        .limit(10),

      // 需要优化的页面
      supabase
        .from("maidinhk_gsc_pages")
        .select("page, impressions, clicks, ctr, position")
        .gte("impressions", 100)
        .lte("ctr", 0.03)
        .order("impressions", { ascending: false })
        .limit(5),
    ]);

    const queryCount = queryCountResult.count || mockData.queryCount;
    const pageCount = pageCountResult.count || mockData.pageCount;

    return NextResponse.json({
      queryCount,
      pageCount,
      totalCount: queryCount + pageCount,
      topQueries: topQueriesResult.data || mockData.topQueries,
      topPages: topPagesResult.data || mockData.topPages,
      optimizationTargets: optimizationTargetsResult.data || mockData.optimizationTargets,
    });
  } catch (error) {
    console.error("[Data Master Stats] Error:", error);
    // 出错时返回模拟数据而不是 500 错误
    console.log("[Data Master Stats] Returning mock data due to error");
    return NextResponse.json(mockData);
  }
}
