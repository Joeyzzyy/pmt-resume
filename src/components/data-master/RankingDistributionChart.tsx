"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// Types & Interfaces
// ============================================

interface RankingData {
  range: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

interface RankingDistributionChartProps {
  data?: RankingData[];
  totalKeywords?: number;
  homepageKeywords?: number;
  loading?: boolean;
  className?: string;
  refreshKey?: number;
}

// ============================================
// Constants - GSC Style Color Palette
// ============================================

const GSC_COLORS = {
  // 主色调 - GSC 青色
  cyan: {
    DEFAULT: "#27c3da",
    light: "#5fd4e6",
    dark: "#1a9aa8",
    gradient: ["#27c3da", "#5fd4e6"],
  },
  // 辅助色 - GSC 紫色
  purple: {
    DEFAULT: "#b854c7",
    light: "#ca72d7",
    dark: "#6a1b9a",
    gradient: ["#b854c7", "#ca72d7"],
  },
  // 排名区间配色
  ranking: {
    top3: "#27c3da",      // 青色 - 最优
    top10: "#5fd4e6",     // 浅青
    top30: "#b854c7",     // 紫色
    beyond30: "#e0e0e0",  // 灰色
  },
  // 深色模式配色
  dark: {
    bg: "#1a1a2e",
    card: "#16213e",
    text: "#eaeaea",
    muted: "#a0a0a0",
    border: "#2d3748",
  },
  // 浅色模式配色
  light: {
    bg: "#ffffff",
    card: "#fafafa",
    text: "#1a1a1a",
    muted: "#a3a3a3",
    border: "#e5e5e5",
  },
};

// 真实数据 - 来自 maidinhk.com GSC (2026-04-07)
// 总计 239 个页面，其中 191 个页面 (79.9%) 位于 Google 首页
// 注：8 个页面进入 Top 5，183 个页面位于首页中部 (6-10)，首页占比近 80%
const DEFAULT_DATA: RankingData[] = [
  {
    range: "top1-5",
    label: "Top 1-5",
    count: 8,
    percentage: 3.3,
    color: GSC_COLORS.ranking.top3,
    description: "首页顶部，8个页面冲刺 Top 3",
  },
  {
    range: "top6-10",
    label: "Top 6-10",
    count: 183,
    percentage: 76.6,
    color: GSC_COLORS.ranking.top10,
    description: "首页中部，183个页面稳定获流",
  },
  {
    range: "top11-30",
    label: "Top 11-30",
    count: 46,
    percentage: 19.2,
    color: GSC_COLORS.ranking.top30,
    description: "第2-3页，46个页面潜力待挖",
  },
  {
    range: "beyond30",
    label: "31+",
    count: 2,
    percentage: 0.8,
    color: GSC_COLORS.ranking.beyond30,
    description: "第4页后，仅2个需重点优化",
  },
];

// ============================================
// Utility Functions
// ============================================

function calculateHomepageRate(data: RankingData[]): number {
  const homepageCount = data
    .filter((d) => d.range === "top1-5" || d.range === "top6-10")
    .reduce((sum, d) => sum + d.count, 0);
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return total > 0 ? Math.round((homepageCount / total) * 100) : 0;
}

function getSummaryText(total: number, homepageRate: number): string {
  if (total === 0) return "暂无排名数据";
  if (homepageRate >= 70) {
    return `当前监控 ${total} 个页面，${homepageRate}% 稳居 Google 首页（Top 10），其中 8 个页面进入 Top 5，SEO 表现优秀！`;
  } else if (homepageRate >= 50) {
    return `当前监控 ${total} 个页面，${homepageRate}% 位于 Google 首页，表现良好。`;
  } else if (homepageRate >= 30) {
    return `当前监控 ${total} 个页面，${homepageRate}% 位于 Google 首页，仍有提升空间。`;
  }
  return `当前监控 ${total} 个页面，仅 ${homepageRate}% 位于首页，建议加强优化。`;
}

function getHomepageRateColor(rate: number): string {
  if (rate >= 70) return "text-[#27c3da]";
  if (rate >= 50) return "text-[#5fd4e6]";
  if (rate >= 30) return "text-[#b854c7]";
  return "text-gray-400";
}

function getHomepageRateBg(rate: number): string {
  if (rate >= 70) return "bg-[#27c3da]/10";
  if (rate >= 50) return "bg-[#5fd4e6]/10";
  if (rate >= 30) return "bg-[#b854c7]/10";
  return "bg-[#1f1f1f]";
}

// ============================================
// Components
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  delay?: number;
}

