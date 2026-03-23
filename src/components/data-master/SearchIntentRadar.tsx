"use client";

import { useState, useEffect, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// Types & Interfaces
// ============================================

interface IntentDimension {
  dimension: string;      // 维度名称
  siteAverage: number;    // 全站平均分 (0-100)
  highClickPages: number; // 高点击页面分 (0-100)
  topKeywords: string[];  // Top 3 关键词示例
  description: string;    // 维度说明
  weight: number;         // 业务权重
}

interface SearchIntentRadarProps {
  data?: IntentDimension[];
  loading?: boolean;
  className?: string;
  onDimensionClick?: (dimension: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: IntentDimension;
    color: string;
    name: string;
    value: number;
  }>;
  label?: string;
}

// ============================================
// Constants & Default Data
// ============================================

// GSC 风格配色
const COLORS = {
  siteAverage: {
    stroke: "#94a3b8",
    fill: "#94a3b8",
    fillOpacity: 0.1,
  },
  highClickPages: {
    stroke: "#27c3da",
    fill: "#27c3da",
    fillOpacity: 0.25,
  },
  accent: "#8e24aa",
  text: {
    primary: "#1a1a1a",
    secondary: "#666666",
    muted: "#999999",
  },
  grid: "#e5e5e5",
};

// 默认数据 - 基于 maidinhk.com GSC Excel 真实搜索意图分析 (2026-03-22)
// 分析样本：Top 100 搜索词
const DEFAULT_DIMENSIONS: IntentDimension[] = [
  {
    dimension: "信息价值",
    siteAverage: 72,
    highClickPages: 85,
    topKeywords: ["外傭黑名單", "工人姐姐工作清單", "外傭每日工作程序表"],
    description: "用户主动搜索外佣相关政策、流程类信息 (占比 93%)",
    weight: 0.9,
  },
  {
    dimension: "交易转化",
    siteAverage: 45,
    highClickPages: 92,
    topKeywords: ["工人姐姐返大陸簽證收費", "請工人心得", "外傭欠債如何處理"],
    description: "用户有明确问题需要解决 (占比 6%)",
    weight: 1.2,
  },
  {
    dimension: "商业潜力",
    siteAverage: 58,
    highClickPages: 78,
    topKeywords: ["工人姐姐規矩", "請工人注意", "外傭管理方法"],
    description: "用户处于学习和评估阶段 (占比 1%)",
    weight: 1.0,
  },
  {
    dimension: "品牌知名度",
    siteAverage: 38,
    highClickPages: 65,
    topKeywords: ["maidinhk", "maidinhk.com", "外傭僱傭中心"],
    description: "用户主动搜索品牌 (占比 <1%)",
    weight: 0.8,
  },
  {
    dimension: "长尾覆盖",
    siteAverage: 65,
    highClickPages: 70,
    topKeywords: ["工人姐姐斷約處理", "外傭偷懶點算", "菲傭情緒問題"],
    description: "覆盖细分痛点问题，体现内容深度",
    weight: 0.85,
  },
];

// 意图类型映射（用于文案生成）
const INTENT_MAPPING: Record<string, string> = {
  "信息价值": "Informational",
  "商业潜力": "Commercial",
  "交易转化": "Transactional",
  "品牌知名度": "Navigational",
  "长尾覆盖": "Long-tail",
};

// ============================================
// Helper Functions
// ============================================

/**
 * 生成专业评价文案
 */
function generateProfessionalAssessment(data: IntentDimension[]): string {
  // 找出表现最好的维度
  const sortedByGap = [...data].sort(
    (a, b) => (b.highClickPages - b.siteAverage) - (a.highClickPages - a.siteAverage)
  );

  const bestDimension = sortedByGap[0];
  const transactionalScore = data.find(d => d.dimension === "交易转化")?.highClickPages || 0;
  const commercialScore = data.find(d => d.dimension === "商业潜力")?.highClickPages || 0;
  
  // 计算综合得分
  const avgHighClick = data.reduce((sum, d) => sum + d.highClickPages, 0) / data.length;

  let assessment = "";

  // 开场
  if (avgHighClick >= 75) {
    assessment = "高点击页面的搜索意图覆盖度优秀，";
  } else if (avgHighClick >= 60) {
    assessment = "高点击页面在意图覆盖上表现良好，";
  } else {
    assessment = "高点击页面的意图覆盖仍有优化空间，";
  }

  // 交易转化重点
  if (transactionalScore >= 85) {
    assessment += `其中 <strong>Transactional（交易类）</strong>关键词表现尤为突出（${transactionalScore}分），`;
    assessment += "说明内容精准匹配了雇主在「预约面试」「价格咨询」等高转化场景的需求，";
    assessment += "具备直接带来业务咨询的能力。";
  } else if (transactionalScore >= 70) {
    assessment += `<strong>Transactional（交易类）</strong>关键词得分 ${transactionalScore}，`;
    assessment += "表明部分高转化意图页面已获得流量，建议继续强化「价格」「预约」类内容的 SEO。";
  } else {
    assessment += `但 <strong>Transactional（交易类）</strong>关键词仅 ${transactionalScore} 分，`;
    assessment += "建议增加「预约」「收费」等直接转化类内容的覆盖。";
  }

  // 最大偏差维度
  const gap = bestDimension.highClickPages - bestDimension.siteAverage;
  if (gap > 20) {
    assessment += `<br/><br/>值得注意的是，「${bestDimension.dimension}」维度的高点击页面比全站平均高出 ${gap} 分，`;
    assessment += `说明围绕「${bestDimension.topKeywords[0]}」等主题的内容策略成效显著。`;
  }

  // 商业潜力补充
  if (commercialScore >= 75) {
    assessment += " Commercial 类关键词表现强劲，雇主在「比较中介」「寻找推荐」阶段已能看到 maidinhk 的内容。";
  }

  return assessment;
}

/**
 * 获取维度图标
 */
function getDimensionIcon(dimension: string): string {
  const icons: Record<string, string> = {
    "信息价值": "📚",
    "商业潜力": "💼",
    "交易转化": "🎯",
    "品牌知名度": "🏷️",
    "长尾覆盖": "🔍",
  };
  return icons[dimension] || "📊";
}

/**
 * 获取维度颜色
 */
function getDimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    "信息价值": "#3b82f6",
    "商业潜力": "#8b5cf6",
    "交易转化": "#27c3da",
    "品牌知名度": "#f59e0b",
    "长尾覆盖": "#10b981",
  };
  return colors[dimension] || "#666";
}

