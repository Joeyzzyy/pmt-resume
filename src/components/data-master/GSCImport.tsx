'use client';

import { useState, useRef, useEffect } from 'react';

interface ImportResult {
  success: boolean;
  message: string;
  uploadBatch?: string;
  stats?: {
    totalRecords: number;
    pageRecords: number;
    queryRecords: number;
    historyInserted: number;
    currentInserted: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
  errors?: string[];
}

interface DataStats {
  current: number;
  history: number;
  uploadLog: number;
}

interface GSCImportProps {
  onImportSuccess?: () => void;
}

export default function GSCImport({ onImportSuccess }: GSCImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取当前数据量统计
  useEffect(() => {
    if (isOpen) {
      fetchDataStats();
    }
  }, [isOpen]);

  async function fetchDataStats() {
    try {
      const response = await fetch('/api/gsc-clear');
      if (response.ok) {
        const data = await response.json();
        setDataStats(data);
      }
    } catch (err) {
      console.error('获取数据统计失败:', err);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clearExisting', clearExisting.toString());
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const response = await fetch('/api/gsc-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '导入失败');
      }

      setResult(data);
      
      // 刷新数据统计
      fetchDataStats();
      
      // 导入成功后通知父组件刷新数据
      if (data.success) {
        onImportSuccess?.();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      return;
    }

    setClearing(true);
    setError(null);

    try {
      const response = await fetch('/api/gsc-clear?confirm=true', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '清除失败');
      }

      setResult({
        success: true,
        message: `已清除所有数据：${data.cleared.current} 条当前数据，${data.cleared.history} 条历史数据`,
      });
      
      // 刷新数据统计
      setDataStats({ current: 0, history: 0, uploadLog: 0 });
      
      // 通知父组件刷新
      onImportSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError('请上传 Excel 文件 (.xlsx 或 .xls)');
    }
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  return (
    <div className="mb-8">
      {/* 触发按钮 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-sm border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          导入 GSC 数据
        </button>
        
        {/* 数据量指示器 */}
        {dataStats && (dataStats.current > 0 || dataStats.history > 0) && (
          <span className="text-xs text-[#999]">
            已有 {formatNumber(dataStats.current + dataStats.history)} 条数据
          </span>
        )}
      </div>

      {/* 导入面板 */}
      {isOpen && (
        <div className="mt-4 rounded-sm border border-[#eee] bg-white p-6">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
            导入 Google Search Console 数据
          </h3>

          {/* 数据概览卡片 */}
          {dataStats && (
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-sm bg-[#fafafa] p-3 text-center">
                <p className="text-xs text-[#999]">Performance 数据</p>
                <p className="font-serif text-lg font-bold text-[#1a1a1a]">
                  {formatNumber(dataStats.current)}
                </p>
              </div>
              <div className="rounded-sm bg-[#fafafa] p-3 text-center">
                <p className="text-xs text-[#999]">SEO 历史数据</p>
                <p className="font-serif text-lg font-bold text-[#1a1a1a]">
                  {formatNumber(dataStats.history)}
                </p>
              </div>
              <div className="rounded-sm bg-[#fafafa] p-3 text-center">
                <p className="text-xs text-[#999]">上传批次</p>
                <p className="font-serif text-lg font-bold text-[#1a1a1a]">
                  {dataStats.uploadLog}
                </p>
              </div>
            </div>
          )}

          {/* 说明 */}
          <div className="mb-4 rounded-sm bg-[#fafafa] p-4 text-sm text-[#666]">
            <p className="mb-2">
              <span className="font-medium">数据存储说明：</span>
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <strong>Performance 模块：</strong>自动覆盖同一日期的旧数据，始终显示最新状态
              </li>
              <li>
                <strong>SEO 追踪模块：</strong>保留每次上传的历史快照，用于对比优化效果
              </li>
              <li>支持从 GSC 导出 Excel 文件（.xlsx 或 .xls）</li>
              <li>系统会自动识别 Queries、Pages、Chart 等多个工作表</li>
            </ul>
          </div>

          {/* 文件上传区域 */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 cursor-pointer rounded-sm border-2 border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center transition-all hover:border-[#aaa]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <svg className="mx-auto mb-2 h-8 w-8 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {file ? (
              <div>
                <p className="font-medium text-[#1a1a1a]">{file.name}</p>
                <p className="text-xs text-[#999]">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-[#666]">点击或拖拽上传 Excel 文件</p>
                <p className="text-xs text-[#999]">支持 .xlsx, .xls 格式</p>
              </div>
            )}
          </div>

          {/* 备注输入（用于 SEO 追踪） */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#666]">
              上传备注（可选）
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：优化了首页标题和描述"
              className="w-full rounded-sm border border-[#ddd] px-3 py-2 text-sm placeholder:text-[#aaa] focus:border-[#1a1a1a] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#999]">
              备注将用于 SEO 追踪模块，帮助您识别不同批次的上传目的
            </p>
          </div>

          {/* 选项 */}
          <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#666]">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="h-4 w-4 rounded border-[#ddd]"
              />
              <span>导入时覆盖现有数据（仅 Performance 模块）</span>
            </label>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {result?.success && (
            <div className="mb-4 rounded-sm border border-green-200 bg-green-50 p-3 text-sm text-green-600">
              <p className="font-medium">{result.message}</p>
              {result.uploadBatch && (
                <>
                  <p>上传批次：{result.uploadBatch}</p>
                  {result.stats && (
                    <div className="mt-2 text-xs">
                      <p>页面数据：{result.stats.pageRecords} 条</p>
                      <p>搜索词数据：{result.stats.queryRecords} 条</p>
                      <p>日期范围：{result.dateRange?.from} 至 {result.dateRange?.to}</p>
                    </div>
                  )}
                </>
              )}
              <p className="mt-2 text-xs">页面将在 2 秒后自动刷新...</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="rounded-sm bg-[#1a1a1a] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  导入中...
                </span>
              ) : (
                '开始导入'
              )}
            </button>
            
            {/* 清除所有数据按钮 */}
            {dataStats && (dataStats.current > 0 || dataStats.history > 0) && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={clearing}
                className="rounded-sm border border-red-300 bg-white px-6 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearing ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    清除中...
                  </span>
                ) : (
                  '清除所有数据'
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-sm border border-[#ddd] bg-white px-6 py-2 text-sm font-medium text-[#666] transition-all hover:border-[#aaa] hover:text-[#1a1a1a]"
            >
              取消
            </button>
          </div>

          {/* 清除确认弹窗 */}
          {showClearConfirm && (
            <div className="mt-4 rounded-sm border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-red-800">确认清除所有数据？</p>
                  <p className="mt-1 text-sm text-red-700">
                    此操作将删除所有 Performance 数据、SEO 历史记录和上传批次，
                    <strong>不可恢复</strong>。
                  </p>
                  <p className="mt-2 text-sm text-red-700">
                    当前数据：{formatNumber(dataStats?.current || 0)} 条 Performance 数据，
                    {formatNumber(dataStats?.history || 0)} 条历史数据
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="rounded-sm bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-700"
                    >
                      确认清除
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="rounded-sm border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
