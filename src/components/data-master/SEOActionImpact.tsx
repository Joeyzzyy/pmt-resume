"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// ============================================
// Types & Interfaces
// ============================================

interface OptimizationTask {
  id: string;
  page: {
    url: string;
    title: string;
    currentMetrics: {
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    };
  };
  issue: {
    type: "low_ctr" | "high_impression_low_click" | "ranking_stuck" | "content_gap";
    severity: "high" | "medium" | "low";
    description: string;
  };
  suggestion: {
    title: string;
    description: string;
    steps: string[];
    expectedImpact: string;
  };
  status: "pending" | "in_progress" | "optimized" | "verified";
  createdAt: string;
  optimizedAt?: string;
  verifiedAt?: string;
  beforeMetrics?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  afterMetrics?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

// ============================================
// Mock Data - Top 5 待优化页面
// ============================================

const DEFAULT_TASKS: OptimizationTask[] = [
  {
    id: "task-001",
    page: {
      url: "/guides/domestic-helper-contract",
      title: "外佣合约条款详解",
      currentMetrics: {
        clicks: 45,
        impressions: 3200,
        ctr: 1.4,
        position: 8.5,
      },
    },
    issue: {
      type: "high_impression_low_click",
      severity: "high",
      description: "展示量高但 CTR 极低，Title 未匹配用户搜索意图",
    },
    suggestion: {
      title: "TDK 重构 + 意图匹配",
      description: "用户在搜'解约'而非'签约'，需要调整 Title 和 Meta Description",
      steps: [
        "分析 GSC 查询词，发现用户搜'解约'、'终止合约'占 60%",
        "Title 改为：外佣合约指南：签订、解约、续约全攻略 2024",
        "Meta Description 加入'提前终止'、'解约赔偿'关键词",
        "首段内容增加'解约流程'章节，前置到文章前 1/3",
      ],
      expectedImpact: "CTR 预计从 1.4% → 4%+，点击量提升 150%+",
    },
    status: "pending",
    createdAt: "2026-03-20",
  },
  {
    id: "task-002",
    page: {
      url: "/blog/maid-agency-fee-comparison",
      title: "女佣中介费用对比",
      currentMetrics: {
        clicks: 67,
        impressions: 2800,
        ctr: 2.4,
        position: 6.2,
      },
    },
    issue: {
      type: "low_ctr",
      severity: "high",
      description: "排名第 6 但 CTR 仅 2.4%，SERP 摘要缺乏吸引力",
    },
    suggestion: {
      title: "SERP 视觉优化 + 数字增强",
      description: "SERP 中缺乏具体数字和差异化信息，用户没有点击动力",
      steps: [
        "Title 中加入具体金额：'中介费 $8,000-$15,000 全解析'",
        "Meta Description 加入'隐藏费用清单'、'2024 最新价目'",
        "添加 Featured Image，提升 SERP 视觉吸引力",
        "在首段直接给出'平均中介费 HK$11,500'的结论",
      ],
      expectedImpact: "CTR 预计从 2.4% → 5%+，排名有望进入前 3",
    },
    status: "pending",
    createdAt: "2026-03-20",
  },
  {
    id: "task-003",
    page: {
      url: "/guides/helper-insurance",
      title: "外佣保险购买指南",
      currentMetrics: {
        clicks: 32,
        impressions: 2100,
        ctr: 1.5,
        position: 12.3,
      },
    },
    issue: {
      type: "ranking_stuck",
      severity: "medium",
      description: "排名卡在第 2 页，内容深度不足，缺乏 E-E-A-T 信号",
    },
    suggestion: {
      title: "内容深度补强 + 权威引用",
      description: "内容过于单薄，需要增加案例和数据，建立专业度",
      steps: [
        "补充'2024 年 6 大保险公司对比表'，含保费、保障范围",
        "引用香港保险业联会数据，添加 .gov.hk 法规链接",
        "增加真实案例：'雇主理赔成功经验分享'",
        "添加 FAQ Schema，争取 Rich Snippet 展示",
      ],
      expectedImpact: "排名预计从 12+ → 8-，进入首页",
    },
    status: "pending",
    createdAt: "2026-03-20",
  },
  {
    id: "task-004",
    page: {
      url: "/blog/filipino-vs-indonesian",
      title: "菲佣 vs 印佣比较",
      currentMetrics: {
        clicks: 89,
        impressions: 4500,
        ctr: 2.0,
        position: 5.8,
      },
    },
    issue: {
      type: "content_gap",
      severity: "medium",
      description: "排名好但跳出率高，用户没找到想要的对比维度",
    },
    suggestion: {
      title: "增加对比维度 + 交互表格",
      description: "现有对比维度单一，需增加薪资、语言、技能等多维度",
      steps: [
        "制作交互式对比表：薪资、语言、烹饪、照顾老人/小孩",
        "增加'性格特点'对比（基于雇主调研数据）",
        "添加视频 testimonials：真实雇主分享经验",
        "增加'选择决策树'，帮助用户快速判断适合哪种",
      ],
      expectedImpact: "停留时间预计提升 80%，转化率提升",
    },
    status: "pending",
    createdAt: "2026-03-20",
  },
  {
    id: "task-005",
    page: {
      url: "/guides/visa-renewal",
      title: "外佣签证续期流程",
      currentMetrics: {
        clicks: 56,
        impressions: 1800,
        ctr: 3.1,
        position: 9.2,
      },
    },
    issue: {
      type: "ranking_stuck",
      severity: "low",
      description: "内容质量不错但缺乏内链支持，权重不足",
    },
    suggestion: {
      title: "内链建设 + Topic Cluster 强化",
      description: "该页面是孤岛，需要从支柱页面引入权重",
      steps: [
        "在'外佣雇佣指南'支柱页添加指向此页的链接",
        "在'合约指南'页添加'续约 vs 重新签约'对比链接",
        "创建'签证专题'侧边栏导航，串联相关文章",
        "添加内部推荐：'续约后别忘了更新保险'",
      ],
      expectedImpact: "排名预计从 9 → 6，权重提升带动全站",
    },
    status: "pending",
    createdAt: "2026-03-20",
  },
];

// ============================================
// Utils
// ============================================

const getIssueTypeLabel = (type: OptimizationTask["issue"]["type"]) => {
  const labels = {
    low_ctr: "CTR 偏低",
    high_impression_low_click: "高展示低点击",
    ranking_stuck: "排名停滞",
    content_gap: "内容缺口",
  };
  return labels[type];
};

const getSeverityColor = (severity: OptimizationTask["issue"]["severity"]) => {
  const colors = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#3b82f6",
  };
  return colors[severity];
};

