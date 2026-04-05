'use client';

import { useState, useEffect } from 'react';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';

interface Batch {
  upload_batch: string;
  upload_date: string;
  record_count: number;
  notes: string;
}

interface ComparisonResult {
  page: string;
  batch1: string;
  batch2: string;
  before: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  after: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  changes: {
    clicks: number;
    clicksPercent: number;
    impressions: number;
    impressionsPercent: number;
    ctr: number;
    position: number;
  };
}

interface ComparisonSummary {
  totalPages: number;
  improvedPages: number;
  declinedPages: number;
  totalClickChange: number;
}

interface SEOTrackerProps {
  refreshKey?: number;
}

export default function SEOTracker({ refreshKey }: SEOTrackerProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch1, setSelectedBatch1] = useState<string>('');
  const [selectedBatch2, setSelectedBatch2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonResult[]>([]);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取批次列表
  useEffect(() => {
    fetchBatches();
  }, [refreshKey]);

  // 当选中的批次变化时，重新对比
  useEffect(() => {
    if (selectedBatch1 && selectedBatch2) {
      compareBatches();
    }
  }, [selectedBatch1, selectedBatch2]);

  async function fetchBatches() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/seo-tracking');
      if (!response.ok) {
        throw new Error('获取批次列表失败');
      }

      const data = await response.json();
      setBatches(data.batches);

      // 默认选中最近两个批次
      if (data.batches.length >= 2) {
        setSelectedBatch1(data.batches[1]?.upload_batch || '');
        setSelectedBatch2(data.batches[0]?.upload_batch || '');
      } else if (data.batches.length === 1) {
        setSelectedBatch2(data.batches[0]?.upload_batch || '');
      }
    } catch (err) {
      console.error('Fetch batches error:', err);
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function compareBatches() {
    if (!selectedBatch1 || !selectedBatch2) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/seo-compare?batch1=${selectedBatch1}&batch2=${selectedBatch2}`
      );
      if (!response.ok) {
        throw new Error('对比数据失败');
      }

      const data = await response.json();
      setComparisonData(data.data);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Compare batches error:', err);
      setError('对比数据失败');
    } finally {
      setLoading(false);
    }
  }

  // 格式化页面 URL 显示
  function formatPageUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // 移除 /blog/ 前缀，限制长度
      const display = pathname.replace('/blog/', '').replace(/-/g, ' ');
      return display.length > 40 ? display.substring(0, 40) + '...' : display;
    } catch {
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  }

  // 格式化变化数值
  function formatChange(value: number, isPercent = false): string {
    const prefix = value > 0 ? '+' : '';
    const suffix = isPercent ? '%' : '';
    return `${prefix}${value.toFixed(isPercent ? 1 : 0)}${suffix}`;
  }

  // 获取变化的颜色类名
  function getChangeColor(value: number, isPosition = false): string {
    // 排名是越低越好，其他指标越高越好
    const isPositive = isPosition ? value < 0 : value > 0;
    return isPositive ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500';
  }

  if (loading && batches.length === 0) {
    return (
      <div className="rounded-sm border border-[#eee] bg-white p-6">
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error && batches.length === 0) {
    return (
      <div className="rounded-sm border border-[#eee] bg-white p-6">
        <div className="text-center text-red-600">{error}</div>
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
              对比不同时间段的数据变化，评估优化效果
            </p>
          </div>
        </div>

        {/* 批次选择器 */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              优化前（对比基准）
            </label>
            <select
              value={selectedBatch1}
              onChange={(e) => setSelectedBatch1(e.target.value)}
              className="w-full rounded-sm border border-[#ddd] bg-white px-3 py-2 text-sm focus:border-[#1a1a1a] focus:outline-none"
            >
              {batches.map((batch) => (
                <option key={batch.upload_batch} value={batch.upload_batch}>
                  {batch.upload_date} ({batch.upload_batch.split('-')[3] || '001'})
                  {batch.notes ? ` - ${batch.notes}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              优化后（最新数据）
            </label>
            <select
              value={selectedBatch2}
              onChange={(e) => setSelectedBatch2(e.target.value)}
              className="w-full rounded-sm border border-[#ddd] bg-white px-3 py-2 text-sm focus:border-[#1a1a1a] focus:outline-none"
            >
              {batches.map((batch) => (
                <option key={batch.upload_batch} value={batch.upload_batch}>
                  {batch.upload_date} ({batch.upload_batch.split('-')[3] || '001'})
                  {batch.notes ? ` - ${batch.notes}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 对比说明 */}
        {selectedBatch1 && selectedBatch2 && (
          <div className="mt-4 rounded-sm bg-[#fafafa] p-4">
            <p className="text-sm text-[#666]">
              正在对比：
              <span className="font-medium text-[#1a1a1a]">
                {batches.find(b => b.upload_batch === selectedBatch1)?.upload_date}
              </span>
              {' → '}
              <span className="font-medium text-[#1a1a1a]">
                {batches.find(b => b.upload_batch === selectedBatch2)?.upload_date}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* 汇总数据 */}
      {summary && (
        <div className="border-b border-[#eee] bg-[#fafafa] p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-sm bg-white p-4">
              <p className="text-xs text-[#999]">对比页面数</p>
              <p className="mt-1 font-serif text-2xl font-bold text-[#1a1a1a]">
                {summary.totalPages}
              </p>
            </div>
            <div className="rounded-sm bg-white p-4">
              <p className="text-xs text-[#999]">点击提升</p>
              <p className={`mt-1 font-serif text-2xl font-bold ${
                summary.totalClickChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.totalClickChange >= 0 ? '+' : ''}{summary.totalClickChange}
              </p>
            </div>
            <div className="rounded-sm bg-white p-4">
              <p className="text-xs text-[#999]">表现提升页面</p>
              <p className="mt-1 font-serif text-2xl font-bold text-green-600">
                {summary.improvedPages}
              </p>
            </div>
            <div className="rounded-sm bg-white p-4">
              <p className="text-xs text-[#999]">表现下降页面</p>
              <p className="mt-1 font-serif text-2xl font-bold text-red-600">
                {summary.declinedPages}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 对比表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fafafa]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[#666]">页面</th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">
                点击变化
              </th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">
                展示变化
              </th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">
                排名变化
              </th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">
                优化前
              </th>
              <th className="px-4 py-3 text-right font-medium text-[#666]">
                优化后
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            {comparisonData.map((row, index) => (
              <tr key={row.page} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                <td className="px-4 py-3">
                  <div className="max-w-[200px] truncate" title={row.page}>
                    {formatPageUrl(row.page)}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={getChangeColor(row.changes.clicks)}>
                    {formatChange(row.changes.clicks)}
                    <span className="ml-1 text-xs">
                      ({formatChange(row.changes.clicksPercent, true)})
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={getChangeColor(row.changes.impressions)}>
                    {formatChange(row.changes.impressions)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={getChangeColor(row.changes.position, true)}>
                    {row.changes.position > 0 ? '↓' : row.changes.position < 0 ? '↑' : ''}
                    {Math.abs(row.changes.position).toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[#888]">
                  <div className="text-xs">
                    <div>{row.before.clicks} 点击</div>
                    <div>排名 {row.before.position.toFixed(1)}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[#1a1a1a]">
                  <div className="text-xs">
                    <div className="font-medium">{row.after.clicks} 点击</div>
                    <div>排名 {row.after.position.toFixed(1)}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {comparisonData.length === 0 && !loading && (
        <div className="p-12 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0]">
            <svg className="h-6 w-6 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[#666]">暂无对比数据</p>
          <p className="mt-1 text-xs text-[#999]">
            请上传至少两个不同时间点的 GSC 数据
          </p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="border-t border-[#eee] bg-[#fafafa] p-6">
        <h4 className="mb-3 text-sm font-semibold text-[#1a1a1a]">💡 使用说明</h4>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
          <li>
            <strong>对比原理：</strong>选择两个上传批次，系统会对比同一页面在两次上传时的数据差异
          </li>
          <li>
            <strong>优化前：</strong>建议选择在执行 SEO 优化动作之前上传的数据批次
          </li>
          <li>
            <strong>优化后：</strong>建议在优化完成后，等待 1-2 周再上传新数据，让搜索引擎有足够时间反应
          </li>
          <li>
            <strong>排名变化：</strong>↓ 表示排名下降（变好），↑ 表示排名上升（变差）
          </li>
        </ul>
      </div>
    </div>
  );
}
