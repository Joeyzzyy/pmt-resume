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

async function checkHistoryBatches() {
  console.log('=== 检查不同批次的关键词排名数据 ===\n');
  
  // 1. 检查 history 表中的不同批次
  console.log('【1. History 表 - 按上传批次查看】');
  console.log('-'.repeat(80));
  
  const { data: batches } = await supabase
    .from('maidinhk_gsc_history')
    .select('upload_batch, upload_date')
    .eq('data_type', 'query')
    .order('upload_date', { ascending: true });
    
  if (batches && batches.length > 0) {
    // 去重获取不同批次
    const uniqueBatches = [...new Set(batches.map(b => b.upload_batch))];
    console.log(`发现的批次: ${uniqueBatches.join(', ')}\n`);
    
    for (const batch of uniqueBatches.slice(0, 3)) {
      const { data: batchData } = await supabase
        .from('maidinhk_gsc_history')
        .select('page, position')
        .eq('data_type', 'query')
        .eq('upload_batch', batch);
        
      if (batchData) {
        const top5 = batchData.filter(r => r.position <= 5).length;
        const top10 = batchData.filter(r => r.position <= 10).length;
        console.log(`批次 ${batch}:`);
        console.log(`  总Query数: ${batchData.length}`);
        console.log(`  Top 5: ${top5} 个词`);
        console.log(`  Top 10: ${top10} 个词`);
        
        // 显示该批次的Top 5关键词
        const topQueries = batchData
          .filter(r => r.position <= 5)
          .sort((a, b) => a.position - b.position)
          .slice(0, 5);
        console.log(`  Top 5示例: ${topQueries.map(q => q.page.substring(0, 15)).join(', ')}...`);
        console.log();
      }
    }
  }
  
  // 2. 检查 current 表 vs history 表的差异
  console.log('\n【2. Current 表 vs History 表对比】');
  console.log('-'.repeat(80));
  
  // Current 表
  const { data: currentData } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, position')
    .eq('data_type', 'query');
    
  if (currentData) {
    const currentTop5 = currentData.filter(r => r.position <= 5).length;
    const currentTop10 = currentData.filter(r => r.position <= 10).length;
    console.log(`Current 表 (最新数据):`);
    console.log(`  总Query数: ${currentData.length}`);
    console.log(`  Top 5: ${currentTop5} 个词`);
    console.log(`  Top 10: ${currentTop10} 个词`);
  }
  
  // 3. 检查是否有重复query
  console.log('\n【3. Query 去重分析】');
  console.log('-'.repeat(80));
  
  if (currentData) {
    const uniqueQueries = new Set(currentData.map(r => r.page));
    console.log(`Current 表总记录数: ${currentData.length}`);
    console.log(`Unique Query数: ${uniqueQueries.size}`);
    console.log(`重复记录数: ${currentData.length - uniqueQueries.size}`);
    
    // 查找重复的query
    const pageCount = {};
    currentData.forEach(r => {
      pageCount[r.page] = (pageCount[r.page] || 0) + 1;
    });
    const duplicates = Object.entries(pageCount)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (duplicates.length > 0) {
      console.log(`\n重复次数最多的Query:`);
      duplicates.forEach(([page, count]) => {
        console.log(`  ${page.substring(0, 40)}: ${count}次`);
      });
    }
  }
  
  // 4. 分析声明数据可能的来源
  console.log('\n【4. 声明数据来源推测】');
  console.log('-'.repeat(80));
  console.log('声明: 8个Top 5, 174个Top 10, 270个首页');
  console.log('实际: 121个Top 5, 486个Top 10, 486个首页');
  console.log();
  console.log('可能的原因:');
  console.log('1. 声明基于早期数据（如2026-02-10），实际是当前数据（2026-04-07）');
  console.log('2. 声明可能只统计了"核心关键词"，实际包含所有长尾词');
  console.log('3. 3个月数据积累，关键词数量自然增长');
  console.log('4. 网站权重提升，更多词进入首页');
  
  // 5. 检查按impressions排序的Top query
  console.log('\n【5. 按展示量排序的Top Query（高展示量=核心词）】');
  console.log('-'.repeat(80));
  
  const { data: topImpressionQueries } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, impressions, clicks, position')
    .eq('data_type', 'query')
    .order('impressions', { ascending: false })
    .limit(20);
    
  if (topImpressionQueries) {
    console.log('Top 20 高展示量Query:');
    topImpressionQueries.forEach((row, idx) => {
      const pos = row.position <= 10 ? `✅#${row.position}` : `#${row.position}`;
      console.log(`  ${idx+1}. ${row.page.substring(0, 35)} | 展示:${row.impressions} | 排名:${pos}`);
    });
    
    const highImpTop10 = topImpressionQueries.filter(r => r.position <= 10).length;
    console.log(`\n高展示量Query中首页占比: ${highImpTop10}/20 (${highImpTop10*5}%)`);
  }
}

checkHistoryBatches().catch(console.error);