const calculateImprovement = (before: number, after: number, isPosition = false) => {
  if (isPosition) {
    const change = before - after; // 排名下降是正向
    const percent = ((before - after) / before) * 100;
    return { change, percent, isPositive: change > 0 };
  }
  const change = after - before;
  const percent = ((after - before) / before) * 100;
  return { change, percent, isPositive: change > 0 };
};

// ============================================
// Components
// ============================================

function MetricBadge({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-500",
    neutral: "text-[#666]",
  };

  return (
    <div className="rounded-lg bg-[#fafafa] px-3 py-2 text-center">
      <p className="text-[10px] text-[#999]">{label}</p>
      <p className={`text-lg font-bold ${trend ? trendColors[trend] : "text-[#1a1a1a]"}`}>
        {value}
        {unit && <span className="ml-0.5 text-xs">{unit}</span>}
      </p>
    </div>
  );
}

function TaskCard({
  task,
  isExpanded,
  onToggle,
  onOptimize,
  onUploadData,
}: {
  task: OptimizationTask;
  isExpanded: boolean;
  onToggle: () => void;
  onOptimize: () => void;
  onUploadData: () => void;
}) {
  const issueColor = getSeverityColor(task.issue.severity);
  const hasComparison = task.status === "verified" && task.beforeMetrics && task.afterMetrics;

  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-xl border transition-all ${
        isExpanded ? "border-[#27c3da] shadow-lg" : "border-[#e5e5e5] hover:border-[#ccc]"
      }`}
    >
      {/* Card Header */}
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left">
        {/* Rank */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0] text-sm font-bold text-[#666]">
          #{task.page.currentMetrics.position.toFixed(0)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: issueColor }}
            >
              {getIssueTypeLabel(task.issue.type)}
            </span>
            <span className="text-[10px] text-[#999]">
              {task.status === "optimized"
                ? `已优化 · ${format(new Date(task.optimizedAt || ""), "MM/dd")}`
                : task.status === "verified"
                ? `已验证 · ${format(new Date(task.verifiedAt || ""), "MM/dd")}`
                : "待优化"}
            </span>
          </div>
          <a 
            href={task.page.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-1 block truncate text-sm font-semibold text-[#1a1a1a] hover:text-[#27c3da] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {task.page.title}
          </a>
          <p className="truncate text-xs text-[#999]">{task.page.url}</p>
        </div>

        {/* Metrics Preview */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-xs text-[#999]">CTR {task.page.currentMetrics.ctr}%</p>
          <p className="text-sm font-semibold text-[#1a1a1a]">{task.page.currentMetrics.clicks} 点击</p>
        </div>

        {/* Expand Icon */}
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-[#666]">
          ▼
        </motion.span>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#f0f0f0]"
          >
            <div className="p-4">
              {/* Issue Description */}
              <div className="mb-4 rounded-lg bg-[#fef2f2] p-3">
                <p className="text-xs font-medium text-red-600">🚨 问题诊断</p>
                <p className="mt-1 text-sm text-[#666]">{task.issue.description}</p>
              </div>

              {/* Current Metrics */}
              <div className="mb-4 grid grid-cols-4 gap-2">
                <MetricBadge label="点击" value={task.page.currentMetrics.clicks} />
                <MetricBadge label="展示" value={task.page.currentMetrics.impressions} />
                <MetricBadge label="CTR" value={task.page.currentMetrics.ctr} unit="%" />
                <MetricBadge label="排名" value={`#${task.page.currentMetrics.position}`} />
              </div>

              {/* Optimization Suggestion */}
              <div className="mb-4 rounded-lg bg-[#f0f9ff] p-3">
                <p className="text-xs font-medium text-[#0277bd]">💡 优化建议：{task.suggestion.title}</p>
                <p className="mt-1 text-sm text-[#666]">{task.suggestion.description}</p>
                <div className="mt-2 space-y-1">
                  {task.suggestion.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#666]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0277bd] text-[10px] text-white">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs font-medium text-green-600">✓ {task.suggestion.expectedImpact}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {task.status === "pending" && (
                  <button
                    onClick={onOptimize}
                    className="flex-1 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333]"
                  >
                    标记为已优化
                  </button>
                )}
                {task.status === "optimized" && (
                  <button
                    onClick={onUploadData}
                    className="flex-1 rounded-lg bg-[#27c3da] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a9aa8]"
                  >
                    上传新数据对比
                  </button>
                )}
                {task.status === "verified" && hasComparison && (
                  <div className="flex-1 rounded-lg bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-600">
                    ✓ 优化效果已验证
                  </div>
                )}
              </div>

              {/* Data Comparison */}
              {hasComparison && task.beforeMetrics && task.afterMetrics && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="mb-2 text-xs font-medium text-green-700">📊 优化效果对比</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "点击", key: "clicks", isPosition: false },
                      { label: "展示", key: "impressions", isPosition: false },
                      { label: "CTR", key: "ctr", isPosition: false, unit: "%" },
                      { label: "排名", key: "position", isPosition: true },
                    ].map(({ label, key, isPosition, unit }) => {
                      const before = task.beforeMetrics![key as keyof typeof task.beforeMetrics] as number;
                      const after = task.afterMetrics![key as keyof typeof task.afterMetrics] as number;
                      const { change, percent, isPositive } = calculateImprovement(before, after, isPosition);
                      return (
                        <div key={key} className="text-center">
                          <p className="text-[10px] text-[#666]">{label}</p>
                          <p className="text-sm font-semibold text-[#1a1a1a]">
                            {before} → {after}
                            {unit}
                          </p>
                          <p className={`text-[10px] ${isPositive ? "text-green-600" : "text-red-500"}`}>
                            {isPositive ? "↑" : "↓"} {Math.abs(percent).toFixed(0)}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UploadDataModal({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { clicks: number; impressions: number; ctr: number; position: number }) => void;
}) {
  const [formData, setFormData] = useState({
    clicks: "",
    impressions: "",
    ctr: "",
    position: "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">上传优化后数据</h3>
        <p className="mb-4 text-sm text-[#666]">请输入 GSC 中该页面优化后的最新数据：</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#666]">点击量</label>
            <input
              type="number"
              value={formData.clicks}
              onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm focus:border-[#27c3da] focus:outline-none"
              placeholder="例如：120"
            />
          </div>
          <div>
            <label className="text-xs text-[#666]">展示量</label>
            <input
              type="number"
              value={formData.impressions}
              onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm focus:border-[#27c3da] focus:outline-none"
              placeholder="例如：3500"
            />
          </div>
          <div>
            <label className="text-xs text-[#666]">CTR (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.ctr}
              onChange={(e) => setFormData({ ...formData, ctr: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm focus:border-[#27c3da] focus:outline-none"
              placeholder="例如：3.4"
            />
          </div>
          <div>
            <label className="text-xs text-[#666]">平均排名</label>
            <input
              type="number"
              step="0.1"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm focus:border-[#27c3da] focus:outline-none"
              placeholder="例如：5.2"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-medium text-[#666] transition-colors hover:bg-[#f5f5f5]"
          >
            取消
          </button>
          <button
            onClick={() => {
              onUpload({
                clicks: Number(formData.clicks),
                impressions: Number(formData.impressions),
                ctr: Number(formData.ctr),
                position: Number(formData.position),
              });
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#27c3da] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a9aa8]"
          >
            确认上传
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function SEOActionImpact() {
  const [tasks, setTasks] = useState<OptimizationTask[]>(DEFAULT_TASKS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  // 统计
  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const optimized = tasks.filter((t) => t.status === "optimized").length;
    const verified = tasks.filter((t) => t.status === "verified").length;
    const highSeverity = tasks.filter((t) => t.issue.severity === "high").length;
    return { pending, optimized, verified, highSeverity, total: tasks.length };
  }, [tasks]);

  const handleOptimize = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "optimized",
              optimizedAt: new Date().toISOString(),
              beforeMetrics: { ...t.page.currentMetrics },
            }
          : t
      )
    );
  };

  const handleUploadData = (
    taskId: string,
    data: { clicks: number; impressions: number; ctr: number; position: number }
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "verified",
              verifiedAt: new Date().toISOString(),
              afterMetrics: data,
              page: { ...t.page, currentMetrics: data },
            }
          : t
      )
    );
  };

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ef4444] to-[#f59e0b]">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1a1a1a]">SEO 动作影响追踪</h3>
            <p className="text-xs text-[#999]">发现 → 优化 → 验证 → 追踪</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-[#fef2f2] p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.highSeverity}</p>
            <p className="text-[10px] text-[#666]">高优先级</p>
          </div>
          <div className="rounded-lg bg-[#f0f0f0] p-3 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">{stats.pending}</p>
            <p className="text-[10px] text-[#666]">待优化</p>
          </div>
          <div className="rounded-lg bg-[#e0f7fa] p-3 text-center">
            <p className="text-2xl font-bold text-[#27c3da]">{stats.optimized}</p>
            <p className="text-[10px] text-[#666]">已优化</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            <p className="text-[10px] text-[#666]">已验证</p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isExpanded={expandedId === task.id}
            onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
            onOptimize={() => handleOptimize(task.id)}
            onUploadData={() => setUploadingTaskId(task.id)}
          />
        ))}
      </div>

      {/* Upload Modal */}
      <UploadDataModal
        isOpen={!!uploadingTaskId}
        onClose={() => setUploadingTaskId(null)}
        onUpload={(data) => uploadingTaskId && handleUploadData(uploadingTaskId, data)}
      />

      {/* Footer */}
      <div className="mt-6 border-t border-[#f0f0f0] pt-4">
        <p className="text-xs text-[#999]">
          💡 提示：完成优化后点击"标记为已优化"，7-14 天后上传 GSC 新数据查看效果
        </p>
      </div>
    </div>
  );
}
