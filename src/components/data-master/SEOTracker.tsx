'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { CardSkeleton, ChartSkeleton } from '@/components/ui/LoadingSpinner';

interface PageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PageHistory {
  upload_date: string;
  summary: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

interface SEOTrackerProps {
  refreshKey?: number;
}

// 获取详细优化建议 - 全面版
function getOptimizationAdvice(page: PageData, history: PageHistory[]): string[] {
  const advice: string[] = [];
  const ctrPercent = page.ctr * 100;
  
  // ========== 1. 核心指标诊断 ==========
  
  // CTR 诊断与优化
  if (ctrPercent < 1) {
    advice.push(`【CTR极低 ${ctrPercent.toFixed(2)}%】SERP吸引力严重不足。立即执行：①标题前20字包含核心关键词+数字(如"2024最新"、"5个步骤")；②描述中加入问句或强烈动词("如何"、"避免"、"完整")；③添加行动号召("立即查看"、"免费下载")；④检查是否被Google截断显示`);
  } else if (ctrPercent < 2) {
    advice.push(`【CTR偏低 ${ctrPercent.toFixed(2)}%】有优化空间。行动方案：①分析排名前3竞品的标题和描述，找出差异化卖点；②A/B测试标题版本(痛点型vs利益型)；③在描述中加入具体数据("3天搞定"、"省$5000")；④确保标题长度在55-60字符内`);
  } else if (ctrPercent >= 2 && ctrPercent < 4) {
    advice.push(`【CTR正常 ${ctrPercent.toFixed(2)}%】达到行业平均水平。进阶优化：①加入情感触发词("终极"、"完整"、"新手必看")；②测试添加emoji或特殊符号；③优化URL显示路径，使其更简洁可读`);
  } else if (ctrPercent >= 4 && ctrPercent < 8) {
    advice.push(`【CTR良好 ${ctrPercent.toFixed(2)}%】超过70%的竞品。保持策略：①记录当前标题/描述的成功要素；②监控竞品是否模仿你的策略；③小幅测试优化(如添加年份)防止审美疲劳`);
  } else if (ctrPercent >= 8) {
    advice.push(`【CTR优秀 ${ctrPercent.toFixed(2)}%】顶尖表现！复制经验：①将此页面的标题公式应用到其他页面；②分析该页面的Search Console查询报告，拓展相关高CTR关键词；③考虑将此页面作为PPC着陆页，验证商业转化`);
  }
  
  // ========== 2. 排名位置策略 ==========
  
  if (page.position > 50) {
    advice.push(`【深度优化阶段 #${page.position.toFixed(1)}】第5页+，需要根本性改进：①重新进行关键词研究，确认搜索意图匹配度；②内容长度目标：3000字+，覆盖TOP10竞品所有子话题；③建立5-10个高质量外链(DA>40的行业站)；④添加视频/图表等多媒体提升停留时间；⑤预计见效周期：2-3个月`);
  } else if (page.position > 30) {
    advice.push(`【快速提升阶段 #${page.position.toFixed(1)}】第3-5页，冲刺首页：①内容扩展至2000字+，补充FAQ板块；②增加8-12个内链从首页/栏目页指向此页面；③优化页面加载速度(LCP<2.5s)；④添加作者署名和作者简介提升E-A-T；⑤更新发布日期至最近3个月内`);
  } else if (page.position > 10) {
    advice.push(`【临门一脚阶段 #${page.position.toFixed(1)}】第2页，冲击首页：①深度分析首页TOP3内容结构，补充他们缺失的信息；②添加互动元素(投票、评论、分享按钮)提升用户参与度；③增加相关内容推荐模块降低跳出率；④获取2-3个行业相关外链；⑤在社交媒体引流，提升页面活跃度信号`);
  } else if (page.position > 5 && page.position <= 10) {
    advice.push(`【首页中部优化 #${page.position.toFixed(1)}】冲刺TOP5：①优化Featured Snippet机会(添加表格、列表、步骤说明)；②实施Schema标记(HowTo、FAQ、Article)；③首屏内容直接回答用户问题，降低pogo-sticking；④增加内链权重传递；⑤监控竞品更新频率，保持内容新鲜度`);
  } else if (page.position > 3 && page.position <= 5) {
    advice.push(`【冲刺TOP3 #${page.position.toFixed(1)}】争取更多点击和信任：①标题中加入权威背书("官方"、"权威指南")；②首段内容更强有力的价值主张；③添加用户评价/案例增强可信度；④优化图片ALT标签和文件名包含关键词；⑤考虑添加视频内容提升停留时间`);
  } else if (page.position <= 3) {
    advice.push(`【TOP3防守策略 #${page.position.toFixed(1)}】维持优势地位：①设置竞品监控，每周检查排名变化；②每月更新内容保持时效性(添加最新数据/案例)；③拓展相关长尾词变体(同义词、相关问题)；④优化品牌搜索词表现，强化品牌信号；⑤监控Featured Snippet状态，确保不被抢占`);
  }
  
  // ========== 3. 流量质量与转化 ==========
  
  if (page.impressions > 5000 && page.clicks < 100) {
    advice.push(`【高曝光低转化危机】展示${page.impressions}次仅点击${page.clicks}次，CTR仅${ctrPercent.toFixed(2)}%！紧急行动：①标题与搜索意图严重错位，重新定位关键词；②检查标题是否包含负面词汇("问题"、"风险")；③描述是否被截断或显示无关内容；④页面内容类型是否匹配(用户搜"价格"却看到"流程")；⑤考虑添加Sitelinks搜索框`);
  } else if (page.impressions > 2000 && page.ctr < 0.015) {
    advice.push(`【流量潜力挖掘】展示量${page.impressions}但CTR偏低。高回报优化：①标题前15字必须是用户痛点词("多少钱"、"怎么办"、"完整攻略")；②添加具体数字增强可信度("$5000"、"7天"、"10个技巧")；③使用括号增强吸引力("[2024更新]"、"[附模板]")；④移动端SERP预览检查，确保不被截断`);
  } else if (page.impressions > 500 && page.ctr > 0.05) {
    advice.push(`【高转化页面优化】CTR ${ctrPercent.toFixed(1)}%表现优秀！商业转化优化：①在首屏添加明确的CTA按钮("免费咨询"、"立即下载")；②添加信任元素(客户数、评分、认证标志)；③优化页面加载速度防止跳出；④添加相关内容推荐延长浏览路径；⑤收集用户邮箱，建立私域流量`);
  }
  
  // ========== 4. 关键词策略 ==========
  
  if (page.impressions < 100 && page.position < 5) {
    advice.push(`【长尾词拓展机会】排名好(#${page.position.toFixed(1)})但搜索量小。扩展策略：①添加地域修饰词("香港"、"中环"、"九龙")；②添加时间词("2024"、"最新"、"现在")；③添加场景词("新手"、"雇主必看"、"第一次")；④使用AnswerThePublic查找相关问题；⑤内链锚文本多样化，使用长尾变体`);
  }
  
  if (page.impressions > 2000 && page.position > 15) {
    advice.push(`【高价值词追赶】热门词但排名靠后。竞争策略：①分析TOP10页面内容缺口，找到差异化角度；②创作更全面的指南(字数>TOP3平均值50%)；③获取行业专家背书或引用权威来源；④制作信息图/视频等可分享资产获取外链；⑤考虑长尾词包围策略，先拿下周边词再攻主词`);
  }
  
  // ========== 5. 技术SEO检查 ==========
  
  if (page.clicks === 0 && page.impressions > 300) {
    advice.push(`【零点击预警】有曝光无点击！立即检查：①标题是否包含吓退用户的词汇("罚款"、"法律"、"禁止")；②描述是否被截断显示"..."导致语义不完整；③页面日期是否显示"2年前"让用户觉得过时；④URL是否过长或包含乱码；⑤检查移动端SERP展示是否正常`);
  }
  
  if (page.position < 5 && page.clicks < 10) {
    advice.push(`【排名与点击不匹配】首页排名但点击少。可能原因：①Featured Snippet被竞品抢占，用户无需点击；②品牌搜索结果占满首屏；③图片/视频结果分散注意力；④标题/描述在移动端显示异常。检查：①优化争取Featured Snippet；②强化品牌词搜索；③添加结构化数据`);
  }
  
  // ========== 6. 内容优化建议 ==========
  
  if (page.ctr > 0.03 && page.position > 8) {
    advice.push(`【内容质量提升】CTR好但排名不顶尖，说明内容有吸引力但权威性不足：①增加内容深度，覆盖更多子话题；②添加案例研究或数据支撑；③获取2-3个高质量外链提升Domain Authority；④增加社交分享按钮提升社交信号；⑤考虑添加作者署名和作者简介`);
  }
  
  if (page.position < 15 && page.ctr < 0.01) {
    advice.push(`【元数据紧急优化】排名不错但CTR极低，SERP展示有问题：①重写Title Tag，确保55-60字符内不被截断；②优化Meta Description，155字符内包含核心卖点和CTA；③检查Rich Snippets是否正确显示(评分、价格等)；④确保URL简洁可读；⑤测试不同标题版本，找出最佳CTR方案`);
  }
  
  // ========== 7. 历史趋势分析 ==========
  
  if (history.length >= 2) {
    const first = history[0].summary;
    const last = history[history.length - 1].summary;
    const prev = history.length > 1 ? history[history.length - 2].summary : first;
    
    const clickChange = ((last.clicks - first.clicks) / Math.max(first.clicks, 1)) * 100;
    const recentChange = ((last.clicks - prev.clicks) / Math.max(prev.clicks, 1)) * 100;
    const posChange = last.position - first.position;
    
    if (clickChange < -40) {
      advice.push(`【严重下滑警报】点击量暴跌${Math.abs(clickChange).toFixed(0)}%！紧急排查：①检查Google算法更新是否影响此页面类型；②查看Search Console的查询报告，确认主要关键词排名变化；③检查页面是否被黑/挂马；④确认竞品是否发布更优质内容；⑤检查页面技术问题(404、重定向、robots屏蔽)`);
    } else if (clickChange < -20) {
      advice.push(`【趋势下滑警告】点击量下降${Math.abs(clickChange).toFixed(0)}%。可能原因：①内容时效性下降(检查竞品更新时间)；②季节性需求变化；③新竞品加入分流流量。行动：①更新内容并修改发布日期；②分析下滑关键词，针对性优化；③增加内链支持`);
    } else if (clickChange > 100) {
      advice.push(`【爆发式增长】点击量增长${clickChange.toFixed(0)}%！成功因素分析：①是哪个优化动作带来效果？(标题/内容/外链)；②增长来自哪些关键词？拓展相关词；③检查是否有 viral 社交分享或外链；④立即复制此成功模式到其他页面；⑤监控排名稳定性，防止反弹`);
    } else if (clickChange > 30) {
      advice.push(`【稳定增长】点击量提升${clickChange.toFixed(0)}%。优化有效！下一步：①识别最有效的优化动作；②小幅迭代继续优化(如添加FAQ)；③拓展相关长尾词获取额外流量；④监控CTR变化，确保排名提升带来点击增长`);
    }
    
    if (recentChange < -25) {
      advice.push(`【近期异常下滑】最近期点击下降${Math.abs(recentChange).toFixed(0)}%。检查：①最近是否有页面改动导致问题；②Google是否有算法更新；③竞品是否发布新内容；④季节性因素(周末/节假日)`);
    }
    
    if (posChange > 5) {
      advice.push(`【排名大幅下滑】从${first.position.toFixed(1)}降至${last.position.toFixed(1)}。竞品分析：①查看TOP3竞品最近更新内容；②检查自己的内容是否过时；③外链是否丢失；④页面技术问题(速度、移动适配)`);
    } else if (posChange < -5) {
      advice.push(`【排名大幅提升】从${first.position.toFixed(1)}升至${last.position.toFixed(1)}！巩固成果：①继续保持内容更新频率；②监控竞品反应；③拓展相关词获取更多流量；④考虑将此页面作为PPC着陆页`);
    } else if (Math.abs(posChange) <= 2 && history.length >= 3) {
      advice.push(`【排名稳定】位置变化在2位内，属于正常波动。维护策略：①小幅更新保持新鲜度；②监控竞品动态；③收集用户反馈优化内容`);
    }
  } else if (history.length === 1) {
    advice.push(`【数据基线建立】首次记录数据，建议：①7-14天后上传新数据对比变化；②期间可进行标题/内容优化；③记录当前优化动作以便归因；④设置排名监控，异常时及时通知`);
  }
  
  // ========== 8. 竞争与差异化 ==========
  
  if (page.position > 3 && page.position <= 10 && page.ctr > 0.03) {
    advice.push(`【首页突围策略】CTR高说明有竞争力，冲刺TOP3：①分析TOP3内容结构，补充缺失的模块；②添加独家数据/案例增强独特性；③获取品牌提及或专家背书；④优化用户体验指标(停留时间、跳出率)`);
  }
  
  if (advice.length === 0) {
    advice.push('【数据表现平稳】各项指标正常，建议：①定期监控排名变化；②小幅更新内容保持时效性；③拓展相关长尾词获取额外流量；④关注竞品动态，保持竞争优势');
  }
  
  return advice;
}

// 获取优化优先级
function getPriority(page: PageData, history: PageHistory[]): 'high' | 'medium' | 'low' {
  // 高优先级：高展示低点击，或排名下滑
  if (page.impressions > 1000 && page.ctr < 0.01) return 'high';
  if (page.position > 20 && page.impressions > 500) return 'high';
  if (history.length >= 2) {
    const last = history[history.length - 1].summary;
    const prev = history[history.length - 2].summary;
    if (last.clicks < prev.clicks * 0.7) return 'high';
  }
  
  // 中优先级：有潜力进首页
  if (page.position > 10 && page.position <= 30) return 'medium';
  if (page.ctr < 0.02 && page.impressions > 300) return 'medium';
  
  return 'low';
}

export default function SEOTracker({ refreshKey }: SEOTrackerProps) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<PageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'clicks' | 'impressions' | 'position' | 'priority'>('priority');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['clicks', 'position']);

  // 获取所有页面列表
  useEffect(() => {
    fetchPages();
  }, [refreshKey]);

  // 获取选中页面的历史数据
  useEffect(() => {
    if (selectedPage) {
      fetchPageHistory(selectedPage);
    }
  }, [selectedPage]);

  async function fetchPages() {
    try {
      setLoading(true);
      setError(null);

      // 从 current 表获取所有页面数据
      const response = await fetch('/api/gsc-current-pages');
      if (!response.ok) {
        throw new Error('获取页面数据失败');
      }

      const data = await response.json();
      setPages(data.pages || []);
      
      // 默认选中第一个页面
      if (data.pages?.length > 0 && !selectedPage) {
        setSelectedPage(data.pages[0].page);
      }
    } catch (err) {
      console.error('Fetch pages error:', err);
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPageHistory(page: string) {
    try {
      setHistoryLoading(true);

      const response = await fetch(`/api/page-history?page=${encodeURIComponent(page)}`);
      if (!response.ok) {
        throw new Error('获取历史数据失败');
      }

      const data = await response.json();
      setPageHistory(data.history || []);
    } catch (err) {
      console.error('Fetch page history error:', err);
      setPageHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  // 从 URL 提取文章 slug（保持英文原样，不转换）
  function extractPageSlug(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // 提取最后一部分作为 slug
      const slug = pathname.split('/').pop() || '';
      // 只保留 slug，不做任何转换
      return slug.substring(0, 50);
    } catch {
      // 如果解析失败，返回原始 URL 的最后一部分
      const parts = url.split('/');
      return (parts.pop() || '').substring(0, 50);
    }
  }

  // 格式化 URL 显示（用于趋势图区域）
  function formatPageUrl(url: string): string {
    const cleanUrl = url.replace(/^https?:\/\//, '');
    return cleanUrl.length > 70 ? cleanUrl.substring(0, 70) + '...' : cleanUrl;
  }

  // 排序页面
  const sortedPages = [...pages].sort((a, b) => {
    if (sortBy === 'priority') {
      // 按优先级排序（需要异步获取历史数据，这里简化处理）
      const priorityA = a.impressions > 1000 && a.ctr < 0.01 ? 3 : a.position > 10 ? 2 : 1;
      const priorityB = b.impressions > 1000 && b.ctr < 0.01 ? 3 : b.position > 10 ? 2 : 1;
      return priorityB - priorityA;
    }
    if (sortBy === 'position') {
      return a[sortBy] - b[sortBy];
    }
    return b[sortBy] - a[sortBy];
  });

  // 准备图表数据
  const chartData = pageHistory.map((h) => ({
    date: h.upload_date,
    clicks: h.summary.clicks,
    impressions: h.summary.impressions,
    ctr: h.summary.ctr,
    position: h.summary.position,
  }));

  // 指标配置
  const metricsConfig = {
    clicks: { label: '点击量', color: '#2563eb', unit: '' },
    impressions: { label: '展示量', color: '#10b981', unit: '' },
    ctr: { label: 'CTR', color: '#f59e0b', unit: '%' },
    position: { label: '排名', color: '#ef4444', unit: '' },
  };

  // 切换指标显示
  function toggleMetric(metric: string) {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  }

  // 归一化数据
  function normalizeData(data: typeof chartData) {
    if (data.length === 0) return data;
    
    const maxValues: Record<string, number> = {};
    selectedMetrics.forEach((metric) => {
      maxValues[metric] = Math.max(...data.map((d) => (d as any)[metric]), 1);
    });

    return data.map((d) => {
      const normalized: any = { ...d };
      selectedMetrics.forEach((metric) => {
        normalized[`${metric}Normalized`] = ((d as any)[metric] / maxValues[metric]) * 100;
      });
      return normalized;
    });
  }

  const normalizedData = normalizeData(chartData);

  // 获取优先级标签
  function getPriorityLabel(priority: 'high' | 'medium' | 'low') {
    const labels = {
      high: { text: '高优', color: 'bg-red-100 text-red-700' },
      medium: { text: '中优', color: 'bg-yellow-100 text-yellow-700' },
      low: { text: '正常', color: 'bg-green-100 text-green-700' },
    };
    return labels[priority];
  }

  if (loading) {
    return (
      <div className="rounded-sm border border-[#eee] bg-white p-6">
        <CardSkeleton count={5} />
      </div>
    );
  }

  const selectedPageData = pages.find((p) => p.page === selectedPage);

  return (
    <div className="rounded-sm border border-[#eee] bg-white">
      {/* Header */}
      <div className="border-b border-[#eee] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#1a1a1a]">
              SEO 动作影响追踪
            </h3>
            <p className="mt-1 text-sm text-[#888]">
              共 {pages.length} 个页面 · 点击下方"查看趋势"查看详细优化建议
            </p>
          </div>

          {/* 排序选项 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#999]">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-sm border border-[#ddd] bg-white px-2 py-1 text-xs"
            >
              <option value="priority">优化优先级</option>
              <option value="clicks">点击量</option>
              <option value="impressions">展示量</option>
              <option value="position">排名</option>
            </select>
          </div>
        </div>
      </div>

      {/* 上方：页面详情列表 */}
      <div className="max-h-[500px] overflow-y-auto border-b border-[#eee]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#fafafa]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[#666] w-[30%]">Slug（点击访问）</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">点击</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">展示</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">CTR</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">排名</th>
              <th className="px-4 py-3 text-center font-medium text-[#666]">优先级</th>
              <th className="px-4 py-3 text-center font-medium text-[#666]">查看趋势</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            {sortedPages.map((page, index) => {
              const priority = getPriority(page, []);
              const priorityLabel = getPriorityLabel(priority);
              const isSelected = selectedPage === page.page;
              
              return (
                <tr
                  key={page.page}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-blue-50'
                      : index % 2 === 0
                      ? 'bg-white'
                      : 'bg-[#fafafa]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <a 
                      href={encodeURI(page.page)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[200px] truncate text-sm font-medium text-[#2563eb] hover:underline"
                      title={`访问: ${page.page}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {extractPageSlug(page.page)}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">{page.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{page.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{(page.ctr * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        page.position <= 10
                          ? 'text-green-600 font-medium'
                          : page.position <= 30
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {page.position.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${priorityLabel.color}`}>
                      {priorityLabel.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedPage(page.page)}
                      className={`rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#1a1a1a] text-white'
                          : 'border border-[#ddd] bg-white text-[#666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                      }`}
                    >
                      {isSelected ? '已选中' : '查看趋势'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 下方：趋势图 */}
      <div className="p-6">
        {!selectedPageData ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
              <svg className="h-8 w-8 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-[#666]">点击上方"查看趋势"按钮查看数据变化</p>
            <p className="mt-1 text-xs text-[#999]">或直接点击 URL 访问页面</p>
          </div>
        ) : historyLoading ? (
          <ChartSkeleton />
        ) : pageHistory.length < 2 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <a
              href={encodeURI(selectedPageData.page)}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 font-medium text-[#2563eb] hover:underline"
            >
              {formatPageUrl(selectedPageData.page)}
            </a>
            <p className="text-[#666]">数据点不足</p>
            <p className="mt-1 text-xs text-[#999]">
              该页面需要至少两个时间点的数据才能显示趋势
            </p>
            <p className="mt-2 text-xs text-[#999]">
              当前只有 {pageHistory.length} 个数据点，请多次上传 GSC 数据以查看趋势
            </p>
          </div>
        ) : (
          <div>
            {/* 页面标题和当前数据 */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <a
                  href={encodeURI(selectedPageData.page)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#2563eb] hover:underline"
                >
                  {formatPageUrl(selectedPageData.page)}
                </a>
                <p className="text-xs text-[#999]">
                  历史数据点：{pageHistory.length} 个 · 
                  当前点击：{selectedPageData.clicks} · 
                  排名：{selectedPageData.position.toFixed(1)}
                </p>
              </div>
              

            </div>

            {/* 指标选择 */}
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(metricsConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => toggleMetric(key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedMetrics.includes(key)
                      ? 'text-white shadow-sm'
                      : 'bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0]'
                  }`}
                  style={{
                    backgroundColor: selectedMetrics.includes(key) ? config.color : undefined,
                  }}
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                  {config.label}
                </button>
              ))}
            </div>

            {/* 指标模式提示 */}
            {selectedMetrics.length === 1 ? (
              <div className="mb-3 flex items-center gap-1.5 rounded-sm bg-[#fafafa] p-2 text-xs text-[#666]">
                <svg className="h-3.5 w-3.5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                当前显示实际数值，Y轴为 {metricsConfig[selectedMetrics[0] as keyof typeof metricsConfig].label}
              </div>
            ) : (
              <div className="mb-3 flex items-center gap-1.5 rounded-sm bg-[#fafafa] p-2 text-xs text-[#666]">
                <svg className="h-3.5 w-3.5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                多指标同屏时数据已归一化处理（0-100%），悬停查看实际数值
              </div>
            )}

            {/* 图表 */}
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedMetrics.length === 1 ? chartData : normalizedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                    stroke="#888"
                    fontSize={11}
                  />
                  {selectedMetrics.length === 1 ? (
                    // 单指标模式：使用实际数值
                    <YAxis
                      stroke={metricsConfig[selectedMetrics[0] as keyof typeof metricsConfig].color}
                      fontSize={11}
                      domain={selectedMetrics[0] === 'position' ? [0, 'auto'] : [0, 'auto']}
                      tickFormatter={(value) => {
                        const metric = selectedMetrics[0];
                        if (metric === 'ctr') return `${value.toFixed(1)}%`;
                        if (metric === 'position') return value.toFixed(0);
                        return value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toString();
                      }}
                    />
                  ) : (
                    // 多指标模式：使用归一化百分比
                    <YAxis
                      stroke="#888"
                      fontSize={11}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                  )}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataIndex = normalizedData.findIndex(
                          (d) => d.date === label
                        );
                        const originalData = chartData[dataIndex];
                        
                        return (
                          <div className="rounded-sm border border-[#eee] bg-white p-3 shadow-lg">
                            <p className="mb-2 text-xs text-[#888]">
                              {format(parseISO(label as string), 'yyyy年MM月dd日')}
                            </p>
                            <div className="space-y-1">
                              {selectedMetrics.map((metric) => {
                                const config = metricsConfig[metric as keyof typeof metricsConfig];
                                const value = originalData[metric as keyof typeof originalData];
                                return (
                                  <div
                                    key={metric}
                                    className="flex items-center justify-between gap-4 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: config.color }}
                                      />
                                      <span className="text-[#666]">{config.label}</span>
                                    </div>
                                    <span className="font-medium" style={{ color: config.color }}>
                                      {metric === 'ctr'
                                        ? `${(value as number).toFixed(2)}`
                                        : metric === 'position'
                                        ? (value as number).toFixed(1)
                                        : (value as number).toLocaleString()}
                                      {config.unit}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => metricsConfig[value as keyof typeof metricsConfig]?.label || value}
                  />
                  {selectedMetrics.map((metric) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={selectedMetrics.length === 1 ? metric : `${metric}Normalized`}
                      name={metric}
                      stroke={metricsConfig[metric as keyof typeof metricsConfig].color}
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 历史数据表格 */}
            <div className="mt-4 rounded-sm border border-[#eee]">
              <table className="w-full text-xs">
                <thead className="bg-[#fafafa]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-[#666]">上传日期</th>
                    <th className="px-3 py-2 text-right font-medium text-[#666]">点击</th>
                    <th className="px-3 py-2 text-right font-medium text-[#666]">展示</th>
                    <th className="px-3 py-2 text-right font-medium text-[#666]">CTR</th>
                    <th className="px-3 py-2 text-right font-medium text-[#666]">排名</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee]">
                  {pageHistory.map((h, index) => (
                    <tr
                      key={h.upload_date}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}
                    >
                      <td className="px-3 py-2">{h.upload_date}</td>
                      <td className="px-3 py-2 text-right">{h.summary.clicks}</td>
                      <td className="px-3 py-2 text-right">
                        {h.summary.impressions.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {h.summary.ctr.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right">
                        {h.summary.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SEO 优化建议 - 放在下方更清晰 */}
            {selectedPageData && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">SEO 优化建议</h4>
                      <p className="text-xs text-blue-600">基于当前数据的 8 维度诊断</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {getOptimizationAdvice(selectedPageData, pageHistory).length} 条建议
                  </span>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                  {getOptimizationAdvice(selectedPageData, pageHistory).map((tip, idx) => {
                    // 根据建议类型设置不同的颜色和图标
                    let colorClass = "border-blue-200 bg-white";
                    let iconSvg = (
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                    if (tip.includes("【CTR极低") || tip.includes("【严重下滑") || tip.includes("【零点击") || tip.includes("【高曝光低转化危机")) {
                      colorClass = "border-red-200 bg-red-50";
                      iconSvg = (
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      );
                    } else if (tip.includes("【CTR优秀") || tip.includes("【趋势优秀") || tip.includes("【爆发式") || tip.includes("【排名大幅上升")) {
                      colorClass = "border-green-200 bg-green-50";
                      iconSvg = (
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                    } else if (tip.includes("【CTR偏低") || tip.includes("【趋势下滑") || tip.includes("【近期异常") || tip.includes("【排名下滑")) {
                      colorClass = "border-amber-200 bg-amber-50";
                      iconSvg = (
                        <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      );
                    } else if (tip.includes("【冲刺") || tip.includes("【临门一脚") || tip.includes("【首页突围")) {
                      colorClass = "border-purple-200 bg-purple-50";
                      iconSvg = (
                        <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      );
                    } else if (tip.includes("【深度优化") || tip.includes("【快速提升")) {
                      colorClass = "border-indigo-200 bg-indigo-50";
                      iconSvg = (
                        <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      );
                    }
                    
                    return (
                      <div 
                        key={idx} 
                        className={`rounded-md border ${colorClass} p-3 transition-all hover:shadow-md`}
                      >
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 mt-0.5">{iconSvg}</span>
                          <div className="text-xs leading-relaxed text-gray-700">
                            {tip}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="border-t border-[#eee] bg-[#fafafa] p-6">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
          <svg className="h-4 w-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          使用说明
        </h4>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
          <li>
            <strong>上方页面列表：</strong>展示所有页面的核心数据，按优化优先级排序（高优/中优/正常），点击标题可直接访问页面
          </li>
          <li>
            <strong>下方优化建议：</strong>点击"查看趋势"后，在此查看基于 CTR、排名、点击量等多维度的详细优化建议
          </li>
          <li>
            <strong>趋势图分析：</strong>展示页面历史数据变化，可切换不同指标进行对比分析
          </li>
          <li>
            <strong>数据更新：</strong>多次上传 GSC 数据后，可观察优化措施的实际效果</li>
        </ul>
      </div>
    </div>
  );
}
