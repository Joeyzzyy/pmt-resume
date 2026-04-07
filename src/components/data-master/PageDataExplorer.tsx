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
  batch: string;
  upload_date: string;
  summary: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  daily: {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
}

interface PageDataExplorerProps {
  refreshKey?: number;
}

export default function PageDataExplorer({ refreshKey }: PageDataExplorerProps) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<PageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'clicks' | 'impressions' | 'position'>('clicks');
  const [metric, setMetric] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');

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
      // 使用 topPages 作为页面列表
      setPages(data.topPages || []);
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
      return display.length > 50 ? display.substring(0, 50) + '...' : display;
    } catch {
      return url.length > 60 ? url.substring(0, 60) + '...' : url;
    }
  }

  // 排序页面
  const sortedPages = [...pages].sort((a, b) => b[sortBy] - a[sortBy]);

  // 准备图表数据
  const chartData = pageHistory.map((h) => ({
    date: h.upload_date,
    clicks: h.summary.clicks,
    impressions: h.summary.impressions,
    ctr: h.summary.ctr,
    position: h.summary.position,
  }));

  // 指标配置
  const metricConfig = {
    clicks: { label: '点击量', color: '#2563eb', unit: '' },
    impressions: { label: '展示量', color: '#10b981', unit: '' },
    ctr: { label: 'CTR', color: '#f59e0b', unit: '%' },
    position: { label: '排名', color: '#ef4444', unit: '' },
  };

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
              页面数据详情
            </h3>
            <p className="mt-1 text-sm text-[#888]">
              查看每篇文章的详细数据，点击页面查看历史变化趋势
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
        {/* 页面列表 */}
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

        {/* 详情面板 */}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-[#666]">点击左侧页面查看详情</p>
              <p className="mt-1 text-xs text-[#999]">
                可查看该页面在不同时间点的数据变化
              </p>
            </div>
          ) : historyLoading ? (
            <ChartSkeleton />
          ) : pageHistory.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-[#666]">暂无历史数据</p>
              <p className="mt-1 text-xs text-[#999]">
                该页面只在一个批次中出现
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
                  历史数据：{pageHistory.length} 个时间点
                </p>
              </div>

              {/* 指标选择 */}
              <div className="mb-4 flex flex-wrap gap-2">
                {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setMetric(key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      metric === key
                        ? 'text-white'
                        : 'bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0]'
                    }`}
                    style={{
                      backgroundColor: metric === key ? metricConfig[key].color : undefined,
                    }}
                  >
                    {metricConfig[key].label}
                  </button>
                ))}
              </div>

              {/* 图表 */}
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                      stroke="#888"
                      fontSize={11}
                    />
                    <YAxis
                      stroke={metricConfig[metric].color}
                      fontSize={11}
                      tickFormatter={(value) =>
                        metric === 'ctr'
                          ? `${value.toFixed(1)}%`
                          : value.toLocaleString()
                      }
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const value = payload[0].value as number;
                          return (
                            <div className="rounded-sm border border-[#eee] bg-white p-3 shadow-lg">
                              <p className="mb-2 text-xs text-[#888]">
                                {format(parseISO(label as string), 'yyyy年MM月dd日')}
                              </p>
                              <p className="text-sm font-medium" style={{ color: metricConfig[metric].color }}>
                                {metricConfig[metric].label}:{' '}
                                {metric === 'ctr'
                                  ? `${value.toFixed(2)}%`
                                  : metric === 'position'
                                  ? value.toFixed(1)
                                  : value.toLocaleString()}
                                {metricConfig[metric].unit}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={metric}
                      stroke={metricConfig[metric].color}
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 历史数据表格 */}
              <div className="mt-4 max-h-[200px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[#666]">日期</th>
                      <th className="px-3 py-2 text-right font-medium text-[#666]">点击</th>
                      <th className="px-3 py-2 text-right font-medium text-[#666]">展示</th>
                      <th className="px-3 py-2 text-right font-medium text-[#666]">CTR</th>
                      <th className="px-3 py-2 text-right font-medium text-[#666]">排名</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee]">
                    {pageHistory.map((h, index) => (
                      <tr
                        key={h.batch}
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
            <strong>查看详情：</strong>点击左侧页面列表中的任意一行，右侧显示该页面的历史数据
          </li>
          <li>
            <strong>切换指标：</strong>点击图表上方的指标按钮（点击量/展示量/CTR/排名）切换查看不同数据
          </li>
          <li>
            <strong>历史趋势：</strong>折线图显示该页面在不同上传时间点的数据变化
          </li>
          <li>
            <strong>数据表格：</strong>下方表格列出所有历史记录的具体数值
          </li>
        </ul>
      </div>
    </div>
  );
}
