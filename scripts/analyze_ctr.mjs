import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 读取 .env.local 文件
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCTR() {
  console.log('=== 数据库最高 CTR 数据分析 ===\n');
  
  // 1. 查询 Query 类型中最高的 CTR（展示量 > 100 排除异常值）
  console.log('【Query 数据 - 高 CTR Top 20】（展示量 > 100）');
  console.log('-'.repeat(80));
  
  const { data: highCtrQueries } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, clicks, impressions, ctr, position, date')
    .eq('data_type', 'query')
    .gt('impressions', 100)
    .order('ctr', { ascending: false })
    .limit(20);
    
  if (highCtrQueries && highCtrQueries.length > 0) {
    highCtrQueries.forEach((row, idx) => {
      const ctrPercent = (row.ctr * 100).toFixed(2);
      console.log(`${idx + 1}. ${row.page.substring(0, 40)}`);
      console.log(`   CTR: ${ctrPercent}% | 点击: ${row.clicks} | 展示: ${row.impressions} | 排名: ${row.position?.toFixed(1)}`);
    });
  }
  
  // 2. 查询 Page 类型中最高的 CTR（展示量 > 500）
  console.log('\n\n【Page 数据 - 高 CTR Top 15】（展示量 > 500）');
  console.log('-'.repeat(80));
  
  const { data: highCtrPages } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, clicks, impressions, ctr, position')
    .eq('data_type', 'page')
    .gt('impressions', 500)
    .neq('page', '_SUMMARY_')
    .order('ctr', { ascending: false })
    .limit(15);
    
  if (highCtrPages && highCtrPages.length > 0) {
    highCtrPages.forEach((row, idx) => {
      const url = new URL(row.page);
      const slug = url.pathname.split('/').pop() || '';
      const ctrPercent = (row.ctr * 100).toFixed(2);
      console.log(`${idx + 1}. ${slug}`);
      console.log(`   CTR: ${ctrPercent}% | 点击: ${row.clicks} | 展示: ${row.impressions} | 排名: #${row.position?.toFixed(1)}`);
    });
  }
  
  // 3. CTR 分布统计
  console.log('\n\n【CTR 分布统计】');
  console.log('-'.repeat(80));
  
  const { data: allQueries } = await supabase
    .from('maidinhk_gsc_current')
    .select('ctr, impressions')
    .eq('data_type', 'query')
    .gt('impressions', 50);
    
  if (allQueries && allQueries.length > 0) {
    const ranges = {
      'CTR = 0%': 0,
      'CTR 0-1%': 0,
      'CTR 1-3%': 0,
      'CTR 3-5%': 0,
      'CTR 5-10%': 0,
      'CTR 10%+': 0,
    };
    
    allQueries.forEach((row) => {
      const ctr = row.ctr * 100;
      if (ctr === 0) ranges['CTR = 0%']++;
      else if (ctr < 1) ranges['CTR 0-1%']++;
      else if (ctr < 3) ranges['CTR 1-3%']++;
      else if (ctr < 5) ranges['CTR 3-5%']++;
      else if (ctr < 10) ranges['CTR 5-10%']++;
      else ranges['CTR 10%+']++;
    });
    
    const total = allQueries.length;
    Object.entries(ranges).forEach(([range, count]) => {
      const percent = ((count / total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round((count / total) * 30));
      console.log(`${range.padEnd(12)}: ${count.toString().padStart(4)} (${percent}%) ${bar}`);
    });
  }
  
  // 4. 高展示量但 CTR 极低（优化机会）
  console.log('\n\n【高展示量但 CTR < 1% - 急需优化】');
  console.log('-'.repeat(80));
  
  const { data: lowCtrHighImp } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, clicks, impressions, ctr, position')
    .eq('data_type', 'query')
    .gt('impressions', 500)
    .lt('ctr', 0.01)
    .order('impressions', { ascending: false })
    .limit(10);
    
  if (lowCtrHighImp && lowCtrHighImp.length > 0) {
    lowCtrHighImp.forEach((row, idx) => {
      const ctrPercent = (row.ctr * 100).toFixed(2);
      console.log(`${idx + 1}. ${row.page.substring(0, 45)}`);
      console.log(`   展示: ${row.impressions} | CTR: ${ctrPercent}% | 点击: ${row.clicks} | 排名: ${row.position?.toFixed(1)}`);
    });
  }
}

analyzeCTR().catch(console.error);
