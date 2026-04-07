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

export default function SEOTracker({ refreshKey }: SEOTrackerProps) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<PageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'clicks' | 'impressions' | 'position'>('clicks');
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

      const response = await fetch('/api/data-master-stats');
      if (!response.ok) {
        throw new Error('获取页面数据失败');
      }

      const data = await response.json();
      setPages(data.topPages || []);
      
      // 默认选中第一个页面
      if (data.topPages?.length > 0 && !selectedPage) {
        setSelectedPage(data.topPages[0].page);
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

  // 格式化页面 URL 显示
  function formatPageUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const display = pathname.replace('/blog/', '').replace(/-/g, ' ');
      return display.length > 40 ? display.substring(0, 40) + '...' : display;
    } catch {
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  }

  // 排序页面
  const sortedPages = [...pages].sort((a, b) => {
    if (sortBy === 'position') {
      return a[sortBy] - b[sortBy]; // 排名越小越好
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

  // 归一化数据（用于同屏展示多个指标）
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

  if (loading) {
    return (
      <div className="rounded-sm border border-[#eee] bg-white p-6">
        <CardSkeleton count={5} />
      </div>
    );
  }

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
              查看每篇文章的数据变化趋势，评估 SEO 优化效果
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
              <option value="clicks">点击量</option>
              <option value="impressions">展示量</option>
              <option value="position">排名</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* 左侧：页面列表 */}
        <div className="max-h-[600px] overflow-y-auto border-r border-[#eee]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#fafafa]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#666]">页面</th>
                <th className="px-4 py-3 text-right font-medium text-[#666]">点击</th>
                <th className="px-4 py-3 text-right font-medium text-[#666]">展示</th>
                <th className="px-4 py-3 text-right font-medium text-[#666]">排名</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee]">
              {sortedPages.map((page, index) => (
                <tr
                  key={page.page}
                  onClick={() => setSelectedPage(page.page)}
                  className={`cursor-pointer transition-colors ${
                    selectedPage === page.page
                      ? 'bg-[#f0f0f0]'
                      : index % 2 === 0
                      ? 'bg-white hover:bg-[#fafafa]'
                      : 'bg-[#fafafa] hover:bg-[#f5f5f5]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="max-w-[250px] truncate" title={page.page}>
                      {formatPageUrl(page.page)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {page.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {page.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        page.position <= 10
                          ? 'text-green-600'
                          : page.position <= 30
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {page.position.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右侧：趋势图 */}
        <div className="p-6">
          {!selectedPage ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
                <svg
                  className="h-8 w-8 text-[#999]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-[#666]">点击左侧页面查看趋势</p>
            </div>
          ) : historyLoading ? (
            <ChartSkeleton />
          ) : pageHistory.length < 2 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-[#666]">数据点不足</p>
              <p className="mt-1 text-xs text-[#999]">
                该页面需要至少两个时间点的数据才能显示趋势
              </p>
              <p className="mt-2 text-xs text-[#999]">
                当前只有 {pageHistory.length} 个数据点
              </p>
            </div>
          ) : (
            <div>
              {/* 页面标题 */}
              <div className="mb-4">
                <h4 className="font-medium text-[#1a1a1a]">
                  {formatPageUrl(selectedPage)}
                </h4>
                <p className="text-xs text-[#999]">
                  历史数据点：{pageHistory.length} 个
                </p>
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
                  💡 多指标同屏时数据已归一化处理，悬停查看实际数值
                </div>
              )}

              {/* 图表 */}
              <div style={{ width: '100%', height: 300 }}>
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
              <div className="mt-4 max-h-[180px] overflow-y-auto rounded-sm border border-[#eee]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#fafafa]">
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
      </div>

      {/* 使用说明 */}
      <div className="border-t border-[#eee] bg-[#fafafa] p-6">
        <h4 className="mb-3 text-sm font-semibold text-[#1a1a1a]">💡 使用说明</h4>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
          <li>
            <strong>页面列表：</strong>点击左侧任意页面，右侧显示该页面的历史数据趋势
          </li>
          <li>
            <strong>多指标对比：</strong>点击图表上方的指标按钮，可同时查看多个指标的变化趋势
          </li>
          <li>
            <strong>数据来源：</strong>每次上传 GSC 数据时，该页面的数据会被记录为一个时间点
          </li>
          <li>
            <strong>效果评估：</strong>观察折线图的变化，判断 SEO 优化是否产生正向效果
          </li>
        </ul>
      </div>
    </div>
  );
}
