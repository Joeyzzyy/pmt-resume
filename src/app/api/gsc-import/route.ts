// =====================================================
// GSC Excel 数据导入 API
// POST /api/gsc-import
// 支持重复检测和自动覆盖
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

interface GSCRow {
  date: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clearExisting = formData.get('clearExisting') === 'true';

    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 });
    }

    // 检查文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: '请上传 Excel 文件 (.xlsx 或 .xls)' }, { status: 400 });
    }

    console.log(`[GSC Import] 开始导入: ${file.name}, 清空现有数据: ${clearExisting}`);

    // 读取 Excel 文件
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log(`[GSC Import] Excel 解析完成, 共 ${jsonData.length} 行`);

    // 解析数据
    const records: GSCRow[] = [];
    const errors: string[] = [];

    // 查找表头行
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.some((cell: any) => 
        String(cell).toLowerCase().includes('date') || 
        String(cell).toLowerCase().includes('日期') ||
        String(cell).toLowerCase().includes('page') ||
        String(cell).toLowerCase().includes('url')
      )) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return NextResponse.json({ error: '无法识别表头，请确保是 GSC 导出的数据' }, { status: 400 });
    }

    const headers = jsonData[headerRowIndex].map((h: any) => String(h).toLowerCase().trim());
    
    // 查找列索引
    const dateIndex = headers.findIndex((h: string) => h.includes('date') || h.includes('日期'));
    const pageIndex = headers.findIndex((h: string) => h.includes('page') || h.includes('url') || h.includes('网址'));
    const queryIndex = headers.findIndex((h: string) => h.includes('query') || h.includes('查询'));
    const clicksIndex = headers.findIndex((h: string) => h.includes('clicks') || h.includes('点击'));
    const impressionsIndex = headers.findIndex((h: string) => h.includes('impressions') || h.includes('展示'));
    const ctrIndex = headers.findIndex((h: string) => h.includes('ctr') || h.includes('点击率'));
    const positionIndex = headers.findIndex((h: string) => h.includes('position') || h.includes('排名'));

    console.log(`[GSC Import] 列索引: date=${dateIndex}, page=${pageIndex}, query=${queryIndex}, clicks=${clicksIndex}, impressions=${impressionsIndex}, ctr=${ctrIndex}, position=${positionIndex}`);
    
    // 判断数据类型
    const hasPage = pageIndex >= 0;
    const hasQuery = queryIndex >= 0;
    const dataType = hasPage ? 'page' : (hasQuery ? 'query' : 'summary');
    console.log(`[GSC Import] 数据类型: ${dataType}`);

    // 解析数据行
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;

      try {
        const date = dateIndex >= 0 ? parseDate(row[dateIndex]) : null;
        if (!date) {
          continue;
        }

        // 处理不同类型的数据
        let page = '';
        if (hasPage) {
          page = String(row[pageIndex] || '').trim();
        } else if (hasQuery) {
          page = `query:${String(row[queryIndex] || '').trim()}`;
        } else {
          // 每日汇总数据，使用特殊标记
          page = '_SUMMARY_';
        }
        
        if (!page) {
          continue;
        }

        const record: GSCRow = {
          date,
          page,
          clicks: clicksIndex >= 0 ? parseNumber(row[clicksIndex]) : 0,
          impressions: impressionsIndex >= 0 ? parseNumber(row[impressionsIndex]) : 0,
          ctr: ctrIndex >= 0 ? parseFloat(row[ctrIndex]) || 0 : 0,
          position: positionIndex >= 0 ? parseFloat(row[positionIndex]) || 0 : 0,
        };

        records.push(record);
      } catch (err) {
        errors.push(`第 ${i + 1} 行解析失败: ${(err as Error).message}`);
      }
    }

    if (records.length === 0) {
      return NextResponse.json({ 
        error: '未找到有效数据',
        details: errors.slice(0, 10)
      }, { status: 400 });
    }

    console.log(`[GSC Import] 解析完成: ${records.length} 条有效记录, ${errors.length} 条错误`);

    // 初始化 Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 如果需要清空现有数据
    if (clearExisting) {
      console.log('[GSC Import] 清空现有数据...');
      // 使用 RPC 或删除所有数据
      const { error: deleteError } = await supabase
        .from('maidinhk_gsc_pages')
        .delete()
        .gte('date', '2000-01-01'); // 删除所有日期 >= 2000年的数据
      
      if (deleteError) {
        console.error('[GSC Import] 清空数据失败:', deleteError);
        // 不返回错误，继续尝试导入
      } else {
        console.log('[GSC Import] 现有数据已清空');
      }
    }

    // 获取导入日期范围
    const dates = [...new Set(records.map(r => r.date))].sort();
    console.log(`[GSC Import] 数据日期范围: ${dates[0]} 到 ${dates[dates.length - 1]}`);

    // 删除这些日期的旧数据（避免重复）
    for (const date of dates) {
      const { error: deleteError } = await supabase
        .from('maidinhk_gsc_pages')
        .delete()
        .eq('date', date);
      
      if (deleteError) {
        console.error(`[GSC Import] 删除 ${date} 旧数据失败:`, deleteError);
      }
    }

    // 批量插入新数据
    const recordsToInsert = records.map(r => ({
      date: r.date,
      page: r.page,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

    const batchSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('maidinhk_gsc_pages')
        .insert(batch);
      
      if (insertError) {
        console.error(`[GSC Import] 插入批次失败:`, insertError);
        return NextResponse.json({ 
          error: '插入数据失败',
          details: insertError.message
        }, { status: 500 });
      }
      
      insertedCount += batch.length;
      console.log(`[GSC Import] 已插入 ${insertedCount}/${recordsToInsert.length} 条`);
    }

    console.log(`[GSC Import] 导入完成: ${insertedCount} 条记录`);

    return NextResponse.json({
      success: true,
      message: '导入成功',
      totalRecords: records.length,
      insertedRecords: insertedCount,
      dateRange: {
        from: dates[0],
        to: dates[dates.length - 1],
      },
      uniqueDates: dates.length,
      errors: errors.slice(0, 10),
      clearExisting,
    });

  } catch (error) {
    console.error('[GSC Import] 导入失败:', error);
    return NextResponse.json(
      { error: '导入失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// 解析日期
function parseDate(value: any): string | null {
  if (!value) return null;
  
  const str = String(value).trim();
  
  // YYYY-MM-DD 格式
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // YYYY/MM/DD 格式
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
    return str.replace(/\//g, '-');
  }
  
  // DD/MM/YYYY 格式
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  // Excel 日期序列号
  if (typeof value === 'number' && value > 40000 && value < 50000) {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }
  
  // 尝试 JavaScript Date 解析
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

// 解析数字
function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = String(value).replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}
