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
  const [inputBatch1, setInputBatch1] = useState<string>('');
  const [inputBatch2, setInputBatch2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonResult[]>([]);
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // 获取批次列表
  useEffect(() => {
    fetchBatches();
  }, [refreshKey]);

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

      // 默认填入最近两个批次
      if (data.batches.length >= 2) {
        setInputBatch1(extractDateFromBatch(data.batches[1]?.upload_batch || ''));
        setInputBatch2(extractDateFromBatch(data.batches[0]?.upload_batch || ''));
      } else if (data.batches.length === 1) {
        setInputBatch2(extractDateFromBatch(data.batches[0]?.upload_batch || ''));
      }
    } catch (err) {
      console.error('Fetch batches error:', err);
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  }

  // 从批次号提取日期（支持 2026-03-22 或 2026-03-22-001）
  function extractDateFromBatch(batch: string): string {
    // 如果已经是 YYYY-MM-DD 格式（10个字符）
    if (/^\d{4}-\d{2}-\d{2}$/.test(batch)) {
      return batch;
    }
    // 如果是 YYYY-MM-DD-NNN 格式，提取日期部分
    const match = batch.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : batch;
  }

  // 标准化批次号（确保后端能识别）
  function normalizeBatch(input: string): string {
    const trimmed = input.trim();
    // 如果用户输入的是纯日期，尝试匹配历史批次
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      // 查找该日期对应的完整批次号
      const matched = batches.find(b => b.upload_batch.startsWith(trimmed));
      return matched ? matched.upload_batch : trimmed;
    }
    return trimmed;
  }

  async function handleCompare() {
    if (!inputBatch1.trim() || !inputBatch2.trim()) {
      setError('请输入两个日期');
      return;
    }

    if (inputBatch1.trim() === inputBatch2.trim()) {
      setError('两个日期不能相同');
      return;
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inputBatch1.trim()) || !dateRegex.test(inputBatch2.trim())) {
      setError('日期格式错误，请使用 YYYY-MM-DD 格式（如 2026-03-22）');
      return;
    }

    const batch1 = normalizeBatch(inputBatch1);
    const batch2 = normalizeBatch(inputBatch2);
    await compareBatches(batch1, batch2);
  }

  async function compareBatches(batch1: string, batch2: string) {
    try {
      setCompareLoading(true);
      setError(null);

      const response = await fetch(
        `/api/seo-compare?batch1=${encodeURIComponent(batch1)}&batch2=${encodeURIComponent(batch2)}`
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '对比数据失败');
      }

      const data = await response.json();
      setComparisonData(data.data);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Compare batches error:', err);
      setError((err as Error).message || '对比数据失败');
    } finally {
      setCompareLoading(false);
    }
  }

  // 点击历史批次快速填入
  function selectBatch(batch: string, position: 'before' | 'after') {
    const dateStr = extractDateFromBatch(batch);
    if (position === 'before') {
      setInputBatch1(dateStr);
    } else {
      setInputBatch2(dateStr);
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

  // 格式化批次标签显示
  function formatBatchLabel(batch: Batch): string {
    const date = batch.upload_date;
    const notes = batch.notes ? ` · ${batch.notes}` : '';
    const records = batch.record_count > 0 ? ` (${batch.record_count}条)` : '';
    return `${date}${records}${notes}`;
  }

  if (loading && batches.length === 0) {
    return (
      <div className="rounded-sm border border-[#eee] bg-white p-6">
        <CardSkeleton count={3} />
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
              输入上传日期对比不同时间段的数据变化，评估优化效果
            </p>
          </div>
        </div>

        {/* 批次输入区域 */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              优化前（对比基准）
            </label>
            <input
              type="text"
              value={inputBatch1}
              onChange={(e) => setInputBatch1(e.target.value)}
              placeholder="2026-03-15"
              className="w-full rounded-sm border border-[#ddd] bg-white px-3 py-2 text-sm placeholder:text-[#aaa] focus:border-[#1a1a1a] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#999]">
              格式：YYYY-MM-DD（上传数据的日期）
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#666]">
              优化后（最新数据）
            </label>
            <input
              type="text"
              value={inputBatch2}
              onChange={(e) => setInputBatch2(e.target.value)}
              placeholder="2026-03-22"
              className="w-full rounded-sm border border-[#ddd] bg-white px-3 py-2 text-sm placeholder:text-[#aaa] focus:border-[#1a1a1a] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#999]">
              格式：YYYY-MM-DD（上传数据的日期）
            </p>
          </div>
        </div>

        {/* 对比按钮 */}
        <div className="mt-4">
          <button
            onClick={handleCompare}
            disabled={compareLoading || !inputBatch1.trim() || !inputBatch2.trim()}
            className="rounded-sm bg-[#1a1a1a] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {compareLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                对比中...
              </span>
            ) : (
              '开始对比'
            )}
          </button>
        </div>

        {/* 历史批次参考 */}
        {batches.length > 0 && (
          <div className="mt-6 rounded-sm bg-[#fafafa] p-4">
            <p className="mb-3 text-sm font-medium text-[#666]">📋 上传历史（点击快速填入日期）</p>
            <div className="flex flex-wrap gap-2">
              {batches.slice(0, 10).map((batch) => (
                <div key={batch.upload_batch} className="flex items-center gap-1">
                  <button
                    onClick={() => selectBatch(batch.upload_batch, 'before')}
                    className="rounded-sm border border-[#ddd] bg-white px-2 py-1 text-xs text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                    title={`设为优化前：${extractDateFromBatch(batch.upload_batch)}`}
                  >
                    ←
                  </button>
                  <span className="rounded-sm bg-white px-3 py-1 text-xs text-[#666]">
                    {formatBatchLabel(batch)}
                  </span>
                  <button
                    onClick={() => selectBatch(batch.upload_batch, 'after')}
                    className="rounded-sm border border-[#ddd] bg-white px-2 py-1 text-xs text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                    title={`设为优化后：${extractDateFromBatch(batch.upload_batch)}`}
                  >
                    →
                  </button>
                </div>
              ))}
            </div>
            {batches.length > 10 && (
              <p className="mt-2 text-xs text-[#999]">
                还有 {batches.length - 10} 个历史记录...
              </p>
            )}
          </div>
        )}

        {/* 对比说明 */}
        {inputBatch1 && inputBatch2 && (
          <div className="mt-4 rounded-sm border border-[#eee] bg-white p-4">
            <p className="text-sm text-[#666]">
              即将对比：
              <span className="font-medium text-[#1a1a1a]">{inputBatch1}</span>
              {' → '}
              <span className="font-medium text-[#1a1a1a]">{inputBatch2}</span>
            </p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
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
      {comparisonData.length > 0 && (
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
      )}

      {/* 空状态 */}
      {comparisonData.length === 0 && !compareLoading && !loading && (
        <div className="p-12 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0]">
            <svg className="h-6 w-6 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[#666]">请输入上传日期开始对比</p>
          <p className="mt-1 text-xs text-[#999]">
            格式：YYYY-MM-DD（如 2026-03-22）
          </p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="border-t border-[#eee] bg-[#fafafa] p-6">
        <h4 className="mb-3 text-sm font-semibold text-[#1a1a1a]">💡 使用说明</h4>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[#666]">
          <li>
            <strong>日期格式：</strong>使用上传数据时的日期（YYYY-MM-DD），如 2026-03-22
          </li>
          <li>
            <strong>快速填入：</strong>点击历史记录旁的 ← 填入"优化前"，→ 填入"优化后"
          </li>
          <li>
            <strong>优化前：</strong>选择执行 SEO 优化动作之前的上传日期作为基准
          </li>
          <li>
            <strong>优化后：</strong>建议在优化完成后 1-2 周再上传新数据，然后使用该日期
          </li>
          <li>
            <strong>排名变化：</strong>↓ 表示排名下降（变好），↑ 表示排名上升（变差）
          </li>
        </ul>
      </div>
    </div>
  );
}
