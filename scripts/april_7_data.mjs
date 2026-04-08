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

async function getApril7Data() {
  console.log('=== 2026-04-07 批次真实数据 ===\n');
  
  // 1. Query 数据
  const { data: queries } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, clicks, impressions, ctr, position')
    .eq('data_type', 'query')
    .order('impressions', { ascending: false });
    
  if (!queries || queries.length === 0) {
    console.log('没有找到 4.7 的数据');
    return;
  }
  
  console.log(`【Query 搜索词 - 共 ${queries.length} 个】\n`);
  
  // 排名分布
  const top1 = queries.filter(r => r.position <= 1);
  const top3 = queries.filter(r => r.position <= 3);
  const top5 = queries.filter(r => r.position <= 5);
  const top10 = queries.filter(r => r.position <= 10);
  const page2 = queries.filter(r => r.position > 10 && r.position <= 20);
  const beyond = queries.filter(r => r.position > 20);
  
  console.log('排名分布:');
  console.log(`  第1名:     ${top1.length} 个 (${(top1.length/queries.length*100).toFixed(1)}%)`);
  console.log(`  Top 3:     ${top3.length} 个 (${(top3.length/queries.length*100).toFixed(1)}%)`);
  console.log(`  Top 5:     ${top5.length} 个 (${(top5.length/queries.length*100).toFixed(1)}%)`);
  console.log(`  首页(1-10): ${top10.length} 个 (${(top10.length/queries.length*100).toFixed(1)}%)`);
  console.log(`  第2页(11-20): ${page2.length} 个 (${(page2.length/queries.length*100).toFixed(1)}%)`);
  console.log(`  第3页+:     ${beyond.length} 个 (${(beyond.length/queries.length*100).toFixed(1)}%)`);
  
  // 点击分布
  const withClicks = queries.filter(r => r.clicks > 0);
  const noClicks = queries.filter(r => r.clicks === 0);
  
  console.log(`\n点击分布:`);
  console.log(`  有点击: ${withClicks.length} 个 (${(withClicks.length/queries.length*100).toFixed(1)}%)`);
  console.log(`  零点击: ${noClicks.length} 个 (${(noClicks.length/queries.length*100).toFixed(1)}%)`);
  
  // 展示量分布
  const highImp = queries.filter(r => r.impressions >= 500);
  const medImp = queries.filter(r => r.impressions >= 100 && r.impressions < 500);
  const lowImp = queries.filter(r => r.impressions < 100);
  
  console.log(`\n展示量分布:`);
  console.log(`  高展示(≥500): ${highImp.length} 个`);
  console.log(`  中展示(100-499): ${medImp.length} 个`);
  console.log(`  低展示(<100): ${lowImp.length} 个`);
  
  // Top 20 高展示量词
  console.log(`\n\n【Top 20 高展示量搜索词】`);
  console.log('-'.repeat(90));
  queries.slice(0, 20).forEach((r, idx) => {
    const pos = r.position <= 10 ? `✅ #${r.position.toFixed(1)}` : `#${r.position.toFixed(1)}`;
    const ctr = (r.ctr * 100).toFixed(1);
    console.log(`${(idx+1).toString().padStart(2)}. ${r.page.substring(0, 30).padEnd(30)} | 展示:${r.impressions.toString().padStart(5)} | 点击:${r.clicks.toString().padStart(3)} | CTR:${ctr.padStart(4)}% | 排名:${pos}`);
  });
  
  // Top 10 高 CTR 词（展示>100）
  const highCtr = queries
    .filter(r => r.impressions >= 100)
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 10);
    
  console.log(`\n\n【Top 10 高 CTR 搜索词（展示≥100）】`);
  console.log('-'.repeat(90));
  highCtr.forEach((r, idx) => {
    const ctr = (r.ctr * 100).toFixed(1);
    console.log(`${(idx+1).toString().padStart(2)}. ${r.page.substring(0, 35).padEnd(35)} | CTR:${ctr.padStart(5)}% | 点击:${r.clicks.toString().padStart(3)} | 展示:${r.impressions} | #${r.position.toFixed(1)}`);
  });
  
  // 急需优化的词：高展示 + 低CTR + 首页排名
  const optimize = queries
    .filter(r => r.impressions >= 300 && r.ctr < 0.02 && r.position <= 15)
    .sort((a, b) => b.impressions - a.impressions);
    
  console.log(`\n\n【急需优化：高展示+低CTR】`);
  console.log('-'.repeat(90));
  optimize.slice(0, 10).forEach((r, idx) => {
    const ctr = (r.ctr * 100).toFixed(2);
    console.log(`${(idx+1).toString().padStart(2)}. ${r.page.substring(0, 40).padEnd(40)} | 展示:${r.impressions.toString().padStart(5)} | CTR:${ctr}% | 点击:${r.clicks} | #${r.position.toFixed(1)}`);
  });
  
  // 2. Page 数据
  console.log(`\n\n【Page 页面数据】\n`);
  
  const { data: pages } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, clicks, impressions, ctr, position')
    .eq('data_type', 'page')
    .neq('page', '_SUMMARY_')
    .order('clicks', { ascending: false });
    
  if (pages) {
    console.log(`共 ${pages.length} 个页面`);
    
    const pageTop10 = pages.filter(r => r.position <= 10);
    const pageWithClicks = pages.filter(r => r.clicks > 0);
    
    console.log(`首页排名: ${pageTop10.length} 个 (${(pageTop10.length/pages.length*100).toFixed(1)}%)`);
    console.log(`有点击: ${pageWithClicks.length} 个 (${(pageWithClicks.length/pages.length*100).toFixed(1)}%)`);
    
    console.log(`\nTop 15 页面（按点击）:`);
    console.log('-'.repeat(90));
    pages.slice(0, 15).forEach((r, idx) => {
      const slug = r.page.split('/').pop();
      const ctr = (r.ctr * 100).toFixed(1);
      console.log(`${(idx+1).toString().padStart(2)}. ${slug.substring(0, 35).padEnd(35)} | 点击:${r.clicks.toString().padStart(3)} | 展示:${r.impressions.toString().padStart(5)} | CTR:${ctr}% | #${r.position.toFixed(1)}`);
    });
  }
  
  // 3. 总体统计
  console.log(`\n\n【总体流量统计】`);
  console.log('-'.repeat(90));
  
  const totalClicks = queries.reduce((sum, r) => sum + r.clicks, 0);
  const totalImpressions = queries.reduce((sum, r) => sum + r.impressions, 0);
  const avgCtr = totalClicks / totalImpressions * 100;
  const avgPosition = queries.reduce((sum, r) => sum + r.position, 0) / queries.length;
  
  console.log(`总点击: ${totalClicks}`);
  console.log(`总展示: ${totalImpressions.toLocaleString()}`);
  console.log(`平均 CTR: ${avgCtr.toFixed(2)}%`);
  console.log(`平均排名: ${avgPosition.toFixed(1)}`);
}

getApril7Data().catch(console.error);