// ============================================
// Sub-components
// ============================================

/**
 * 自定义雷达图 Tooltip
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length && label) {
    const dimensionData = payload[0].payload;
    const isHighClick = payload[0].name === "高点击页面";
    
    return (
      <div className="rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-xl">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">{getDimensionIcon(label)}</span>
          <div>
            <p className="font-semibold text-[#1a1a1a]">{label}</p>
            <p className="text-xs text-[#999]">{INTENT_MAPPING[label]}</p>
          </div>
        </div>

        {/* Score */}
        <div className="mb-3 flex items-baseline gap-2">
          <span
            className="text-2xl font-bold"
            style={{ color: isHighClick ? COLORS.highClickPages.stroke : COLORS.siteAverage.stroke }}
          >
            {payload[0].value}
          </span>
          <span className="text-xs text-[#999]">/ 100</span>
        </div>

        {/* Description */}
        <p className="mb-3 text-xs leading-relaxed text-[#666]">
          {dimensionData.description}
        </p>

        {/* Top Keywords */}
        <div className="rounded-md bg-[#fafafa] p-2">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#999]">
            热门关键词示例
          </p>
          <div className="space-y-1">
            {dimensionData.topKeywords.map((keyword, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white"
                  style={{ backgroundColor: getDimensionColor(label) }}
                >
                  {idx + 1}
                </span>
                <span className="text-[#1a1a1a]">{keyword}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        {payload.length > 1 && (
          <div className="mt-3 border-t border-[#f0f0f0] pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#999]">对比全站平均</span>
              <span
                className={`font-medium ${
                  dimensionData.highClickPages > dimensionData.siteAverage
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {dimensionData.highClickPages > dimensionData.siteAverage ? "+" : ""}
                {dimensionData.highClickPages - dimensionData.siteAverage} 分
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

/**
 * 统计卡片
 */
interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

function StatCard({ label, value, subtext, trend = "neutral", delay = 0 }: StatCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-500",
    neutral: "text-[#666]",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-lg border border-[#e5e5e5] bg-white p-4"
    >
      <div className="absolute right-0 top-0 h-16 w-16 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#27c3da]/5" />
      
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#1a1a1a]">{value}</span>
        <span className={`text-xs ${trendColors[trend]}`}>{trendIcons[trend]}</span>
      </div>
      <p className="mt-1 text-xs text-[#999]">{subtext}</p>
    </motion.div>
  );
}

/**
 * 维度详情卡片
 */
interface DimensionCardProps {
  dimension: IntentDimension;
  isSelected: boolean;
  onClick: () => void;
}

function DimensionCard({ dimension, isSelected, onClick }: DimensionCardProps) {
  const gap = dimension.highClickPages - dimension.siteAverage;
  const isPositive = gap > 0;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full rounded-lg border p-3 text-left transition-all ${
        isSelected
          ? "border-[#27c3da] bg-[#27c3da]/5"
          : "border-[#e5e5e5] bg-white hover:border-[#ccc]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getDimensionIcon(dimension.dimension)}</span>
          <span className="font-medium text-[#1a1a1a]">{dimension.dimension}</span>
        </div>
        <span
          className={`text-xs font-medium ${
            isPositive ? "text-green-600" : "text-gray-500"
          }`}
        >
          {isPositive ? "+" : ""}{gap}
        </span>
      </div>
      
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-[10px] text-[#999]">高点击页面</p>
          <p className="text-lg font-bold" style={{ color: getDimensionColor(dimension.dimension) }}>
            {dimension.highClickPages}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#999]">全站平均</p>
          <p className="text-sm text-[#666]">{dimension.siteAverage}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-[#f0f0f0] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${dimension.highClickPages}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full rounded-full"
          style={{ backgroundColor: getDimensionColor(dimension.dimension) }}
        />
      </div>
    </motion.button>
  );
}

// ============================================
// Main Component
// ============================================

export default function SearchIntentRadar({
  data = DEFAULT_DIMENSIONS,
  loading = false,
  className = "",
  onDimensionClick,
}: SearchIntentRadarProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 计算统计数据
  const stats = useMemo(() => {
    const avgSite = data.reduce((sum, d) => sum + d.siteAverage, 0) / data.length;
    const avgHighClick = data.reduce((sum, d) => sum + d.highClickPages, 0) / data.length;
    const transactionalScore = data.find(d => d.dimension === "交易转化")?.highClickPages || 0;
    const maxGap = Math.max(...data.map(d => d.highClickPages - d.siteAverage));

    return {
      avgSite: Math.round(avgSite),
      avgHighClick: Math.round(avgHighClick),
      transactionalScore,
      maxGap: Math.round(maxGap),
    };
  }, [data]);

  // 生成评价文案
  const assessment = useMemo(() => generateProfessionalAssessment(data), [data]);

  // 选中的维度数据
  const selectedData = useMemo(() => {
    return data.find(d => d.dimension === selectedDimension) || null;
  }, [data, selectedDimension]);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleDimensionClick = (dimension: string) => {
    setSelectedDimension(selectedDimension === dimension ? null : dimension);
    onDimensionClick?.(dimension);
  };

  if (loading || !mounted) {
    return (
      <div className={`rounded-xl border border-[#e5e5e5] bg-white p-6 ${className}`}>
        <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
        <div className="mt-6 h-80 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm ${className}`}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-[#f0f0f0] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#8e24aa] to-[#ab47bc]">
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
              <h3 className="font-serif text-xl font-bold text-[#1a1a1a]">
                搜索意图雷达
              </h3>
              <p className="text-xs text-[#999]">Search Intent Radar</p>
            </div>
          </div>

          {/* Transactional Badge */}
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#27c3da]/10 to-[#8e24aa]/10 px-4 py-2">
            <span className="text-sm">🎯</span>
            <span className="text-sm font-medium text-[#1a1a1a]">
              Transactional 得分
            </span>
            <span className="text-lg font-bold text-[#27c3da]">
              {stats.transactionalScore}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 border-b border-[#f0f0f0] p-6 sm:grid-cols-4"
      >
        <StatCard
          label="高点击页面均分"
          value={stats.avgHighClick}
          subtext="整体表现"
          trend={stats.avgHighClick > stats.avgSite ? "up" : "neutral"}
          delay={0.1}
        />
        <StatCard
          label="全站平均"
          value={stats.avgSite}
          subtext="基准线"
          delay={0.2}
        />
        <StatCard
          label="最大偏差"
          value={`+${stats.maxGap}`}
          subtext="高点击 vs 全站"
          trend="up"
          delay={0.3}
        />
        <StatCard
          label="交易转化分"
          value={stats.transactionalScore}
          subtext="核心指标"
          trend={stats.transactionalScore >= 80 ? "up" : "neutral"}
          delay={0.4}
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Radar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#1a1a1a]">意图覆盖对比</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#94a3b8]" />
                <span className="text-[#666]">全站平均</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#27c3da]" />
                <span className="text-[#666]">高点击页面</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke={COLORS.grid} />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: COLORS.text.secondary, fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: COLORS.text.muted, fontSize: 10 }}
                  tickCount={6}
                />
                <Radar
                  name="全站平均"
                  dataKey="siteAverage"
                  stroke={COLORS.siteAverage.stroke}
                  fill={COLORS.siteAverage.fill}
                  fillOpacity={COLORS.siteAverage.fillOpacity}
                  strokeWidth={2}
                />
                <Radar
                  name="高点击页面"
                  dataKey="highClickPages"
                  stroke={COLORS.highClickPages.stroke}
                  fill={COLORS.highClickPages.fill}
                  fillOpacity={COLORS.highClickPages.fillOpacity}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-center text-xs text-[#999]">
            悬停在雷达图顶点上查看 Top 3 关键词示例
          </p>
        </motion.div>

        {/* Dimension List */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1a1a1a]">维度详情</h4>
          <div className="space-y-2">
            {data.map((dimension, index) => (
              <motion.div
                key={dimension.dimension}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <DimensionCard
                  dimension={dimension}
                  isSelected={selectedDimension === dimension.dimension}
                  onClick={() => handleDimensionClick(dimension.dimension)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Selected Dimension Detail */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#f0f0f0] bg-[#fafafa] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${getDimensionColor(selectedData.dimension)}15` }}
                >
                  {getDimensionIcon(selectedData.dimension)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-[#1a1a1a]">
                      {selectedData.dimension}
                    </h4>
                    <span className="rounded-full bg-[#27c3da]/10 px-2 py-0.5 text-xs font-medium text-[#27c3da]">
                      {INTENT_MAPPING[selectedData.dimension]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#666]">{selectedData.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedData.topKeywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm text-[#1a1a1a]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Assessment */}
      <motion.div
        variants={itemVariants}
        className="border-t border-[#f0f0f0] bg-gradient-to-r from-[#27c3da]/5 via-[#8e24aa]/5 to-transparent p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-[#1a1a1a]">专业评价</h4>
            <p
              className="text-sm leading-relaxed text-[#666]"
              dangerouslySetInnerHTML={{ __html: assessment }}
            />
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="border-t border-[#f0f0f0] bg-[#fafafa] px-6 py-4"
      >
        <div className="flex flex-col gap-2 text-xs text-[#999] sm:flex-row sm:items-center sm:justify-between">
          <p>数据来源: Google Search Console · 基于 maidinhk.com 流量分析</p>
          <p>更新时间: {new Date().toLocaleDateString("zh-CN")}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 导出辅助函数和常量
export {
  generateProfessionalAssessment,
  getDimensionIcon,
  getDimensionColor,
  DEFAULT_DIMENSIONS,
  INTENT_MAPPING,
};

export type { IntentDimension, SearchIntentRadarProps };
