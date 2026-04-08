// =====================================================
// 从 current 表获取页面历史数据（备用方案）
// GET /api/page-history-from-current?page=xxx
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

    // 直接从 current 表查询
    const { data, error } = await supabase
      .from('maidinhk_gsc_current')
      .select('*')
      .eq('page', page)
      .order('date', { ascending: true });

    if (error) {
      console.error('[Page History Current] Error:', error);
      return NextResponse.json(
        { error: '获取数据失败' },
        { status: 500 }
      );
    }

    // 转换为历史数据格式
    const history = data?.map((row: any) => ({
      batch: 'current-' + row.date,
      upload_date: row.date,
      summary: {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      },
      daily: [{
        date: row.date,
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      }],
    })) || [];

    return NextResponse.json({
      page,
      history,
      totalBatches: history.length,
      source: 'current',
    });

  } catch (error) {
    console.error('[Page History Current] Error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
