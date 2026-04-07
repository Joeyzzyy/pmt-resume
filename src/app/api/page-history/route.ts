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

    // 调试：检查 history 表中的所有不同页面
    const { data: allDistinctPages } = await supabase
      .from('maidinhk_gsc_history')
      .select('page, data_type', { count: 'exact' });
    
    console.log('[Page History] Debug - Total rows:', allDistinctPages?.length);
    console.log('[Page History] Debug - Sample pages:', allDistinctPages?.slice(0, 5));
    
    // 查找匹配的页面（模糊匹配，因为 URL 可能有微小差异）
    const { data: matchedPages } = await supabase
      .from('maidinhk_gsc_history')
      .select('page')
      .ilike('page', `%${page.replace(/https?:\/\//, '').split('/').pop() || ''}%`)
      .limit(5);
    
    console.log('[Page History] Debug - Matched pages:', matchedPages);

    // 获取该页面的所有历史数据（不过滤 data_type）
    const { data, error } = await supabase
      .from('maidinhk_gsc_history')
      .select('*')
      .eq('page', page)
      .order('upload_date', { ascending: true });

    if (error) {
      console.error('[Page History] Error:', error);
      return NextResponse.json(
        { error: '获取历史数据失败' },
        { status: 500 }
      );
    }

    console.log('[Page History] Query result:', { 
      page, 
      dataCount: data?.length || 0,
      firstRow: data?.[0]
    });

    // 按上传批次分组
    const historyByBatch: Record<string, {
      upload_date: string;
      data: {
        date: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }[];
    }> = {};

    data?.forEach((row: any) => {
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
    const history = Object.entries(historyByBatch).map(([batch, info]) => {
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

    return NextResponse.json({
      page,
      history,
      totalBatches: history.length,
      debug: {
        totalRowsInDb: allDistinctPages?.length || 0,
        matchedPages: matchedPages?.map((p: any) => p.page) || [],
      }
    });

  } catch (error) {
    console.error('[Page History] Error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
