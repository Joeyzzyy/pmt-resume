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
    slug: string;
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
// Data - 基于 maidinhk.com GSC Excel 真实数据 (2026-03-22)
// ============================================

const DEFAULT_TASKS: OptimizationTask[] = [
  {
    id: "task-001",
    page: {
      url: "https://maidinhk.com/blog/minimum-wage-and-budget",
      title: "外佣最低工资与预算",
      slug: "minimum-wage-and-budget",
      currentMetrics: {
        clicks: 34,
        impressions: 10367,
        ctr: 0.3,
        position: 7.9,
      },
    },
    issue: {
      type: "high_impression_low_click",
      severity: "high",
      description: "展示量 10,367 (全站第1) 但 CTR 仅 0.3%，Title 未突出'2024最新工资标准'",
    },
    suggestion: {
      title: "Title 重构 + 数字强化",
      description: "用户搜'最低工资''人工计算'，当前 Title 缺乏吸引力和时效性",
      steps: [
        "Title 改为：外佣最低工资2024｜印傭菲傭人工計算+僱主預算全攻略",
        "Meta Description 加入'HK$4,870'具体数字和'僱主支出總覽'",
        "首段直接给出'2024年最低工資：HK$4,870/月'",
        "添加工资计算器或对比表格",
      ],
      expectedImpact: "CTR 预计从 0.3% → 3%+，点击量提升 10 倍",
    },
    status: "pending",
    createdAt: "2026-03-22",
  },
  {
    id: "task-002",
    page: {
      url: "https://maidinhk.com/blog/filipino-vs-indonesian-salary-cost",
      title: "菲佣 vs 印佣薪资成本对比",
      slug: "filipino-vs-indonesian-salary-cost",
      currentMetrics: {
        clicks: 43,
        impressions: 6737,
        ctr: 0.6,
        position: 10.5,
      },
    },
    issue: {
      type: "high_impression_low_click",
      severity: "high",
      description: "展示量 6,737 (全站第3) 但 CTR 仅 0.6%，排名卡在第二页",
    },
    suggestion: {
      title: "SERP 摘要优化 + 对比可视化",
      description: "高商业意图搜索词，但 SERP 缺乏具体对比数据吸引点击",
      steps: [
        "Title 加入具体数字：'菲傭印傭人工對比 2024｜月薪/假期/保險差異'",
        "Meta Description 强调'一表看清'、'全成本比較'",
        "添加对比表格：菲傭月薪、印傭月薪、假期差異、保險成本",
        "增加 FAQ Schema：'菲傭印傭哪個好？'",
      ],
      expectedImpact: "CTR 预计从 0.6% → 4%+，排名进入首页",
    },
    status: "pending",
    createdAt: "2026-03-22",
  },
  {
    id: "task-003",
    page: {
      url: "https://maidinhk.com/blog/visa-application-process",
      title: "签证申请流程",
      slug: "visa-application-process",
      currentMetrics: {
        clicks: 190,
        impressions: 7228,
        ctr: 2.6,
        position: 9.7,
      },
    },
    issue: {
      type: "ranking_stuck",
      severity: "medium",
      description: "点击表现不错，但排名卡在第9位，需要提升进入 Top 5",
    },
    suggestion: {
      title: "内容深度 + 内链权重",
      description: "内容质量良好但缺乏权威性引用和内部链接支持",
      steps: [
        "引用入境處最新 ID990A 表格链接 (immd.gov.hk)",
        "添加'常見拒簽原因'章节（高搜索量关键词）",
        "从'外佣雇佣指南'支柱页添加内链指向此页",
        "增加办理时间线图表",
      ],
      expectedImpact: "排名预计从 #9 → #5，点击量提升 50%",
    },
    status: "pending",
    createdAt: "2026-03-22",
  },
  {
    id: "task-004",
    page: {
      url: "https://maidinhk.com/blog/contract-renewal-procedures",
      title: "合约续约流程",
      slug: "contract-renewal-procedures",
      currentMetrics: {
        clicks: 83,
        impressions: 5011,
        ctr: 1.7,
        position: 19.2,
      },
    },
    issue: {
      type: "ranking_stuck",
      severity: "high",
      description: "排名在第 2 页 (#19)，内容未针对'續約'关键词优化",
    },
    suggestion: {
      title: "关键词重构 + 内容重组",
      description: "用户搜'續約'相关词占比高，但页面未突出此意图",
      steps: [
        "Title 改为：外傭續約完整流程｜合約到期前3個月準備事項",
        "首段增加'續約 vs 重新聘請'决策对比",
        "添加續約时间线：到期前3月、1月、到期日",
        "从'合约法规'支柱页增加内链",
      ],
      expectedImpact: "排名预计从 #19 → #10，进入首页",
    },
    status: "pending",
    createdAt: "2026-03-22",
  },
  {
    id: "task-005",
    page: {
      url: "https://maidinhk.com/blog/long-service-payment-rules",
      title: "长期服务金规定",
      slug: "long-service-payment-rules",
      currentMetrics: {
        clicks: 33,
        impressions: 3458,
        ctr: 0.9,
        position: 14.5,
      },
    },
    issue: {
      type: "low_ctr",
      severity: "medium",
      description: "CTR 0.9% 低于平均，内容专业但缺乏易懂的计算示例",
    },
    suggestion: {
      title: "添加计算示例 + 案例说明",
      description: "YMYL 内容需要更清晰的解释和官方引用",
      steps: [
        "Title 加入'計算方法'：長期服務金計算方法 2024｜外傭 LSP 完整指南",
        "添加计算示例：'假設工人姐姐工作5年，月薪$5,000...'",
        "引用勞工處官方计算器链接",
        "增加 FAQ：'解約要付長期服務金嗎？'",
      ],
      expectedImpact: "CTR 预计从 0.9% → 3%，排名提升至 Top 10",
    },
    status: "pending",
    createdAt: "2026-03-22",
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
    const change = before - after;
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
          <p className="truncate text-xs text-[#999]">/blog/{task.page.slug}</p>
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
                <MetricBadge label="展示" value={task.page.currentMetrics.impressions.toLocaleString()} />
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
        <p className="mb-4 text-sm text-[#666]">请从 GSC Excel 导出该页面优化后的最新数据：</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#666]">点击量 (Clicks)</label>
            <input
              type="number"
              value={formData.clicks}
              onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm focus:border-[#27c3da] focus:outline-none"
              placeholder="例如：120"
            />
          </div>
          <div>
            <label className="text-xs text-[#666]">展示量 (Impressions)</label>
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
            <label className="text-xs text-[#666]">平均排名 (Position)</label>
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
    const totalImpressions = tasks.reduce((sum, t) => sum + t.page.currentMetrics.impressions, 0);
    return { pending, optimized, verified, highSeverity, totalImpressions, total: tasks.length };
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
            <p className="text-xs text-[#999]">基于 GSC 数据 · 发现 → 优化 → 验证 → 追踪</p>
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
        
        <p className="mt-2 text-xs text-[#999]">
          数据源: maidinhk.com-Performance-on-Search-2026-03-22.xlsx · 
          Top 5 待优化页面总展示量: {stats.totalImpressions.toLocaleString()}
        </p>
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
          💡 提示：完成优化后点击"标记为已优化"，上传新的 GSC Excel 数据查看效果对比
        </p>
      </div>
    </div>
  );
}
