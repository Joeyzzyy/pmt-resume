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

async function getPageRankingDist() {
  console.log('=== Page 排名分布统计（用于组件更新）===\n');
  
  const { data: pages } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, position')
    .eq('data_type', 'page')
    .neq('page', '_SUMMARY_');
    
  if (!pages || pages.length === 0) {
    console.log('没有找到 Page 数据');
    return;
  }
  
  console.log(`总 Page 数: ${pages.length}\n`);
  
  // 按排名区间统计
  const top1to5 = pages.filter(r => r.position <= 5);
  const top6to10 = pages.filter(r => r.position > 5 && r.position <= 10);
  const top11to30 = pages.filter(r => r.position > 10 && r.position <= 30);
  const beyond30 = pages.filter(r => r.position > 30);
  
  const total = pages.length;
  
  console.log('排名分布:');
  console.log(`  Top 1-5:     ${top1to5.length} 个 (${(top1to5.length/total*100).toFixed(1)}%)`);
  console.log(`  Top 6-10:    ${top6to10.length} 个 (${(top6to10.length/total*100).toFixed(1)}%)`);
  console.log(`  Top 11-30:   ${top11to30.length} 个 (${(top11to30.length/total*100).toFixed(1)}%)`);
  console.log(`  31+:         ${beyond30.length} 个 (${(beyond30.length/total*100).toFixed(1)}%)`);
  
  const homepage = top1to5.length + top6to10.length;
  console.log(`\n首页占比: ${homepage}/${total} = ${(homepage/total*100).toFixed(1)}%`);
  
  // Top 5 页面
  console.log('\n\n【Top 5 页面】');
  console.log('-'.repeat(70));
  top1to5.slice(0, 10).forEach((r, idx) => {
    const slug = r.page.split('/').pop();
    console.log(`${idx+1}. ${slug} - #${r.position}`);
  });
  
  // Top 6-10 页面
  console.log('\n【Top 6-10 页面 - 抽样】');
  console.log('-'.repeat(70));
  top6to10.slice(0, 10).forEach((r, idx) => {
    const slug = r.page.split('/').pop();
    console.log(`${idx+1}. ${slug} - #${r.position}`);
  });
  
  // 输出组件需要的数据格式
  console.log('\n\n【组件 DEFAULT_DATA 格式】');
  console.log('-'.repeat(70));
  console.log('const DEFAULT_DATA: RankingData[] = [');
  console.log('  {');
  console.log('    range: "top1-5",');
  console.log('    label: "Top 1-5",');
  console.log(`    count: ${top1to5.length},`);
  console.log(`    percentage: ${(top1to5.length/total*100).toFixed(1)},`);
  console.log('    color: GSC_COLORS.ranking.top3,');
  console.log('    description: "首页顶部，冲刺 Top 3",');
  console.log('  },');
  console.log('  {');
  console.log('    range: "top6-10",');
  console.log('    label: "Top 6-10",');
  console.log(`    count: ${top6to10.length},`);
  console.log(`    percentage: ${(top6to10.length/total*100).toFixed(1)},`);
  console.log('    color: GSC_COLORS.ranking.top10,');
  console.log('    description: "首页中部，稳定流量",');
  console.log('  },');
  console.log('  {');
  console.log('    range: "top11-30",');
  console.log('    label: "Top 11-30",');
  console.log(`    count: ${top11to30.length},`);
  console.log(`    percentage: ${(top11to30.length/total*100).toFixed(1)},`);
  console.log('    color: GSC_COLORS.ranking.top30,');
  console.log('    description: "第2-3页，潜力待挖",');
  console.log('  },');
  console.log('  {');
  console.log('    range: "beyond30",');
  console.log('    label: "31+",');
  console.log(`    count: ${beyond30.length},`);
  console.log(`    percentage: ${(beyond30.length/total*100).toFixed(1)},`);
  console.log('    color: GSC_COLORS.ranking.beyond30,');
  console.log('    description: "第4页后，需重点优化",');
  console.log('  },');
  console.log('];');
}

getPageRankingDist().catch(console.error);
