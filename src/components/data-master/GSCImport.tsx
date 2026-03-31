'use client';

import { useState, useRef } from 'react';

interface ImportResult {
  success: boolean;
  message: string;
  totalRecords?: number;
  insertedRecords?: number;
  dateRange?: {
    from: string;
    to: string;
  };
  uniqueDates?: number;
  errors?: string[];
}

interface GSCImportProps {
  onImportSuccess?: () => void;
}

export default function GSCImport({ onImportSuccess }: GSCImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const response = await fetch('/api/gsc-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '导入失败');
      }

      setResult(data);
      
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

  return (
    <div className="mb-8">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-sm border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        导入 GSC 数据
      </button>

      {/* 导入面板 */}
      {isOpen && (
        <div className="mt-4 rounded-sm border border-[#eee] bg-white p-6">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
            导入 Google Search Console 数据
          </h3>

          {/* 说明 */}
          <div className="mb-4 rounded-sm bg-[#fafafa] p-4 text-sm text-[#666]">
            <p className="mb-2">
              <span className="font-medium">使用说明：</span>
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>从 GSC 导出 Excel 文件（.xlsx 或 .xls）</li>
              <li>系统会自动识别重复数据并覆盖</li>
              <li>支持按日期自动去重，同一天的数据会被新上传的覆盖</li>
              <li>如需清空所有历史数据，请勾选&quot;清空现有数据&quot;</li>
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

          {/* 选项 */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-[#666]">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="h-4 w-4 rounded border-[#ddd]"
              />
              <span>清空现有数据（谨慎使用）</span>
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
              <p className="font-medium">导入成功！</p>
              <p>共导入 {result.insertedRecords} 条记录</p>
              <p>日期范围: {result.dateRange?.from} 到 {result.dateRange?.to}</p>
              <p className="mt-2 text-xs">页面将在 2 秒后自动刷新...</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
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
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-sm border border-[#ddd] bg-white px-6 py-2 text-sm font-medium text-[#666] transition-all hover:border-[#aaa] hover:text-[#1a1a1a]"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
