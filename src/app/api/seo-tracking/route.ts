// =====================================================
// SEO 动作影响追踪 API
// GET /api/seo-tracking
// 获取上传批次列表和页面列表
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 模拟数据
const mockBatches = [
  { upload_batch: '2026-03-22-001', upload_date: '2026-03-22', record_count: 1234, notes: '优化了首页TDK' },
  { upload_batch: '2026-03-15-001', upload_date: '2026-03-15', record_count: 1200, notes: '初始数据导入' },
];

const mockPages = [
  'https://maidinhk.com/blog/minimum-wage-and-budget',
  'https://maidinhk.com/blog/visa-application-process',
  'https://maidinhk.com/blog/helper-blacklist',
  'https://maidinhk.com/blog/work-schedule',
];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 如果没有环境变量，返回模拟数据
    if (!supabaseUrl || !supabaseKey) {
      console.log("[SEO Tracking] Using mock data (no env vars)");
      return NextResponse.json({
        batches: mockBatches,
        pages: mockPages,
        isMock: true,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取上传批次列表
    const { data: batches, error: batchesError } = await supabase
      .from('maidinhk_gsc_upload_log')
      .select('upload_batch, upload_date, record_count, notes')
      .order('upload_date', { ascending: false })
      .limit(20);

    if (batchesError) {
      console.error('[SEO Tracking] Error fetching batches:', batchesError);
      return NextResponse.json({
        batches: mockBatches,
        pages: mockPages,
        isMock: true,
        error: '获取批次失败',
      });
    }

    // 获取最新批次中的页面列表
    const latestBatch = batches?.[0]?.upload_batch;
    let pages: string[] = [];

    if (latestBatch) {
      const { data: pagesData, error: pagesError } = await supabase
        .from('maidinhk_gsc_history')
        .select('page')
        .eq('upload_batch', latestBatch)
        .eq('data_type', 'page')
        .neq('page', '_SUMMARY_')
        .order('clicks', { ascending: false })
        .limit(50);

      if (!pagesError && pagesData) {
        pages = [...new Set(pagesData.map((p: { page: string }) => p.page))];
      }
    }

    return NextResponse.json({
      batches: batches || mockBatches,
      pages: pages.length > 0 ? pages : mockPages,
      isMock: !batches || batches.length === 0,
    });

  } catch (error) {
    console.error('[SEO Tracking] Error:', error);
    return NextResponse.json({
      batches: mockBatches,
      pages: mockPages,
      isMock: true,
      error: '服务器错误',
    });
  }
}
