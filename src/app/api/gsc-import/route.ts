// =====================================================
// GSC Excel 数据导入 API (双表架构版本)
// POST /api/gsc-import
// 支持重复检测和自动覆盖（current 表）+ 历史保留（history 表）
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
  dataType: 'page' | 'query' | 'summary';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clearExisting = formData.get('clearExisting') === 'true';
    const notes = formData.get('notes') as string || ''; // SEO 追踪备注

    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 });
    }

    // 检查文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: '请上传 Excel 文件 (.xlsx 或 .xls)' }, { status: 400 });
    }

    console.log(`[GSC Import] 开始导入: ${file.name}, 清空现有数据: ${clearExisting}`);

    // 从文件名提取日期
    const extractedDate = extractDateFromFilename(file.name);
    console.log(`[GSC Import] 从文件名提取日期: ${extractedDate || '未识别'}`);

    // 读取 Excel 文件
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    
    // 处理所有工作表
    const allRecords: GSCRow[] = [];
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      console.log(`[GSC Import] 处理工作表: ${sheetName}, ${jsonData.length} 行`);
      
      const sheetRecords = parseSheetData(jsonData, sheetName, extractedDate);
      console.log(`[GSC Import] 工作表 ${sheetName}: 解析到 ${sheetRecords.length} 条记录`);
      console.log(`[GSC Import] 工作表 ${sheetName} 样本:`, sheetRecords.slice(0, 2));
      
      allRecords.push(...sheetRecords);
    }

    console.log(`[GSC Import] 解析完成: ${allRecords.length} 条有效记录`);
    console.log(`[GSC Import] 数据类型分布:`, {
      page: allRecords.filter(r => r.dataType === 'page').length,
      query: allRecords.filter(r => r.dataType === 'query').length,
      summary: allRecords.filter(r => r.dataType === 'summary').length,
    });

    if (allRecords.length === 0) {
      return NextResponse.json({ 
        error: '未找到有效数据，请确保是 GSC 导出的数据'
      }, { status: 400 });
    }

    // 初始化 Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // =====================================================
    // 步骤 1: 生成上传批次号
    // =====================================================
    // 优先使用文件名提取的日期，否则使用当天日期
    const uploadDate = extractedDate || new Date().toISOString().split('T')[0];
    const uploadBatch = await generateUploadBatch(supabase, uploadDate);
    
    console.log(`[GSC Import] 上传批次: ${uploadBatch}`);

    // =====================================================
    // 步骤 2: 写入 History 表（累积保存，用于 SEO 追踪）
    // =====================================================
    console.log('[GSC Import] 写入 History 表...');
    const historyRecords = allRecords.map(r => ({
      upload_batch: uploadBatch,
      upload_date: uploadDate,
      date: r.date,
      page: r.page,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
      data_type: r.dataType,
    }));

    const historyInserted = await batchInsert(supabase, 'maidinhk_gsc_history', historyRecords);
    console.log(`[GSC Import] History 表写入完成: ${historyInserted} 条`);

    // =====================================================
    // 步骤 3: 写入 Current 表（自动覆盖，用于 Performance）
    // =====================================================
    console.log('[GSC Import] 写入 Current 表...');

    // 如果需要清空现有数据
    if (clearExisting) {
      console.log('[GSC Import] 清空 Current 表...');
      await supabase.from('maidinhk_gsc_current').delete().gte('date', '2000-01-01');
    }

    // 获取导入日期范围
    const dates = [...new Set(allRecords.map(r => r.date))].sort();
    
    // 删除这些日期的旧数据（避免重复）
    for (const date of dates) {
      await supabase.from('maidinhk_gsc_current').delete().eq('date', date);
    }

    // 插入新数据到 current 表
    const currentRecords = allRecords.map(r => ({
      date: r.date,
      page: r.page,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
      data_type: r.dataType,
      updated_at: new Date().toISOString(),
    }));

    const currentInserted = await batchInsert(supabase, 'maidinhk_gsc_current', currentRecords);
    console.log(`[GSC Import] Current 表写入完成: ${currentInserted} 条`);

    // =====================================================
    // 步骤 4: 记录上传日志
    // =====================================================
    await supabase.from('maidinhk_gsc_upload_log').insert({
      upload_batch: uploadBatch,
      upload_date: uploadDate,
      record_count: allRecords.length,
      date_range_from: dates[0],
      date_range_to: dates[dates.length - 1],
      notes: notes,
    });

    // 获取页面和查询数据的统计
    const pageRecords = allRecords.filter(r => r.dataType === 'page');
    const queryRecords = allRecords.filter(r => r.dataType === 'query');

    console.log(`[GSC Import] 导入完成: 批次 ${uploadBatch}, ${allRecords.length} 条记录`);

    return NextResponse.json({
      success: true,
      message: '导入成功',
      uploadBatch,
      stats: {
        totalRecords: allRecords.length,
        pageRecords: pageRecords.length,
        queryRecords: queryRecords.length,
        historyInserted,
        currentInserted,
      },
      dateRange: {
        from: dates[0],
        to: dates[dates.length - 1],
      },
      uniqueDates: dates.length,
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

// =====================================================
// 解析单个工作表的数据
// extractedDate: 从文件名提取的日期，用于 Pages/Queries 工作表
// =====================================================
function parseSheetData(jsonData: any[][], sheetName: string, extractedDate?: string | null): GSCRow[] {
  const records: GSCRow[] = [];
  
  if (jsonData.length === 0) return records;

  // 查找表头行
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, jsonData.length); i++) {
    const row = jsonData[i];
    if (row && row.some((cell: any) => {
      if (cell === null || cell === undefined) return false;
      const cellStr = String(cell).toLowerCase().trim();
      return (
        cellStr.includes('date') ||
        cellStr.includes('日期') ||
        cellStr.includes('page') ||
        cellStr.includes('top pages') ||
        cellStr.includes('url') ||
        cellStr.includes('网址') ||
        cellStr.includes('query') ||
        cellStr.includes('top queries') ||
        cellStr.includes('查询') ||
        cellStr.includes('clicks') ||
        cellStr.includes('点击') ||
        cellStr.includes('impressions') ||
        cellStr.includes('展示')
      );
    })) {
      headerRowIndex = i;
      console.log(`[GSC Import] 工作表 ${sheetName} 找到表头在第 ${i} 行`);
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.log(`[GSC Import] 工作表 ${sheetName} 未找到表头，跳过`);
    return records;
  }

  const headers = jsonData[headerRowIndex].map((h: any) => String(h).toLowerCase().trim());
  
  // 查找列索引（不区分大小写）
  const dateIndex = headers.findIndex((h: string) => h.includes('date') || h.includes('日期'));
  const pageIndex = headers.findIndex((h: string) => 
    h.toLowerCase().includes('page') || 
    h.toLowerCase().includes('url') || 
    h.includes('网址') || 
    h.toLowerCase().includes('top pages')
  );
  const queryIndex = headers.findIndex((h: string) => 
    h.toLowerCase().includes('query') || 
    h.includes('查询') || 
    h.toLowerCase().includes('top queries')
  );
  const clicksIndex = headers.findIndex((h: string) => h.toLowerCase().includes('clicks') || h.includes('点击'));
  const impressionsIndex = headers.findIndex((h: string) => h.toLowerCase().includes('impressions') || h.includes('展示'));
  const ctrIndex = headers.findIndex((h: string) => h.toLowerCase().includes('ctr') || h.includes('点击率'));
  const positionIndex = headers.findIndex((h: string) => h.toLowerCase().includes('position') || h.includes('排名'));

  // 判断数据类型
  let dataType: 'page' | 'query' | 'summary' = 'page';
  if (sheetName.toLowerCase().includes('query') || queryIndex >= 0) {
    dataType = 'query';
  } else if (sheetName.toLowerCase().includes('chart') || dateIndex >= 0 && pageIndex === -1 && queryIndex === -1) {
    dataType = 'summary';
  }

  console.log(`[GSC Import] 工作表 ${sheetName}: date=${dateIndex}, page=${pageIndex}, query=${queryIndex}, dataType=${dataType}`);
  console.log(`[GSC Import] 工作表 ${sheetName} 表头:`, headers);

  // 解析数据行
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    try {
      // 获取日期：优先使用表格中的日期列，否则使用文件名提取的日期
      let date: string | null = null;
      if (dateIndex >= 0 && row[dateIndex]) {
        date = parseDate(row[dateIndex]);
      }
      // 对于 Pages/Queries 工作表，如果没有日期列，使用文件名日期
      if (!date && extractedDate && (dataType === 'page' || dataType === 'query')) {
        date = extractedDate;
      }
      if (!date) continue;

      // 处理不同类型的数据
      let page = '';
      if (dataType === 'summary') {
        page = '_SUMMARY_';
      } else if (pageIndex >= 0 && row[pageIndex]) {
        page = String(row[pageIndex]).trim();
        dataType = 'page';
      } else if (queryIndex >= 0 && row[queryIndex]) {
        page = String(row[queryIndex]).trim();
        dataType = 'query';
      } else {
        continue;
      }

      if (!page) continue;

      const record: GSCRow = {
        date,
        page,
        clicks: clicksIndex >= 0 ? parseNumber(row[clicksIndex]) : 0,
        impressions: impressionsIndex >= 0 ? parseNumber(row[impressionsIndex]) : 0,
        ctr: ctrIndex >= 0 ? parseFloat(row[ctrIndex]) || 0 : 0,
        position: positionIndex >= 0 ? parseFloat(row[positionIndex]) || 0 : 0,
        dataType,
      };

      records.push(record);
    } catch (err) {
      console.warn(`[GSC Import] 第 ${i + 1} 行解析失败:`, err);
    }
  }

  return records;
}

