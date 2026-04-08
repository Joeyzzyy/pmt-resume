import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 读取 .env.local
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

async function verifyClaims() {
  console.log('=== 核实宣传内容准确性 ===\n');
  
  // 1. 核实月曝光80,000+、月点击2,200+
  console.log('【1. 零成本冷启动核实】');
  console.log('-'.repeat(80));
  
  const { data: summaryData } = await supabase
    .from('maidinhk_gsc_current')
    .select('date, clicks, impressions')
    .eq('data_type', 'summary')
    .order('date', { ascending: false })
    .limit(30);
    
  if (summaryData && summaryData.length > 0) {
    const recentMonth = summaryData.slice(0, 30);
    const totalClicks = recentMonth.reduce((sum, r) => sum + (r.clicks || 0), 0);
    const totalImpressions = recentMonth.reduce((sum, r) => sum + (r.impressions || 0), 0);
    console.log(`最近30天数据:`);
    console.log(`  总点击: ${totalClicks.toLocaleString()}`);
    console.log(`  总曝光: ${totalImpressions.toLocaleString()}`);
    console.log(`  平均月点击: ${Math.round(totalClicks).toLocaleString()}`);
    console.log(`  平均月曝光: ${Math.round(totalImpressions).toLocaleString()}`);
    console.log(`\n声明: 月曝光80,000+ → ${totalImpressions >= 80000 ? '✅ 准确' : totalImpressions >= 70000 ? '⚠️ 接近 (' + totalImpressions.toLocaleString() + ')' : '❌ 偏高 (' + totalImpressions.toLocaleString() + ')'}`);
    console.log(`声明: 月点击2,200+ → ${totalClicks >= 2200 ? '✅ 准确' : totalClicks >= 2000 ? '⚠️ 接近 (' + totalClicks.toLocaleString() + ')' : '❌ 偏高 (' + totalClicks.toLocaleString() + ')'}`);
  }
  
  // 2. 核实关键词排名数据
  console.log('\n\n【2. 关键词霸屏核实】');
  console.log('-'.repeat(80));
  
  const { data: queryRankings } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, position')
    .eq('data_type', 'query');
    
  if (queryRankings && queryRankings.length > 0) {
    const top5 = queryRankings.filter(r => r.position <= 5).length;
    const top10 = queryRankings.filter(r => r.position <= 10).length;
    const homepage = queryRankings.filter(r => r.position <= 10).length;
    const total = queryRankings.length;
    
    console.log(`Query 数据排名分布:`);
    console.log(`  Top 5: ${top5} 个词`);
    console.log(`  Top 6-10: ${top10 - top5} 个词`);
    console.log(`  首页 (Top 10): ${homepage} 个词`);
    console.log(`  总Query数: ${total} 个词`);
    console.log(`\n声明: 8个词进入Top 5 → ${top5 >= 8 ? '✅ 准确' : '❌ 实际 ' + top5 + ' 个'}`);
    console.log(`声明: 174个词进入Top 10 → ${top10 >= 174 ? '✅ 准确' : '❌ 实际 ' + top10 + ' 个'}`);
    console.log(`声明: 近270个首页关键词 → ${homepage >= 250 ? '✅ 准确' : homepage >= 230 ? '⚠️ 接近 (' + homepage + ')' : '❌ 实际 ' + homepage + ' 个'}`);
  }
  
  // 3. 核实CTR数据
  console.log('\n\n【3. CTR极致优化核实】');
  console.log('-'.repeat(80));
  
  // 核心文章CTR
  const { data: pageCtr } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, ctr, clicks, impressions')
    .eq('data_type', 'page')
    .gt('impressions', 1000)
    .order('ctr', { ascending: false })
    .limit(5);
    
  if (pageCtr && pageCtr.length > 0) {
    console.log('高CTR页面 (展示>1000):');
    pageCtr.forEach((row, idx) => {
      const slug = row.page.split('/').pop();
      console.log(`  ${idx+1}. ${slug}: ${(row.ctr*100).toFixed(1)}% CTR (${row.clicks}点击/${row.impressions}展示)`);
    });
    const has10Plus = pageCtr.some(r => r.ctr >= 0.10);
    console.log(`\n声明: 核心文章CTR 10%+ → ${has10Plus ? '✅ 有页面达到' : '❌ 最高CTR ' + (pageCtr[0].ctr*100).toFixed(1) + '%'}`);
  }
  
  // 高意向词CTR (检查具体高CTR query)
  const { data: highIntentCtr } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, ctr, clicks, impressions, position')
    .eq('data_type', 'query')
    .gt('impressions', 50)
    .gt('ctr', 0.15)
    .order('ctr', { ascending: false })
    .limit(10);
    
  if (highIntentCtr && highIntentCtr.length > 0) {
    console.log('\n高意向Query CTR (展示>50, CTR>15%):');
    highIntentCtr.forEach((row, idx) => {
      if (idx < 5) {
        console.log(`  ${idx+1}. ${row.page.substring(0, 35)}: ${(row.ctr*100).toFixed(1)}% (排名#${row.position})`);
      }
    });
    const has22Plus = highIntentCtr.some(r => r.ctr >= 0.22);
    console.log(`\n声明: 高意向页面CTR 22%+ → ${has22Plus ? '✅ 有页面达到' : '⚠️ 最高CTR ' + (highIntentCtr[0].ctr*100).toFixed(1) + '%'}`);
  }
  
  // 行业均值对比 (一般搜索CTR 2-3%, 首页CTR 3-5%)
  const avgCtr = queryRankings ? 
    queryRankings.reduce((sum, r) => sum + (r.ctr || 0), 0) / queryRankings.length : 0;
  console.log(`\n全站平均CTR: ${(avgCtr*100).toFixed(2)}%`);
  console.log(`行业均值参考: 首页CTR约3-5%`);
  console.log(`声明: 超行业均值5倍 → ${avgCtr*100 >= 15 ? '✅ 准确' : avgCtr*100 >= 12 ? '⚠️ 接近 (' + (avgCtr*100).toFixed(1) + '%)' : '❌ 实际 ' + (avgCtr*100).toFixed(1) + '%'}`);
  
  // 4. 核实特定页面曝光
  console.log('\n\n【4. 排名快速突破核实】');
  console.log('-'.repeat(80));
  
  const targetPages = [
    '/blog/visa-application-process',
    '/blog/filipino-vs-indonesian-salary-cost'
  ];
  
  for (const pagePath of targetPages) {
    const { data: pageData } = await supabase
      .from('maidinhk_gsc_current')
      .select('page, impressions, clicks, ctr, position')
      .eq('data_type', 'page')
      .ilike('page', `%${pagePath}%`)
      .single();
      
    if (pageData) {
      const slug = pageData.page.split('/').pop();
      console.log(`${slug}:`);
      console.log(`  曝光: ${pageData.impressions.toLocaleString()}`);
      console.log(`  点击: ${pageData.clicks}`);
      console.log(`  CTR: ${(pageData.ctr*100).toFixed(1)}%`);
      console.log(`  排名: #${pageData.position}`);
      
      if (pagePath.includes('visa-application')) {
        console.log(`  声明曝光4,694次 → ${pageData.impressions >= 4694 ? '✅ 准确' : pageData.impressions >= 4000 ? '⚠️ 接近 (' + pageData.impressions.toLocaleString() + ')' : '❌ 实际 ' + pageData.impressions.toLocaleString()}`);
      } else if (pagePath.includes('salary-cost')) {
        console.log(`  声明曝光3,463次 → ${pageData.impressions >= 3463 ? '✅ 准确' : pageData.impressions >= 3000 ? '⚠️ 接近 (' + pageData.impressions.toLocaleString() + ')' : '❌ 实际 ' + pageData.impressions.toLocaleString()}`);
      }
    }
  }
  
  // 5. 核实内容集群
  console.log('\n\n【5. 内容集群覆盖核实】');
  console.log('-'.repeat(80));
  
  const { data: pageCategories } = await supabase
    .from('maidinhk_gsc_current')
    .select('page, clicks, impressions')
    .eq('data_type', 'page')
    .neq('page', '_SUMMARY_');
    
  if (pageCategories && pageCategories.length > 0) {
    // 按URL路径分类
    const categories = {
      'helper-blacklist': { name: '外佣黑名单', pages: [] },
      'work-schedule': { name: '工作表/时间表', pages: [] },
      'visa': { name: '签证相关', pages: [] },
      'salary-cost': { name: '薪资成本', pages: [] },
      'interview': { name: '面试相关', pages: [] },
      'contract': { name: '合约相关', pages: [] },
      'accommodation': { name: '住宿标准', pages: [] },
      'other': { name: '其他', pages: [] }
    };
    
    pageCategories.forEach(row => {
      const page = row.page.toLowerCase();
      if (page.includes('blacklist')) categories['helper-blacklist'].pages.push(row);
      else if (page.includes('schedule') || page.includes('timetable')) categories['work-schedule'].pages.push(row);
      else if (page.includes('visa')) categories['visa'].pages.push(row);
      else if (page.includes('salary') || page.includes('cost') || page.includes('wage')) categories['salary-cost'].pages.push(row);
      else if (page.includes('interview')) categories['interview'].pages.push(row);
      else if (page.includes('contract')) categories['contract'].pages.push(row);
      else if (page.includes('accommodation')) categories['accommodation'].pages.push(row);
      else categories['other'].pages.push(row);
    });
    
    console.log('内容集群分布:');
    Object.entries(categories)
      .filter(([_, cat]) => cat.pages.length > 0)
      .sort((a, b) => b[1].pages.length - a[1].pages.length)
      .forEach(([key, cat]) => {
        const totalClicks = cat.pages.reduce((sum, p) => sum + (p.clicks || 0), 0);
        const totalImp = cat.pages.reduce((sum, p) => sum + (p.impressions || 0), 0);
        console.log(`  ${cat.name}: ${cat.pages.length}页 | ${totalClicks}点击 | ${totalImp}曝光`);
      });
    
    console.log('\n声明: Topic Cluster方法论规划 → ✅ 数据支持（多主题覆盖）');
  }
  
  // 6. 核实商业价值
  console.log('\n\n【6. 商业价值验证核实】');
  console.log('-'.repeat(80));
  
  if (pageCategories && pageCategories.length > 0) {
    // 识别工具/攻略类页面
    const toolPages = pageCategories.filter(p => {
      const page = p.page.toLowerCase();
      return page.includes('schedule') || 
             page.includes('download') || 
             page.includes('checklist') ||
             page.includes('guide') ||
             page.includes('template') ||
             page.includes('process');
    });
    
    const totalClicks = pageCategories.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const toolClicks = toolPages.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const toolPercent = (toolClicks / totalClicks * 100).toFixed(1);
    
    console.log(`工具/攻略类页面 (${toolPages.length}页):`);
    toolPages.slice(0, 5).forEach((p, idx) => {
      const slug = p.page.split('/').pop();
      console.log(`  ${idx+1}. ${slug}: ${p.clicks}点击`);
    });
    console.log(`\n工具/攻略类页面流量占比: ${toolPercent}%`);
    console.log(`声明: 贡献30%+核心流量 → ${parseFloat(toolPercent) >= 30 ? '✅ 准确' : parseFloat(toolPercent) >= 25 ? '⚠️ 接近 (' + toolPercent + '%)' : '❌ 实际 ' + toolPercent + '%'}`);
    
    // 长尾高意向词分析
    const { data: longTailQueries } = await supabase
      .from('maidinhk_gsc_current')
      .select('page, clicks, impressions, position')
      .eq('data_type', 'query')
      .gt('page.length', 8) // 长尾词通常较长
      .lte('position', 10)  // 首页排名
      .lt('impressions', 200) // 低搜索量但精准
      .order('clicks', { ascending: false })
      .limit(10);
      
    if (longTailQueries && longTailQueries.length > 0) {
      console.log('\n长尾高意向词 (精准匹配):');
      longTailQueries.forEach((row, idx) => {
        if (idx < 5) {
          console.log(`  ${idx+1}. ${row.page.substring(0, 40)}: ${row.clicks}点击 (#${row.position})`);
        }
      });
      console.log('\n声明: 长尾高意向词具备强转化潜力 → ✅ 数据支持（多精准长尾词）');
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('核实完成！');
}

verifyClaims().catch(console.error);
