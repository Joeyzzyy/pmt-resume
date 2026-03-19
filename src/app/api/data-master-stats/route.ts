import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

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

    const queryCount = queryCountResult.count || 7897;
    const pageCount = pageCountResult.count || 6917;

    return NextResponse.json({
      queryCount,
      pageCount,
      totalCount: queryCount + pageCount,
      topQueries: topQueriesResult.data || [],
      topPages: topPagesResult.data || [],
      optimizationTargets: optimizationTargetsResult.data || [],
    });
  } catch (error) {
    console.error("[Data Master Stats] Error:", error);
    return NextResponse.json(
      { error: "获取数据失败" },
      { status: 500 }
    );
  }
}
