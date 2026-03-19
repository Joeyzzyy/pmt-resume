"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-[#ddd] border-t-[#1a1a1a]`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        {spinner}
        {text && (
          <p className="mt-4 text-sm text-[#666] animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {spinner}
      {text && <p className="mt-3 text-sm text-[#888]">{text}</p>}
    </div>
  );
}

// 表格/区块加载遮罩
export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-sm">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ddd] border-t-[#1a1a1a]" />
      {text && <p className="mt-3 text-sm text-[#666]">{text}</p>}
    </div>
  );
}

// 骨架屏 - 用于表格
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {/* 表头骨架 */}
      <div className="flex gap-4 border-b border-[#eee] bg-[#fafafa] px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-[#e0e0e0]" />
        ))}
      </div>
      {/* 行骨架 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b border-[#f0f0f0] px-4 py-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 rounded bg-[#f0f0f0]"
              style={{ flex: colIndex === 0 ? 2 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-sm border border-[#eee] bg-white p-6">
          <div className="h-3 w-20 rounded bg-[#e0e0e0]" />
          <div className="mt-4 h-8 w-24 rounded bg-[#f0f0f0]" />
          <div className="mt-3 h-3 w-16 rounded bg-[#f0f0f0]" />
        </div>
      ))}
    </div>
  );
}

// 图表骨架屏
export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-sm border border-[#eee] bg-white p-6">
      {/* 标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-4 w-32 rounded bg-[#e0e0e0]" />
          <div className="mt-2 h-3 w-24 rounded bg-[#f0f0f0]" />
        </div>
        <div className="h-8 w-48 rounded bg-[#f0f0f0]" />
      </div>
      {/* 统计卡片 */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded bg-[#fafafa] p-4">
            <div className="h-3 w-16 rounded bg-[#e0e0e0]" />
            <div className="mt-2 h-6 w-20 rounded bg-[#f0f0f0]" />
          </div>
        ))}
      </div>
      {/* 图表区域 */}
      <div className="h-96 rounded bg-[#fafafa]">
        <svg className="h-full w-full" viewBox="0 0 800 300" preserveAspectRatio="none">
          <path
            d="M0,250 Q100,200 200,220 T400,180 T600,200 T800,150"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="2"
          />
          <path
            d="M0,200 Q100,150 200,180 T400,120 T600,150 T800,100"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
