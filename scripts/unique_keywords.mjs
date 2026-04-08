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

async function getUniqueKeywords() {
  console.log('=== 去重后的唯一关键词统计 ===\n');
  
  // 1. 按批次获取唯一的 Query
  const { data: historyQueries } = await supabase
    .from('maidinhk_gsc_history')
    .select('page, upload_batch, position, clicks, impressions')
    .eq('data_type', 'query')
    .order('upload_batch', { ascending: true })
    .order('page', { ascending: true });
    
  if (historyQueries && historyQueries.length > 0) {
    // 按批次分组并去重
    const batchData = {};
    historyQueries.forEach(r => {
      if (!batchData[r.upload_batch]) {
        batchData[r.upload_batch] = new Map(); // 用 Map 去重
      }
      // 同一个 batch 中，相同的 page 只保留一条
      if (!batchData[r.upload_batch].has(r.page)) {
        batchData[r.upload_batch].set(r.page, r);
      }
    });
    
    console.log('【各批次唯一 Query 统计】');
    console.log('-'.repeat(80));
    
    let totalUniqueQueries = 0;
    Object.entries(batchData).forEach(([batch, pagesMap]) => {
      const pages = Array.from(pagesMap.values());
      const top5 = pages.filter(r => r.position <= 5).length;
      const top10 = pages.filter(r => r.position <= 10).length;
      const withClicks = pages.filter(r => r.clicks > 0).length;
      
      console.log(`批次 ${batch}:`);
      console.log(`  唯一 Query数: ${pages.length}`);
      console.log(`  Top 5: ${top5} | Top 10: ${top10} | 有点击: ${withClicks}`);
      
      totalUniqueQueries += pages.length;
    });
    
    console.log(`\n累计唯一 Query数: ${totalUniqueQueries}`);
    
    // 2. 跨所有批次的真正唯一 Query（相同 query 在不同批次算一个）
    const allUniqueQueries = new Map();
    historyQueries.forEach(r => {
      if (!allUniqueQueries.has(r.page)) {
        allUniqueQueries.set(r.page, { batches: [], bestPosition: 100 });
      }
      const entry = allUniqueQueries.get(r.page);
      entry.batches.push(r.upload_batch);
      if (r.position < entry.bestPosition) {
        entry.bestPosition = r.position;
      }
    });
    
    console.log('\n【跨批次真正唯一 Query】');
    console.log('-'.repeat(80));
    console.log(`不重复的关键词总数: ${allUniqueQueries.size}`);
    
    const bestTop5 = Array.from(allUniqueQueries.values()).filter(r => r.bestPosition <= 5).length;
    const bestTop10 = Array.from(allUniqueQueries.values()).filter(r => r.bestPosition <= 10).length;
    
    console.log(`历史最佳排名 Top 5: ${bestTop5}`);
    console.log(`历史最佳排名 Top 10: ${bestTop10}`);
    
    // 3. 当前表的唯一 Query（最新数据）
    console.log('\n【当前表 (Current) - 最新数据】');
    console.log('-'.repeat(80));
    
    const { data: currentQueries } = await supabase
      .from('maidinhk_gsc_current')
      .select('page, position, clicks, impressions')
      .eq('data_type', 'query');
      
    if (currentQueries) {
      // 去重
      const uniqueCurrent = new Map();
      currentQueries.forEach(r => {
        if (!uniqueCurrent.has(r.page)) {
          uniqueCurrent.set(r.page, r);
        }
      });
      
      const currentPages = Array.from(uniqueCurrent.values());
      console.log(`唯一 Query数: ${currentPages.length}`);
      
      const top5 = currentPages.filter(r => r.position <= 5).length;
      const top10 = currentPages.filter(r => r.position <= 10).length;
      const top3 = currentPages.filter(r => r.position <= 3).length;
      const top1 = currentPages.filter(r => r.position <= 1).length;
      const withClicks = currentPages.filter(r => r.clicks > 0).length;
      
      console.log(`第1名: ${top1}`);
      console.log(`Top 3: ${top3}`);
      console.log(`Top 5: ${top5}`);
      console.log(`首页 (Top 10): ${top10}`);
      console.log(`有点击: ${withClicks}`);
      
      // 4. 输出声明建议
      console.log('\n【宣传数据建议】');
      console.log('-'.repeat(80));
      console.log(`基于最新数据 (2026-04-07)，您有:`);
      console.log(`  - ${currentPages.length} 个不同搜索词`);
      console.log(`  - ${top5} 个词进入 Top 5`);
      console.log(`  - ${top10} 个词进入 Top 10`);
      console.log(`  - ${top3} 个词进入 Top 3`);
      console.log(`  - ${top1} 个词排名第1`);
      
      console.log('\n之前的声明 "8个Top 5, 174个Top 10" 可能基于:');
      console.log('  - 早期批次的数据（如2026-02-10）');
      console.log('  - 或者只统计了高展示量的"核心词"');
      console.log('  - 或者手动筛选的部分关键词');
      
      console.log('\n建议的宣传表述:');
      console.log(`  "累计覆盖 ${currentPages.length}+ 搜索词，${top10} 个词稳居首页，${top5} 个词进入 Top 5"`);
    }
  }
  
  // 5. Page 数据
  console.log('\n【Page 页面数据】');
  console.log('-'.repeat(80));
  
  const { data: currentPages } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, position, clicks')
    .eq('data_type', 'page')
    .neq('page', '_SUMMARY_');
    
  if (currentPages) {
    const uniquePages = new Set(currentPages.map(r => r.page)).size;
    console.log(`唯一页面数: ${uniquePages}`);
    
    const homepage = currentPages.filter(r => r.position <= 10).length;
    const withClicks = currentPages.filter(r => r.clicks > 0).length;
    
    console.log(`首页排名: ${homepage}`);
    console.log(`有点击: ${withClicks}`);
  }
}

getUniqueKeywords().catch(console.error);
