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

    // 查询数据库中 summary 类型数据的最新日期
    const { data: maxDateResult, error: maxDateError } = await supabase
      .from("maidinhk_gsc_current")
      .select("date")
      .eq("data_type", "summary")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const fallbackDate = new Date("2026-03-20");
    const maxDateInDb = maxDateResult && !maxDateError 
      ? maxDateResult.date 
      : fallbackDate.toISOString().split("T")[0];
    
    // 查询实际有数据的最近日期（排除未来的空数据）
    const { data: lastDataResult } = await supabase
      .from("maidinhk_gsc_current")
      .select("date, clicks")
      .eq("data_type", "summary")
      .gt("clicks", 0)
      .order("date", { ascending: false })
      .limit(1)
      .single();
    
    const actualLastDate = lastDataResult?.date || maxDateInDb;
    const endDate = new Date(actualLastDate);
    
    // 计算起始日期
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - config.days + 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    console.log(`[GSC Trends] ${config.label}: ${startDateStr} 到 ${endDateStr}`);

    // 从 current 表获取 Chart/Summary 数据（用于趋势图）
    const { data: pageData, error } = await supabase
      .from("maidinhk_gsc_current")
      .select("date, clicks, impressions, ctr, position")
      .eq("data_type", "summary")
      .gte("date", startDateStr)
      .lte("date", endDateStr)
      .order("date", { ascending: true });
    
    // 获取所有 Query 数据计算正确的汇总统计（GSC Query 报告包含所有查询的总和）
    const { data: summaryData } = await supabase
      .from("maidinhk_gsc_current")
      .select("date, clicks, impressions, ctr, position")
      .eq("data_type", "query")
      .gte("date", startDateStr)
      .lte("date", endDateStr);

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

    // 转换为图表数据并按日期排序
    const chartData = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        clicks: stats.clicks,
        impressions: stats.impressions,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
        position: stats.impressions > 0 ? stats.totalPositionWeighted / stats.impressions : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 确定实际的数据日期范围（以Excel中实际有数据的日期为准，不是上传日期）
    // 过滤掉点击量异常的日期（上传日期的累计数据）
    const nonZeroData = chartData.filter(d => d.clicks > 0);
    
    // 计算平均点击量和标准差，检测异常值
    const avgClicks = nonZeroData.length > 0 
      ? nonZeroData.reduce((sum, d) => sum + d.clicks, 0) / nonZeroData.length 
      : 0;
    
    // 找到连续有数据的最后一天（排除异常高的最后一天）
    let actualEndDate = endDateStr;
    if (nonZeroData.length > 1) {
      // 按日期排序
      const sortedByDate = [...nonZeroData].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // 如果最后一天的点击量超过平均值的5倍，可能是上传日期的累计数据，排除它
      const lastDay = sortedByDate[sortedByDate.length - 1];
      const prevDay = sortedByDate[sortedByDate.length - 2];
      
      // 如果最后一天点击量是前一天的5倍以上，或超过平均值的3倍，认为是上传日期的累计数据
      if (lastDay.clicks > prevDay.clicks * 5 || lastDay.clicks > avgClicks * 3) {
        // 使用前一天作为结束日期
        actualEndDate = prevDay.date;
        console.log(`[GSC Trends] 检测到异常最后一天 ${lastDay.date}(${lastDay.clicks}点击，前一天${prevDay.clicks}点击，平均值${Math.round(avgClicks)})，使用 ${actualEndDate} 作为结束日期`);
      } else {
        actualEndDate = lastDay.date;
      }
    } else if (nonZeroData.length === 1) {
      actualEndDate = nonZeroData[0].date;
    }
    
    const actualDates = chartData.map(d => d.date).sort();
    // 使用查询范围的起始日期，而不是数据中的第一个日期
    // 这样可以确保包含所有日期，即使某些日期没有数据
    const actualStartDate = startDateStr;
    
    console.log(`[GSC Trends] 实际数据范围: ${actualStartDate} 到 ${actualEndDate}`);

    // 过滤数据，只保留到实际结束日期的数据
    const filteredChartData = chartData.filter(d => d.date <= actualEndDate);

    // 填充缺失日期（使用实际的数据日期范围）
    const filledData = fillMissingDates(filteredChartData, actualStartDate, actualEndDate);

    // 计算总计 - 使用所有 Query 数据的总和（GSC Query 报告包含所有查询的总和）
    const correctTotals = summaryData && summaryData.length > 0
      ? {
          totalClicks: summaryData.reduce((sum, r) => sum + (r.clicks || 0), 0),
          totalImpressions: summaryData.reduce((sum, r) => sum + (r.impressions || 0), 0),
          totalPositionWeighted: summaryData.reduce((sum, r) => sum + ((r.position || 0) * (r.impressions || 0)), 0),
        }
      : filledData.reduce(
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
        totalClicks: correctTotals.totalClicks,
        totalImpressions: correctTotals.totalImpressions,
        avgCtr: correctTotals.totalImpressions > 0 ? (correctTotals.totalClicks / correctTotals.totalImpressions) * 100 : 0,
        avgPosition: correctTotals.totalImpressions > 0 ? correctTotals.totalPositionWeighted / correctTotals.totalImpressions : 0,
      },
      range,
      meta: {
        startDate: actualStartDate,
        endDate: actualEndDate,
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
