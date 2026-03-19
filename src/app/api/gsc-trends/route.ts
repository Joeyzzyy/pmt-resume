import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 时间范围配置（天数）
const timeRanges: Record<string, number> = {
  "7d": 7, // 最近7天
  "28d": 28, // 最近28天
  "3m": 90, // 最近90天（约3个月）
};

// 分页获取所有数据
async function fetchAllData(
  supabase: any,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const allData: any[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("maidinhk_gsc_pages")
      .select("date, clicks, impressions, ctr, position")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("[GSC Trends] Fetch error:", error);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "28d";
    const days = timeRanges[range] || 28;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // 获取数据库中最新的日期
    const { data: latestDateData } = await supabase
      .from("maidinhk_gsc_pages")
      .select("date")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    // 使用数据库中的最新日期，如果没有则使用今天
    const today = latestDateData?.date ? new Date(latestDateData.date) : new Date();

    // 计算起始日期
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(today);

    console.log(`[GSC Trends] Range: ${range}, Days: ${days}, From: ${startDateStr} To: ${endDateStr}`);

    // 使用分页获取所有数据
    const pageData = await fetchAllData(supabase, startDateStr, endDateStr);

    console.log(`[GSC Trends] Fetched ${pageData.length} rows`);

    // 按日期聚合数据
    const dailyStats: Record<
      string,
      { clicks: number; impressions: number; totalCtr: number; totalPosition: number; count: number }
    > = {};

    pageData.forEach((row) => {
      const date = row.date;
      if (!dailyStats[date]) {
        dailyStats[date] = {
          clicks: 0,
          impressions: 0,
          totalCtr: 0,
          totalPosition: 0,
          count: 0,
        };
      }
      dailyStats[date].clicks += row.clicks || 0;
      dailyStats[date].impressions += row.impressions || 0;
      dailyStats[date].totalCtr += row.ctr || 0;
      dailyStats[date].totalPosition += row.position || 0;
      dailyStats[date].count += 1;
    });

    // 转换为图表数据格式
    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      clicks: stats.clicks,
      impressions: stats.impressions,
      ctr: stats.count > 0 ? (stats.totalCtr / stats.count) * 100 : 0,
      position: stats.count > 0 ? stats.totalPosition / stats.count : 0,
    }));

    console.log(`[GSC Trends] Aggregated dates:`, chartData.map((d) => d.date));

    // 填充缺失的日期（确保连续性）
    const filledData = fillMissingDates(chartData, startDateStr, endDateStr);

    // 计算总计数据
    const totals = filledData.reduce(
      (acc, day) => ({
        totalClicks: acc.totalClicks + day.clicks,
        totalImpressions: acc.totalImpressions + day.impressions,
        totalCtr: acc.totalCtr + day.ctr,
        totalPosition: acc.totalPosition + day.position,
        count: acc.count + (day.clicks > 0 || day.impressions > 0 ? 1 : 0),
      }),
      { totalClicks: 0, totalImpressions: 0, totalCtr: 0, totalPosition: 0, count: 0 }
    );

    const result = {
      data: filledData,
      summary: {
        totalClicks: totals.totalClicks,
        totalImpressions: totals.totalImpressions,
        avgCtr: totals.count > 0 ? totals.totalCtr / totals.count : 0,
        avgPosition: totals.count > 0 ? totals.totalPosition / totals.count : 0,
      },
      range,
      meta: {
        startDate: startDateStr,
        endDate: endDateStr,
        dataPoints: filledData.length,
      },
    };

    console.log(`[GSC Trends] Result:`, result.summary);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GSC Trends] API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 填充缺失的日期
function fillMissingDates(
  data: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>,
  startDate: string,
  endDate: string
) {
  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dataMap = new Map(data.map((d) => [d.date, d]));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const existing = dataMap.get(dateStr);
    result.push(
      existing || {
        date: dateStr,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      }
    );
  }

  return result;
}