// =====================================================
// 从文件名提取日期
// 支持的格式：
// - maidinhk.com-Performance-on-Search-2026-03-22.xlsx
// - data-2026-03-22.xlsx
// - 2026-03-22-anything.xlsx
// =====================================================
function extractDateFromFilename(filename: string): string | null {
  // 匹配 YYYY-MM-DD 格式
  const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
  const match = filename.match(dateRegex);
  
  if (match) {
    const year = match[1];
    const month = match[2];
    const day = match[3];
    
    // 验证日期有效性
    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}

// =====================================================
// 生成上传批次号
// =====================================================
async function generateUploadBatch(supabase: any, dateStr: string): Promise<string> {
  const { data: existingBatches } = await supabase
    .from('maidinhk_gsc_upload_log')
    .select('upload_batch')
    .like('upload_batch', `${dateStr}-%`)
    .order('upload_batch', { ascending: false })
    .limit(1);

  let batchNum = 1;
  if (existingBatches && existingBatches.length > 0) {
    const lastBatch = existingBatches[0].upload_batch;
    const parts = lastBatch.split('-');
    if (parts.length >= 4) {
      const lastNum = parseInt(parts[3], 10);
      if (!isNaN(lastNum)) {
        batchNum = lastNum + 1;
      }
    }
  }

  return `${dateStr}-${String(batchNum).padStart(3, '0')}`;
}

// =====================================================
// 批量插入数据
// =====================================================
async function batchInsert(supabase: any, table: string, records: any[]): Promise<number> {
  const batchSize = 1000;
  let insertedCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);
    
    if (error) {
      console.error(`[GSC Import] 插入 ${table} 失败:`, error);
      throw new Error(`插入 ${table} 失败: ${error.message}`);
    }
    
    insertedCount += batch.length;
  }

  return insertedCount;
}

// =====================================================
// 解析日期
// =====================================================
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

// =====================================================
// 解析数字
// =====================================================
function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = String(value).replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}