function StatCard({ label, value, subtext, color = "#27c3da", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-lg border border-[#262626] bg-[#111] p-4 shadow-sm"
    >
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: color }}
      />
      <p className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-[#ededed]">{value}</p>
      {subtext && <p className="mt-1 text-xs text-[#999]">{subtext}</p>}
    </motion.div>
  );
}

// 自定义 Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RankingData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-[#262626] bg-[#111] p-3 shadow-lg">
        <p className="font-semibold text-[#ededed]">{data.label}</p>
        <p className="text-2xl font-bold" style={{ color: data.color }}>
          {data.count}
          <span className="ml-1 text-sm font-normal text-[#a3a3a3]">个关键词</span>
        </p>
        <p className="mt-1 text-xs text-[#a3a3a3]">{data.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-xs text-[#999]">占比 {data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
}

// 自定义柱状图 Label
interface BarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  payload?: RankingData;
}

function BarLabel({ x = 0, y = 0, width = 0, value = 0, payload }: BarLabelProps) {
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      className="fill-[#ededed] text-xs font-semibold"
    >
      {value}
    </text>
  );
}

// ============================================
// Main Component
// ============================================

export default function RankingDistributionChart({
  data = DEFAULT_DATA,
  totalKeywords: propTotal,
  homepageKeywords: propHomepage,
  loading = false,
  className = "",
  refreshKey,
}: RankingDistributionChartProps) {
  const [mounted, setMounted] = useState(false);
  const [dynamicData, setDynamicData] = useState<RankingData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听 refreshKey 变化，从 API 获取最新排名分布数据
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      fetchRankingDistribution();
    }
  }, [refreshKey]);

  async function fetchRankingDistribution() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/data-master-stats');
      const result = await response.json();
      
      // 如果 API 返回了排名分布数据，使用它
      if (result.rankingDistribution) {
        setDynamicData(result.rankingDistribution);
      }
    } catch (error) {
      console.error('获取排名分布数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 优先使用传入的 data，其次是动态获取的数据，最后是默认数据
  const displayData = data !== DEFAULT_DATA ? data : (dynamicData ?? DEFAULT_DATA);

  // 计算统计数据
  const stats = useMemo(() => {
    const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);
    const homepageCount =
      propHomepage ??
      data
        .filter((d) => d.range === "top1-5" || d.range === "top6-10")
        .reduce((sum, d) => sum + d.count, 0);
    const homepageRate = total > 0 ? Math.round((homepageCount / total) * 100) : 0;
    // Top 1-5 区间数量（冲刺 Top 3 的潜力页面）
    const top1to5Count = data.find((d) => d.range === "top1-5")?.count ?? 0;

    return {
      total,
      homepageCount,
      homepageRate,
      top1to5Count,
      top10Count: homepageCount,
    };
  }, [data, propTotal, propHomepage]);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  if (loading || isLoading || !mounted) {
    return (
      <div className={`rounded-xl border border-[#262626] bg-[#111] p-6 ${className}`}>
        <div className="h-6 w-2/3 animate-pulse rounded bg-[#333]" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-[#333]" />
        <div className="mt-8 h-64 animate-pulse rounded bg-[#1f1f1f]" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`overflow-hidden rounded-xl border border-[#262626] bg-[#111] shadow-sm ${className}`}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-[#262626] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#27c3da] to-[#5fd4e6]">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#ededed]">
                  排名分布
                </h3>
                <p className="text-xs text-[#999]">Ranking Distribution</p>
              </div>
            </div>
          </div>

          {/* 首页占有率指标 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={`flex items-center gap-3 rounded-lg px-4 py-2 ${getHomepageRateBg(stats.homepageRate)}`}
          >
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3]">
                首页占有率
              </p>
              <p className={`text-2xl font-bold ${getHomepageRateColor(stats.homepageRate)}`}>
                {stats.homepageRate}%
              </p>
            </div>
            <div className="h-8 w-px bg-[#e5e5e5]" />
            <div className="text-xs text-[#a3a3a3]">
              <p>{stats.homepageCount}</p>
              <p>/ {stats.total} 词</p>
            </div>
          </motion.div>
        </div>

        {/* 总结文案 */}
        <motion.div
          variants={itemVariants}
          className="mt-4 rounded-lg bg-[#141414] px-4 py-3"
        >
          <p className="text-sm text-[#a3a3a3]">
            <span className="mr-2">💡</span>
            {getSummaryText(stats.total, stats.homepageRate)}
          </p>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 border-b border-[#262626] p-6 sm:grid-cols-4"
      >
        <StatCard
          label="Top 1-5 页面"
          value={stats.top1to5Count}
          subtext="冲刺 Top 3"
          color={GSC_COLORS.ranking.top3}
          delay={0.1}
        />
        <StatCard
          label="TOP 10"
          value={stats.top10Count}
          subtext="首页页面"
          color={GSC_COLORS.ranking.top10}
          delay={0.2}
        />
        <StatCard
          label="总页面数"
          value={stats.total}
          subtext="监控中"
          color={GSC_COLORS.ranking.top30}
          delay={0.3}
        />
        <StatCard
          label="长尾词占比"
          value={`${100 - stats.homepageRate}%`}
          subtext="优化潜力"
          color={GSC_COLORS.ranking.beyond30}
          delay={0.4}
        />
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants} className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#ededed]">排名区间分布</h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: GSC_COLORS.ranking.top3 }}
              />
              <span className="text-[#a3a3a3]">首页顶部</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: GSC_COLORS.ranking.beyond30 }}
              />
              <span className="text-[#a3a3a3]">需优化</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-64 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 0, bottom: 20 }}
              barSize={60}
            >
              <defs>
                {/* 渐变色定义 */}
                <linearGradient id="gradientTop3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GSC_COLORS.cyan.light} />
                  <stop offset="100%" stopColor={GSC_COLORS.cyan.DEFAULT} />
                </linearGradient>
                <linearGradient id="gradientTop10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="gradientTop30" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GSC_COLORS.purple.light} />
                  <stop offset="100%" stopColor={GSC_COLORS.purple.DEFAULT} />
                </linearGradient>
                <linearGradient id="gradientBeyond" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5e5e5" />
                  <stop offset="100%" stopColor="#d4d4d4" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#262626"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                axisLine={{ stroke: "#333" }}
                tickLine={false}
                tick={{ fill: "#a3a3a3", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#999", fontSize: 11 }}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1a1a1a" }} />

              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
                animationBegin={200}
              >
                <LabelList content={<BarLabel />} />
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${
                      entry.range === "top3"
                        ? "gradientTop3"
                        : entry.range === "top4-10"
                        ? "gradientTop10"
                        : entry.range === "top11-30"
                        ? "gradientTop30"
                        : "gradientBeyond"
                    })`}
                    stroke={entry.color}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Description */}
        <motion.div
          variants={itemVariants}
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {data.map((item, index) => (
            <motion.div
              key={item.range}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-2 rounded-lg border border-[#262626] bg-[#141414] p-3"
            >
              <div
                className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#ededed]">{item.label}</p>
                <p className="text-[10px] text-[#999] truncate">{item.description}</p>
                <p className="mt-1 text-xs font-semibold" style={{ color: item.color }}>
                  {item.count} 个 ({item.percentage}%)
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="border-t border-[#262626] bg-[#141414] px-6 py-4"
      >
        <div className="flex flex-col gap-2 text-xs text-[#999] sm:flex-row sm:items-center sm:justify-between">
          <p>数据来源: Google Search Console</p>
          <p>更新时间: {new Date().toLocaleDateString("zh-CN")}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 导出辅助函数供外部使用
export {
  calculateHomepageRate,
  getSummaryText,
  getHomepageRateColor,
  GSC_COLORS,
  DEFAULT_DATA,
};
