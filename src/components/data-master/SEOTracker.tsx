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

// 获取详细优化建议
function getOptimizationAdvice(page: PageData, history: PageHistory[]): string[] {
  const advice: string[] = [];
  
  // 基于 CTR 的详细建议
  const ctrPercent = page.ctr * 100;
  if (ctrPercent < 1) {
    advice.push(`【CTR极低 ${ctrPercent.toFixed(2)}%】标题和描述亟需优化。建议：1) 在标题前20字内包含核心关键词；2) 描述中加入数字、问号或强烈动词；3) 添加明确的行动号召如"点击查看"`);
  } else if (ctrPercent < 2) {
    advice.push(`【CTR偏低 ${ctrPercent.toFixed(2)}%】有提升空间。建议：分析排名靠前竞品的标题，找出差异点；测试A/B版本标题，突出独特价值主张`);
  } else if (ctrPercent > 5) {
    advice.push(`【CTR优秀 ${ctrPercent.toFixed(2)}%】标题策略有效，建议保持并记录成功经验，应用到其他页面`);
  }
  
  // 基于排名的详细建议
  if (page.position > 50) {
    advice.push(`【排名靠后 ${page.position.toFixed(1)}】第5页之后，曝光极低。建议：1) 检查内容是否完全匹配搜索意图；2) 增加2000字以上深度内容；3) 建设5-10个高质量外链`);
  } else if (page.position > 30) {
    advice.push(`【排名待提升 ${page.position.toFixed(1)}】第3-5页。建议：1) 内容长度扩展至TOP3竞品水平；2) 增加相关主题内链5-8个；3) 优化页面加载速度`);
  } else if (page.position > 10) {
    advice.push(`【冲击首页 ${page.position.toFixed(1)}】第2页位置。建议：1) 分析首页竞品内容缺口，补充独特信息；2) 增加用户互动元素如问答、评论；3) 更新发布时间至近期`);
  } else if (page.position <= 10 && page.position > 3) {
    advice.push(`【首页优化 ${page.position.toFixed(1)}】已在首页。建议：1) 争取精选摘要(Featured Snippet)；2) 添加结构化数据标记；3) 优化首屏内容匹配搜索意图`);
  } else if (page.position <= 3) {
    advice.push(`【TOP3维持 ${page.position.toFixed(1)}】优秀排名！建议：1) 监控竞品动态；2) 定期更新内容保持新鲜度；3) 考虑增加相关关键词变体`);
  }
  
  // 基于展示量的建议
  if (page.impressions > 5000 && page.clicks < 50) {
    advice.push(`【高曝光低转化】展示${page.impressions}次仅点击${page.clicks}次。严重不匹配搜索意图！建议：1) 重新审视关键词定位；2) 标题明确标注内容类型(指南/列表/评测)`);
  } else if (page.impressions > 1000 && page.ctr < 0.02) {
    advice.push(`【流量潜力大】展示量${page.impressions}但CTR低。小优化带来大收益！建议：标题前15字必须包含核心痛点词，如"如何"、"最佳"、"完整指南"`);
  } else if (page.impressions < 100 && page.position < 10) {
    advice.push(`【关键词拓展】排名好但搜索量小。建议：拓展相关长尾关键词，如添加"2024"、"香港"、"攻略"等地域/时间修饰词`);
  }
  
  // 基于点击量的建议
  if (page.clicks === 0 && page.impressions > 200) {
    advice.push(`【零点击预警】有曝光无点击！紧急检查：1) 标题是否包含负面词汇；2) 描述是否被截断显示不完整；3) 页面是否被标记为过时`);
  }
  
  // 基于趋势的建议（如果有历史数据）
  if (history.length >= 2) {
    const first = history[0].summary;
    const last = history[history.length - 1].summary;
    const prev = history.length > 1 ? history[history.length - 2].summary : first;
    
    // 点击量趋势
    const clickChange = ((last.clicks - first.clicks) / Math.max(first.clicks, 1)) * 100;
    const recentChange = ((last.clicks - prev.clicks) / Math.max(prev.clicks, 1)) * 100;
    
    if (clickChange < -30) {
      advice.push(`【趋势警告】点击量下降${Math.abs(clickChange).toFixed(0)}%！可能原因：1) 谷歌算法更新；2) 竞品内容更新；3) 季节性因素。建议立即检查排名变化并更新内容`);
    } else if (clickChange > 50) {
      advice.push(`【趋势优秀】点击量上升${clickChange.toFixed(0)}%！分析成功因素：是标题优化、内容更新还是外链增加？复制此策略到其他页面`);
    } else if (recentChange < -20) {
      advice.push(`【近期下滑】最近一次更新后点击下降${Math.abs(recentChange).toFixed(0)}%。建议回滚检查，或加速内容迭代频率`);
    }
    
    // 排名趋势
    const posChange = last.position - first.position;
    if (posChange > 3) {
      advice.push(`【排名下滑】从${first.position.toFixed(1)}降至${last.position.toFixed(1)}。可能竞品发力或内容过时，建议分析TOP3竞品并差异化优化`);
    } else if (posChange < -3) {
      advice.push(`【排名上升】从${first.position.toFixed(1)}升至${last.position.toFixed(1)}！优化有效，继续保持更新频率`);
    }
  } else if (history.length === 1) {
    advice.push(`【数据积累中】仅有1个时间点数据。建议：1) 7-14天后再次上传GSC数据；2) 期间可进行标题/内容优化以便对比效果`);
  }
  
  // 默认建议
  if (advice.length === 0) {
    advice.push('数据表现平稳，建议定期监控并小幅优化以保持竞争力');
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

  // 从 URL 提取文章标题（支持中文）
  function extractPageTitle(url: string): string {
    try {
      // 解码 URL 编码的中文字符
      const decodedUrl = decodeURIComponent(url);
      const urlObj = new URL(decodedUrl);
      const pathname = urlObj.pathname;
      // 提取最后一部分作为标题
      const slug = pathname.split('/').pop() || '';
      // 将 slug 转换为可读标题
      return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .substring(0, 60);
    } catch {
      // 如果解码失败，返回原始 URL 的最后一部分
      try {
        const parts = url.split('/');
        const lastPart = parts.pop() || '';
        return decodeURIComponent(lastPart).replace(/-/g, ' ').substring(0, 60);
      } catch {
        return url;
      }
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
              <th className="px-4 py-3 text-left font-medium text-[#666] w-[45%]">文章标题（点击访问页面）</th>
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
                      href={page.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[350px] truncate text-sm font-medium text-[#2563eb] hover:underline"
                      title={`访问: ${page.page}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {extractPageTitle(page.page)}
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
              href={selectedPageData.page}
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
                  href={selectedPageData.page}
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
              
              {/* 优化建议 */}
              <div className="flex-1 max-h-[200px] overflow-y-auto rounded-sm border border-blue-200 bg-blue-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong className="text-sm text-blue-800">SEO 优化建议</strong>
                  <span className="text-xs text-blue-600">({getOptimizationAdvice(selectedPageData, pageHistory).length} 条)</span>
                </div>
                <ul className="space-y-2">
                  {getOptimizationAdvice(selectedPageData, pageHistory).map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-blue-700">
                      <span className="flex-shrink-0 font-bold">{idx + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
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

            {/* 多指标提示 */}
            {selectedMetrics.length > 1 && (
              <div className="mb-3 rounded-sm bg-[#fafafa] p-2 text-xs text-[#666]">
                💡 多指标同屏时数据已归一化处理（0-100%），悬停查看实际数值
              </div>
            )}

            {/* 图表 */}
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={normalizedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                    stroke="#888"
                    fontSize={11}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={11}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
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
                                        ? `${(value as number).toFixed(2)}%`
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
                      dataKey={`${metric}Normalized`}
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
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="border-t border-[#eee] bg-[#fafafa] p-6">
        <h4 className="mb-3 text-sm font-semibold text-[#1a1a1a]">💡 使用说明</h4>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
          <li>
            <strong>上方页面列表：</strong>展示所有页面的核心数据，按优化优先级排序（🔴高优/🟡中优/🟢正常），点击标题可直接访问页面
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
