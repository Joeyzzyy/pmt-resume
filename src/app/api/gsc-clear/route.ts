// =====================================================
// GSC 数据清除 API
// POST /api/gsc-clear
// 清除所有 GSC 数据（current + history + upload_log）
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');

    // 安全确认：必须传入 confirm=true
    if (confirm !== 'true') {
      return NextResponse.json(
        { error: '请确认操作：需要在请求参数中添加 confirm=true' },
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

    console.log('[GSC Clear] 开始清除所有数据...');

    // 按顺序清除数据
    const results = {
      current: 0,
      history: 0,
      uploadLog: 0,
    };

    // 1. 先获取各表数量
    const [currentCount, historyCount, uploadLogCount] = await Promise.all([
      supabase.from('maidinhk_gsc_current').select('*', { count: 'exact', head: true }),
      supabase.from('maidinhk_gsc_history').select('*', { count: 'exact', head: true }),
      supabase.from('maidinhk_gsc_upload_log').select('*', { count: 'exact', head: true }),
    ]);

    results.current = currentCount.count || 0;
    results.history = historyCount.count || 0;
    results.uploadLog = uploadLogCount.count || 0;

    // 2. 使用原始 SQL 清除数据（使用 * 匹配所有行）
    const { error: error1 } = await supabase
      .from('maidinhk_gsc_current')
      .delete()
      .neq('id', -999999); // 删除所有 id != -999999 的行（即所有行）
    
    if (error1) {
      console.error('[GSC Clear] 清除 current 表失败:', error1);
    }

    const { error: error2 } = await supabase
      .from('maidinhk_gsc_history')
      .delete()
      .neq('id', -999999);
    
    if (error2) {
      console.error('[GSC Clear] 清除 history 表失败:', error2);
    }

    const { error: error3 } = await supabase
      .from('maidinhk_gsc_upload_log')
      .delete()
      .neq('id', -999999);
    
    if (error3) {
      console.error('[GSC Clear] 清除 upload_log 表失败:', error3);
    }

    console.log('[GSC Clear] 清除完成:', results);

    return NextResponse.json({
      success: true,
      message: '所有数据已清除',
      cleared: results,
    });

  } catch (error) {
    console.error('[GSC Clear] 错误:', error);
    return NextResponse.json(
      { error: '清除失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// 也支持 GET 请求获取数据概览（不清除）
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        current: 0,
        history: 0,
        uploadLog: 0,
        isMock: true,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 并行获取各表数量
    const [
      currentResult,
      historyResult,
      uploadLogResult,
    ] = await Promise.all([
      supabase.from('maidinhk_gsc_current').select('*', { count: 'exact', head: true }),
      supabase.from('maidinhk_gsc_history').select('*', { count: 'exact', head: true }),
      supabase.from('maidinhk_gsc_upload_log').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      current: currentResult.count || 0,
      history: historyResult.count || 0,
      uploadLog: uploadLogResult.count || 0,
      isMock: false,
    });

  } catch (error) {
    console.error('[GSC Clear] 获取统计错误:', error);
    return NextResponse.json({
      current: 0,
      history: 0,
      uploadLog: 0,
      isMock: true,
      error: '获取统计失败',
    });
  }
}
