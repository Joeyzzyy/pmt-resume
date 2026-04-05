// =====================================================
// GSC 趋势数据 API (双表架构版本)
// GET /api/gsc-trends?range=7d|28d|3m
// 从 gsc_current 表获取最新数据
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 时间范围配置
const timeRanges: Record<string, { days: number; label: string }> = {
  "7d": { days: 7, label: "7天" },
  "28d": { days: 28, label: "28天" },
  "3m": { days: 90, label: "3个月" },
};

// 模拟数据（当数据库无数据时使用）
const mockTrendData = {
  "7d": {
    data: Array.from({ length: 7 }, (_, i) => {
      const date = new Date('2026-03-20');
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 50) + 80,
        impressions: Math.floor(Math.random() * 1000) + 3000,
        ctr: 2.5 + Math.random() * 1,
        position: 8 + Math.random() * 2,
      };
    }),
    summary: {
      totalClicks: 623,
      totalImpressions: 24580,
      avgCtr: 2.71,
      avgPosition: 8.2,
    },
  },
  "28d": {
    data: Array.from({ length: 28 }, (_, i) => {
      const date = new Date('2026-03-20');
      date.setDate(date.getDate() - (27 - i));
      return {
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 60) + 70,
        impressions: Math.floor(Math.random() * 1200) + 2800,
        ctr: 2.3 + Math.random() * 1.2,
        position: 8.5 + Math.random() * 2.5,
      };
    }),
    summary: {
      totalClicks: 2847,
      totalImpressions: 98234,
      avgCtr: 2.65,
      avgPosition: 8.8,
    },
  },
  "3m": {
    data: Array.from({ length: 90 }, (_, i) => {
      const date = new Date('2026-03-20');
      date.setDate(date.getDate() - (89 - i));
      return {
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 70) + 60,
        impressions: Math.floor(Math.random() * 1500) + 2500,
        ctr: 2.1 + Math.random() * 1.5,
        position: 9 + Math.random() * 3,
      };
    }),
    summary: {
      totalClicks: 9876,
      totalImpressions: 345678,
      avgCtr: 2.58,
      avgPosition: 9.2,
    },
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const config = timeRanges[range] || timeRanges["7d"];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 如果没有环境变量，返回模拟数据
    if (!supabaseUrl || !supabaseKey) {
      console.log("[GSC Trends] Using mock data (no env vars)");
      return NextResponse.json({
        ...mockTrendData[range as keyof typeof mockTrendData],
        range,
        meta: {
          startDate: mockTrendData[range as keyof typeof mockTrendData].data[0].date,
          endDate: mockTrendData[range as keyof typeof mockTrendData].data[mockTrendData[range as keyof typeof mockTrendData].data.length - 1].date,
          dataPoints: mockTrendData[range as keyof typeof mockTrendData].data.length,
          isMock: true,
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 查询数据库中最新导入的日期作为截止日期
    const { data: maxDateResult, error: maxDateError } = await supabase
      .from("maidinhk_gsc_current")
      .select("date")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const fallbackDate = new Date("2026-03-20");
    const endDate = maxDateResult && !maxDateError 
      ? new Date(maxDateResult.date) 
      : fallbackDate;
    
    // 计算起始日期
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - config.days + 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    console.log(`[GSC Trends] ${config.label}: ${startDateStr} 到 ${endDateStr}`);

    // 从 current 表获取数据（包括所有类型：page, query, summary）
    const { data: pageData, error } = await supabase
      .from("maidinhk_gsc_current")
      .select("date, clicks, impressions, ctr, position")
      .gte("date", startDateStr)
      .lte("date", endDateStr)
      .order("date", { ascending: true });

    if (error) {
      console.error("[GSC Trends] DB error:", error);
      return NextResponse.json({ 
        error: "数据库错误",
        ...mockTrendData[range as keyof typeof mockTrendData],
        isMock: true,
      }, { status: 500 });
    }

    // 如果没有数据，返回模拟数据
    if (!pageData || pageData.length === 0) {
      console.log("[GSC Trends] No data found, returning mock data");
      return NextResponse.json({
        ...mockTrendData[range as keyof typeof mockTrendData],
        range,
        meta: {
          startDate: startDateStr,
          endDate: endDateStr,
          dataPoints: mockTrendData[range as keyof typeof mockTrendData].data.length,
          isMock: true,
        },
      });
    }

    // 按日期聚合
    const dailyStats: Record<string, {
      clicks: number;
      impressions: number;
      totalPositionWeighted: number;
    }> = {};

    (pageData || []).forEach((row: { date: string; clicks: number; impressions: number; position: number }) => {
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
        isMock: false,
      },
    });

  } catch (error) {
    console.error("[GSC Trends] Error:", error);
    const range = new URL(request.url).searchParams.get("range") || "7d";
    return NextResponse.json({
      error: "服务器错误",
      ...mockTrendData[range as keyof typeof mockTrendData],
      isMock: true,
    }, { status: 500 });
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
