// =====================================================
// 单页面历史数据 API
// GET /api/page-history?page=xxx
// 获取指定页面在不同批次的历史数据
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json(
        { error: '请提供页面 URL' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: '数据库配置错误' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 首先尝试从 history 表获取数据（只获取 page 类型）
    const { data: historyData, error: historyError } = await supabase
      .from('maidinhk_gsc_history')
      .select('*')
      .eq('page', page)
      .eq('data_type', 'page')
      .order('upload_date', { ascending: true });

    let history: any[] = [];

    // 如果 history 表有数据，使用它
    if (!historyError && historyData && historyData.length > 0) {
      // 按上传批次分组
      const historyByBatch: Record<string, {
        upload_date: string;
        data: any[];
      }> = {};

      historyData.forEach((row: any) => {
        if (!historyByBatch[row.upload_batch]) {
          historyByBatch[row.upload_batch] = {
            upload_date: row.upload_date,
            data: [],
          };
        }
        historyByBatch[row.upload_batch].data.push({
          date: row.date,
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0,
        });
      });

      // 转换为数组并计算汇总
      history = Object.entries(historyByBatch).map(([batch, info]) => {
        const totalClicks = info.data.reduce((sum, d) => sum + d.clicks, 0);
        const totalImpressions = info.data.reduce((sum, d) => sum + d.impressions, 0);
        const avgPosition = info.data.length > 0
          ? info.data.reduce((sum, d) => sum + d.position * d.impressions, 0) / totalImpressions
          : 0;

        return {
          batch,
          upload_date: info.upload_date,
          summary: {
            clicks: totalClicks,
            impressions: totalImpressions,
            ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            position: avgPosition,
          },
          daily: info.data,
        };
      });
    }

    // 2. 如果 history 表没有数据，从 current 表获取（只获取 page 类型）
    if (history.length === 0) {
      const { data: currentData, error: currentError } = await supabase
        .from('maidinhk_gsc_current')
        .select('*')
        .eq('page', page)
        .eq('data_type', 'page')
        .order('date', { ascending: true });

      if (!currentError && currentData && currentData.length > 0) {
        // 按日期分组，模拟批次
        const groupedByDate: Record<string, any[]> = {};
        
        currentData.forEach((row: any) => {
          const dateKey = row.date || 'unknown';
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
          }
          groupedByDate[dateKey].push(row);
        });

        history = Object.entries(groupedByDate).map(([date, rows]) => {
          const totalClicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0);
          const totalImpressions = rows.reduce((sum, r) => sum + (r.impressions || 0), 0);
          const avgPosition = rows.length > 0
            ? rows.reduce((sum, r) => sum + (r.position || 0) * (r.impressions || 0), 0) / totalImpressions
            : 0;

          return {
            batch: `current-${date}`,
            upload_date: date,
            summary: {
              clicks: totalClicks,
              impressions: totalImpressions,
              ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
              position: avgPosition,
            },
            daily: rows.map((r: any) => ({
              date: r.date,
              clicks: r.clicks || 0,
              impressions: r.impressions || 0,
              ctr: r.ctr || 0,
              position: r.position || 0,
            })),
          };
        });
      }
    }

    return NextResponse.json({
      page,
      history,
      totalBatches: history.length,
      source: history.length > 0 ? (historyData?.length ? 'history' : 'current') : 'none',
    });

  } catch (error) {
    console.error('[Page History] Error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
