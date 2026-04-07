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

// 获取优化建议
function getOptimizationAdvice(page: PageData, history: PageHistory[]): string {
  const advice: string[] = [];
  
  // 基于 CTR 的建议
  if (page.ctr < 0.01) {
    advice.push('CTR 较低，建议优化标题和描述以提高点击率');
  } else if (page.ctr > 0.05) {
    advice.push('CTR 表现优秀，保持当前标题策略');
  }
  
  // 基于排名的建议
  if (page.position > 30) {
    advice.push('排名在第3页之后，需要加强内容优化和外链建设');
  } else if (page.position > 10) {
    advice.push('排名在第2页，有潜力进入首页，建议增加相关内容内链');
  } else if (page.position <= 10 && page.position > 3) {
    advice.push('已在首页，冲击前3名可增加流量');
  }
  
  // 基于展示量的建议
  if (page.impressions > 1000 && page.clicks < 20) {
    advice.push('展示量高但点击少，标题/描述可能不够吸引人');
  }
  
  // 基于趋势的建议
  if (history.length >= 2) {
    const first = history[0].summary;
    const last = history[history.length - 1].summary;
    
    if (last.clicks < first.clicks * 0.8) {
      advice.push('近期点击下降明显，建议检查排名变化');
    } else if (last.clicks > first.clicks * 1.2) {
      advice.push('近期点击上升，优化效果明显');
    }
    
    if (last.position > first.position + 2) {
      advice.push('排名下滑，需要关注竞争对手动态');
    } else if (last.position < first.position - 2) {
      advice.push('排名上升，继续保持优化策略');
    }
  }
  
  return advice.length > 0 ? advice.join('；') : '数据稳定，继续保持';
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

  // 从 URL 提取文章标题
  function extractPageTitle(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // 提取最后一部分作为标题
      const slug = pathname.split('/').pop() || '';
      // 将 slug 转换为可读标题
      return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .substring(0, 60);
    } catch {
      return url;
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
              共 {pages.length} 个页面 · 点击页面查看历史趋势和优化建议
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
              <th className="px-4 py-3 text-left font-medium text-[#666]">文章标题（点击访问）</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">点击</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">展示</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">CTR</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">排名</th>
              <th className="px-4 py-3 text-center font-medium text-[#666]">优先级</th>
              <th className="px-4 py-3 text-left font-medium text-[#666]">优化建议</th>
              <th className="px-4 py-3 text-center font-medium text-[#666]">操作</th>
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
                      className="block max-w-[280px] truncate text-sm font-medium text-[#2563eb] hover:underline"
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
                  <td className="px-4 py-3">
                    <div className="max-w-[280px] truncate text-xs text-[#666]" title={getOptimizationAdvice(page, [])}>
                      {getOptimizationAdvice(page, [])}
                    </div>
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
              <div className="max-w-[400px] rounded-sm bg-blue-50 p-3 text-xs text-blue-700">
                <strong>优化建议：</strong>
                {getOptimizationAdvice(selectedPageData, pageHistory)}
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
            <strong>页面列表：</strong>上方展示所有有数据的页面，按优化优先级排序（红标=高优，黄标=中优，绿标=正常）
          </li>
          <li>
            <strong>优化建议：</strong>根据 CTR、排名、点击量等指标自动生成优化建议
          </li>
          <li>
            <strong>趋势图：</strong>点击下方页面，查看该页面的历史数据变化
          </li>
          <li>
            <strong>多指标对比：</strong>可同时显示点击量、排名等多个指标的变化趋势
          </li>
        </ul>
      </div>
    </div>
  );
}
