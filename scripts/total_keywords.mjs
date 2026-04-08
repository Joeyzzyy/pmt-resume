import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function getTotalKeywords() {
  console.log('=== 数据库关键词总数统计 ===\n');
  
  // 1. Query 类型（搜索词）
  const { data: queryData, count: queryCount } = await supabase
    .from('maidinhk_gsc_current')
    .select('*', { count: 'exact' })
    .eq('data_type', 'query');
    
  console.log('【Query 搜索词】');
  console.log(`  总数: ${queryCount} 个`);
  
  if (queryData && queryData.length > 0) {
    const uniqueQueries = new Set(queryData.map(r => r.page)).size;
    console.log(`  去重后: ${uniqueQueries} 个`);
    
    // 有点击的词
    const withClicks = queryData.filter(r => r.clicks > 0).length;
    console.log(`  有点击的: ${withClicks} 个 (${(withClicks/queryCount*100).toFixed(1)}%)`);
    
    // 首页词
    const homepage = queryData.filter(r => r.position <= 10).length;
    console.log(`  首页排名: ${homepage} 个 (${(homepage/queryCount*100).toFixed(1)}%)`);
    
    // 前5名
    const top5 = queryData.filter(r => r.position <= 5).length;
    console.log(`  Top 5: ${top5} 个 (${(top5/queryCount*100).toFixed(1)}%)`);
    
    // Top 3
    const top3 = queryData.filter(r => r.position <= 3).length;
    console.log(`  Top 3: ${top3} 个 (${(top3/queryCount*100).toFixed(1)}%)`);
    
    // 第1名
    const top1 = queryData.filter(r => r.position <= 1).length;
    console.log(`  第1名: ${top1} 个 (${(top1/queryCount*100).toFixed(1)}%)`);
  }
  
  // 2. Page 类型（页面）
  const { data: pageData, count: pageCount } = await supabase
    .from('maidinhk_gsc_current')
    .select('*', { count: 'exact' })
    .eq('data_type', 'page')
    .neq('page', '_SUMMARY_');
    
  console.log('\n【Page 页面】');
  console.log(`  总数: ${pageCount} 个页面`);
  
  if (pageData && pageData.length > 0) {
    const uniquePages = new Set(pageData.map(r => r.page)).size;
    console.log(`  去重后: ${uniquePages} 个页面`);
    
    // 有点击的页面
    const withClicks = pageData.filter(r => r.clicks > 0).length;
    console.log(`  有点击的: ${withClicks} 个 (${(withClicks/pageCount*100).toFixed(1)}%)`);
    
    // 首页页面
    const homepage = pageData.filter(r => r.position <= 10).length;
    console.log(`  首页排名: ${homepage} 个 (${(homepage/pageCount*100).toFixed(1)}%)`);
  }
  
  // 3. 总体统计
  console.log('\n【总体统计】');
  console.log(`  Query + Page 总数: ${queryCount + pageCount} 条记录`);
  
  // 4. 按日期查看数据分布
  console.log('\n【数据日期分布】');
  const { data: dateDist } = await supabase
    .from('maidinhk_gsc_current')
    .select('date, data_type')
    .order('date', { ascending: false });
    
  if (dateDist) {
    const dateStats = {};
    dateDist.forEach(r => {
      if (!dateStats[r.date]) {
        dateStats[r.date] = { query: 0, page: 0 };
      }
      dateStats[r.date][r.data_type]++;
    });
    
    Object.entries(dateStats).forEach(([date, stats]) => {
      if (stats.query > 0 || stats.page > 0) {
        console.log(`  ${date}: ${stats.query} query, ${stats.page} page`);
      }
    });
  }
  
  // 5. 历史累计（所有批次）
  console.log('\n【History 表累计】');
  const { count: historyQueryCount } = await supabase
    .from('maidinhk_gsc_history')
    .select('*', { count: 'exact' })
    .eq('data_type', 'query');
    
  const { count: historyPageCount } = await supabase
    .from('maidinhk_gsc_history')
    .select('*', { count: 'exact' })
    .eq('data_type', 'page');
    
  console.log(`  Query 历史记录: ${historyQueryCount} 条`);
  console.log(`  Page 历史记录: ${historyPageCount} 条`);
  console.log(`  累计数据量: ${historyQueryCount + historyPageCount} 条`);
}

getTotalKeywords().catch(console.error);
