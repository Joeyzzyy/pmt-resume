// =====================================================
// GSC 数据同步状态查询
// GET /api/gsc-status
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 获取最新数据日期
    const { data: latestData } = await supabase
      .from('maidinhk_gsc_pages')
      .select('date, created_at')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // 获取数据条数统计
    const { count: totalCount } = await supabase
      .from('maidinhk_gsc_pages')
      .select('*', { count: 'exact', head: true });

    // 获取最近 7 天的数据覆盖情况
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentData } = await supabase
      .from('maidinhk_gsc_pages')
      .select('date')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    const uniqueDates = [...new Set(recentData?.map(d => d.date) || [])];

    return NextResponse.json({
      latestDate: latestData?.date || null,
      lastSync: latestData?.created_at || null,
      totalRecords: totalCount || 0,
      recentDates: uniqueDates,
      daysCovered: uniqueDates.length,
      status: uniqueDates.length >= 6 ? 'healthy' : uniqueDates.length >= 3 ? 'warning' : 'stale',
    });

  } catch (error) {
    console.error('[GSC Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
