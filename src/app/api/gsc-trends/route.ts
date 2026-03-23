// =====================================================
// GSC 趋势数据 API
// GET /api/gsc-trends?range=7d|28d|3m
// 7d 固定为 3.14-3.20
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 时间范围配置
const timeRanges: Record<string, { days: number; label: string }> = {
  "7d": { days: 7, label: "7天" },
  "28d": { days: 28, label: "28天" },
  "3m": { days: 90, label: "3个月" },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const config = timeRanges[range] || timeRanges["7d"];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 使用今天的日期（2026-03-22），截止日期往前推2天（即3月20日）
    const today = new Date("2026-03-22");
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 2); // 往前推2天
    
    // 计算起始日期
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - config.days + 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    console.log(`[GSC Trends] ${config.label}: ${startDateStr} 到 ${endDateStr}`);

    // 从数据库获取数据
    const { data: pageData, error } = await supabase
      .from("maidinhk_gsc_pages")
      .select("date, clicks, impressions, ctr, position")
      .gte("date", startDateStr)
      .lte("date", endDateStr)
      .order("date", { ascending: true });

    if (error) {
      console.error("[GSC Trends] DB error:", error);
      return NextResponse.json({ error: "数据库错误" }, { status: 500 });
    }

    // 按日期聚合
    const dailyStats: Record<string, {
      clicks: number;
      impressions: number;
      totalPositionWeighted: number;
    }> = {};

    (pageData || []).forEach((row: any) => {
      const date = row.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { clicks: 0, impressions: 0, totalPositionWeighted: 0 };
      }
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;
      
      dailyStats[date].clicks += clicks;
      dailyStats[date].impressions += impressions;
      dailyStats[date].totalPositionWeighted += position * impressions;
    });

    // 转换为图表数据
    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      clicks: stats.clicks,
      impressions: stats.impressions,
      ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
      position: stats.impressions > 0 ? stats.totalPositionWeighted / stats.impressions : 0,
    }));

    // 填充缺失日期
    const filledData = fillMissingDates(chartData, startDateStr, endDateStr);

    // 计算总计
    const totals = filledData.reduce(
      (acc, day) => ({
        totalClicks: acc.totalClicks + day.clicks,
        totalImpressions: acc.totalImpressions + day.impressions,
        totalPositionWeighted: acc.totalPositionWeighted + (day.position * day.impressions),
      }),
      { totalClicks: 0, totalImpressions: 0, totalPositionWeighted: 0 }
    );

    return NextResponse.json({
      data: filledData,
      summary: {
        totalClicks: totals.totalClicks,
        totalImpressions: totals.totalImpressions,
        avgCtr: totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0,
        avgPosition: totals.totalImpressions > 0 ? totals.totalPositionWeighted / totals.totalImpressions : 0,
      },
      range,
      meta: {
        startDate: startDateStr,
        endDate: endDateStr,
        dataPoints: filledData.length,
      },
    });

  } catch (error) {
    console.error("[GSC Trends] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

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
