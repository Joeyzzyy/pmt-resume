// =====================================================
// GSC 数据同步 API
// GET /api/cron/sync-gsc?startDate=2025-03-14&endDate=2025-03-20
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchPageMetrics, fetchQueryMetrics } from '@/lib/gsc';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 如果没有指定日期，默认同步最近7天
    const days = parseInt(searchParams.get('days') || '7');
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    
    const startDate = start.toISOString().split('T')[0];

    console.log(`[GSC Sync] Starting sync: ${startDate} to ${endDate} (${days} days)`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 从 GSC API 获取数据
    const [pageMetrics, queryMetrics] = await Promise.all([
      fetchPageMetrics(startDate, endDate),
      fetchQueryMetrics(startDate, endDate),
    ]);

    console.log(`[GSC Sync] Fetched: ${pageMetrics.length} pages, ${queryMetrics.length} queries`);

    // 保存页面数据
    if (pageMetrics.length > 0) {
      // 删除该日期范围的旧数据
      await supabase
        .from('maidinhk_gsc_pages')
        .delete()
        .gte('date', startDate)
        .lte('date', endDate);

      const pageRecords = pageMetrics.map((row) => ({
        date: row.date,
        page: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        created_at: new Date().toISOString(),
      }));

      const { error: pageError } = await supabase
        .from('maidinhk_gsc_pages')
        .insert(pageRecords);

      if (pageError) throw pageError;
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      startDate,
      endDate,
      pageCount: pageMetrics.length,
      queryCount: queryMetrics.length,
    });

  } catch (error) {
    console.error('[GSC Sync] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
