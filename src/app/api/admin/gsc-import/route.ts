import { NextResponse } from 'next/server';
import { verifyAdmin, supabaseAdmin } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const { admin, error: authError } = await verifyAdmin(req);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin is not initialized' }, { status: 500 });
    }

    const { file, fileName } = await req.json();
    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 });
    }

    let base64Data = file;
    if (file.startsWith('data:')) {
      base64Data = file.split(',')[1];
    }
    const buffer = Buffer.from(base64Data, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const chartData = XLSX.utils.sheet_to_json(workbook.Sheets['Chart'], { header: 1 });
    const dailyRows = [];
    for (let i = 1; i < chartData.length; i++) {
      const row: any = chartData[i];
      if (!row[0]) continue;
      dailyRows.push({
        date: row[0],
        clicks: parseInt(row[1]) || 0,
        impressions: parseInt(row[2]) || 0,
        ctr: parseFloat(row[3]) || 0,
        position: parseFloat(row[4]) || 0,
      });
    }

    const dateFrom = dailyRows.length > 0 ? dailyRows[0].date : null;
    const dateTo = dailyRows.length > 0 ? dailyRows[dailyRows.length - 1].date : null;

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: '无法从 Chart 中提取日期范围' }, { status: 400 });
    }

    const queriesData = XLSX.utils.sheet_to_json(workbook.Sheets['Queries'], { header: 1 });
    const queryRows = [];
    for (let i = 1; i < queriesData.length; i++) {
      const row: any = queriesData[i];
      if (!row[0]) continue;
      queryRows.push({
        query: row[0],
        clicks: parseInt(row[1]) || 0,
        impressions: parseInt(row[2]) || 0,
        ctr: parseFloat(row[3]) || 0,
        position: parseFloat(row[4]) || 0,
      });
    }

    const pagesData = XLSX.utils.sheet_to_json(workbook.Sheets['Pages'], { header: 1 });
    const pageRows = [];
    for (let i = 1; i < pagesData.length; i++) {
      const row: any = pagesData[i];
      if (!row[0]) continue;
      pageRows.push({
        page: row[0],
        clicks: parseInt(row[1]) || 0,
        impressions: parseInt(row[2]) || 0,
        ctr: parseFloat(row[3]) || 0,
        position: parseFloat(row[4]) || 0,
      });
    }

    const countriesData = XLSX.utils.sheet_to_json(workbook.Sheets['Countries'], { header: 1 });
    const countryRows = [];
    for (let i = 1; i < countriesData.length; i++) {
      const row: any = countriesData[i];
      if (!row[0]) continue;
      countryRows.push({
        country: row[0],
        clicks: parseInt(row[1]) || 0,
        impressions: parseInt(row[2]) || 0,
        ctr: parseFloat(row[3]) || 0,
        position: parseFloat(row[4]) || 0,
      });
    }

    const devicesData = XLSX.utils.sheet_to_json(workbook.Sheets['Devices'], { header: 1 });
    const deviceRows = [];
    for (let i = 1; i < devicesData.length; i++) {
      const row: any = devicesData[i];
      if (!row[0]) continue;
      deviceRows.push({
        device: row[0],
        clicks: parseInt(row[1]) || 0,
        impressions: parseInt(row[2]) || 0,
        ctr: parseFloat(row[3]) || 0,
        position: parseFloat(row[4]) || 0,
      });
    }

    const { data: importLog, error: logError } = await supabaseAdmin
      .from('gsc_import_logs')
      .insert({
        file_name: fileName || 'unknown.xlsx',
        date_from: dateFrom,
        date_to: dateTo,
        daily_rows: dailyRows.length,
        query_rows: queryRows.length,
        page_rows: pageRows.length,
        country_rows: countryRows.length,
        device_rows: deviceRows.length,
      })
      .select()
      .single();

    if (logError) {
      console.error('创建导入日志失败:', logError);
      return NextResponse.json({ error: '创建导入日志失败: ' + logError.message }, { status: 500 });
    }

    const importId = importLog.id;

    if (dailyRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('gsc_daily_metrics')
        .upsert(
          dailyRows.map(r => ({ ...r, import_id: importId })),
          { onConflict: 'date' }
        );
      if (error) console.error('daily upsert error:', error);
    }

    if (queryRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('gsc_queries')
        .upsert(
          queryRows.map(r => ({
            date_from: dateFrom,
            date_to: dateTo,
            ...r,
            import_id: importId,
          })),
          { onConflict: 'date_from,date_to,query' }
        );
      if (error) console.error('queries upsert error:', error);
    }

    if (pageRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('gsc_pages')
        .upsert(
          pageRows.map(r => ({
            date_from: dateFrom,
            date_to: dateTo,
            ...r,
            import_id: importId,
          })),
          { onConflict: 'date_from,date_to,page' }
        );
      if (error) console.error('pages upsert error:', error);
    }

    if (countryRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('gsc_countries')
        .upsert(
          countryRows.map(r => ({
            date_from: dateFrom,
            date_to: dateTo,
            ...r,
            import_id: importId,
          })),
          { onConflict: 'date_from,date_to,country' }
        );
      if (error) console.error('countries upsert error:', error);
    }

    if (deviceRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('gsc_devices')
        .upsert(
          deviceRows.map(r => ({
            date_from: dateFrom,
            date_to: dateTo,
            ...r,
            import_id: importId,
          })),
          { onConflict: 'date_from,date_to,device' }
        );
      if (error) console.error('devices upsert error:', error);
    }

    return NextResponse.json({
      success: true,
      importId,
      dateRange: { from: dateFrom, to: dateTo },
      counts: {
        daily: dailyRows.length,
        queries: queryRows.length,
        pages: pageRows.length,
        countries: countryRows.length,
        devices: deviceRows.length,
      },
    });
  } catch (err: any) {
    console.error('GSC 导入错误:', err);
    return NextResponse.json({ error: '导入失败: ' + err.message }, { status: 500 });
  }
}
