// =====================================================
// 获取 current 表中的所有页面数据
// GET /api/gsc-current-pages
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: '数据库配置错误' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取所有不同的页面
    const { data: pagesData, error } = await supabase
      .from('maidinhk_gsc_current')
      .select('page, clicks, impressions, ctr, position')
      .neq('page', '_SUMMARY_')
      .order('clicks', { ascending: false });

    if (error) {
      console.error('[GSC Current Pages] Error:', error);
      return NextResponse.json(
        { error: '获取数据失败' },
        { status: 500 }
      );
    }

    // 按页面去重（取每个页面的最新数据）
    const pagesMap = new Map();
    pagesData?.forEach((row: any) => {
      if (!pagesMap.has(row.page)) {
        pagesMap.set(row.page, {
          page: row.page,
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: row.ctr || 0,
          position: row.position || 0,
        });
      }
    });

    const pages = Array.from(pagesMap.values());

    return NextResponse.json({
      pages,
      total: pages.length,
    });

  } catch (error) {
    console.error('[GSC Current Pages] Error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
