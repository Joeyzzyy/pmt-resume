"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// Types
// ============================================

interface ContentCluster {
  id: string;
  title: string;
  url: string;
  clicks: number;
  position: number;
  impressions: number;
  ctr: number;
  topQueries: {
    query: string;
    clicks: number;
    position: number;
  }[];
  color: string;
  angle: number;
  category: "core" | "longtail";
  pillarContent?: string;
}

// ============================================
// Data - maidinhk.com 实际内容集群 (15个主题)
// ============================================

const MAIDINHK_CLUSTERS: ContentCluster[] = [
  // 核心支柱页面 (Pillar Pages) - 内圈
  {
    id: "hiring-guide",
    title: "外佣雇佣指南",
    url: "/guides/domestic-helper-hiring",
    clicks: 342,
    position: 3.2,
    impressions: 8900,
    ctr: 3.8,
    color: "#27c3da",
    angle: 0,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "如何請外傭", clicks: 89, position: 2.1 },
      { query: "請工人姐姐流程", clicks: 76, position: 3.5 },
      { query: "外傭中介推薦", clicks: 67, position: 4.2 },
      { query: "聘請外傭手續", clicks: 54, position: 5.1 },
      { query: "first time hire maid hk", clicks: 43, position: 6.8 },
    ],
  },
  {
    id: "salary-cost",
    title: "外佣薪资费用",
    url: "/guides/domestic-helper-salary",
    clicks: 289,
    position: 2.8,
    impressions: 7200,
    ctr: 4.0,
    color: "#27c3da",
    angle: 51.4,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "外傭最低工資2024", clicks: 98, position: 1.5 },
      { query: "請工人姐姐幾錢", clicks: 87, position: 2.3 },
      { query: "外傭人工計算", clicks: 54, position: 4.8 },
      { query: "菲傭印傭薪金分別", clicks: 32, position: 6.5 },
      { query: "maid salary hong kong", clicks: 18, position: 8.2 },
    ],
  },
  {
    id: "contract-law",
    title: "合约与法规",
    url: "/guides/contract-law",
    clicks: 267,
    position: 4.5,
    impressions: 6500,
    ctr: 4.1,
    color: "#27c3da",
    angle: 102.8,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "外傭合約條款", clicks: 76, position: 3.8 },
      { query: "標準僱傭合約", clicks: 65, position: 5.2 },
      { query: "外傭勞工法例", clicks: 54, position: 6.1 },
      { query: "合約解約手續", clicks: 43, position: 7.5 },
      { query: "foreign domestic helper contract", clicks: 29, position: 9.2 },
    ],
  },
  {
    id: "visa-application",
    title: "签证申请流程",
    url: "/guides/visa-application",
    clicks: 198,
    position: 5.8,
    impressions: 4800,
    ctr: 4.1,
    color: "#27c3da",
    angle: 154.2,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "外傭簽證申請", clicks: 65, position: 4.5 },
      { query: "id990a表格", clicks: 54, position: 6.2 },
      { query: "工人姐姐簽證續期", clicks: 43, position: 7.8 },
      { query: "外傭工作簽證", clicks: 32, position: 9.1 },
      { query: "helper visa extension", clicks: 21, position: 11.5 },
    ],
  },
  {
    id: "agency-comparison",
    title: "中介比较评测",
    url: "/reviews/agency-comparison",
    clicks: 245,
    position: 6.2,
    impressions: 5800,
    ctr: 4.2,
    color: "#27c3da",
    angle: 205.6,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "女傭中介邊間好", clicks: 87, position: 4.8 },
      { query: "外傭中介比較", clicks: 76, position: 6.1 },
      { query: "印傭中介推薦", clicks: 54, position: 7.5 },
      { query: "maid agency hong kong", clicks: 32, position: 9.8 },
      { query: "best helper agency hk", clicks: 21, position: 12.3 },
    ],
  },
  {
    id: "interview-tips",
    title: "面试技巧指南",
    url: "/guides/interview-tips",
    clicks: 178,
    position: 5.5,
    impressions: 4200,
    ctr: 4.2,
    color: "#27c3da",
    angle: 257,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "外傭面試問題", clicks: 54, position: 4.2 },
      { query: "菲傭面試要問什麼", clicks: 43, position: 5.8 },
      { query: "印傭面試技巧", clicks: 32, position: 7.5 },
      { query: "maid interview questions", clicks: 21, position: 9.2 },
      { query: "面試外傭注意事項", clicks: 18, position: 10.8 },
    ],
  },
  {
    id: "daily-management",
    title: "日常管理指南",
    url: "/guides/daily-management",
    clicks: 156,
    position: 7.2,
    impressions: 3800,
    ctr: 4.1,
    color: "#27c3da",
    angle: 308.4,
    category: "core",
    pillarContent: "Pillar Page",
    topQueries: [
      { query: "外傭管理方法", clicks: 43, position: 5.5 },
      { query: "工人姐姐放假安排", clicks: 32, position: 7.2 },
      { query: "外傭手機使用", clicks: 21, position: 8.8 },
      { query: "helper day off rules", clicks: 18, position: 10.5 },
      { query: "外傭工作表現評估", clicks: 15, position: 12.1 },
    ],
  },

  // 长尾集群内容 (Cluster Content) - 外圈
  {
    id: "renewal-process",
    title: "外佣续约流程",
    url: "/blog/foreign-helper-renewal",
    clicks: 234,
    position: 3.5,
    impressions: 5200,
    ctr: 4.5,
    color: "#8e24aa",
    angle: 25.7,
    category: "longtail",
    topQueries: [
      { query: "外傭續約流程", clicks: 76, position: 2.8 },
      { query: "菲傭續約手續", clicks: 54, position: 4.2 },
      { query: "印傭續約費用", clicks: 43, position: 5.5 },
      { query: "contract renewal helper", clicks: 32, position: 7.1 },
      { query: "外傭續約幾時開始", clicks: 29, position: 8.8 },
    ],
  },
  {
    id: "insurance-guide",
    title: "外佣保险指南",
    url: "/guides/helper-insurance",
    clicks: 189,
    position: 6.8,
    impressions: 4100,
    ctr: 4.6,
    color: "#8e24aa",
    angle: 77.1,
    category: "longtail",
    topQueries: [
      { query: "外傭保險比較", clicks: 65, position: 5.2 },
      { query: "工人姐姐保險", clicks: 54, position: 6.8 },
      { query: "外傭保險邊間好", clicks: 32, position: 8.5 },
      { query: "helper insurance hk", clicks: 21, position: 10.2 },
      { query: "外傭保險價錢", clicks: 17, position: 12.5 },
    ],
  },
  {
    id: "termination-guide",
    title: "解约处理指南",
    url: "/guides/contract-termination",
    clicks: 167,
    position: 7.5,
    impressions: 3600,
    ctr: 4.6,
    color: "#8e24aa",
    angle: 128.5,
    category: "longtail",
    topQueries: [
      { query: "外傭解約手續", clicks: 54, position: 5.8 },
      { query: "提前解約賠償", clicks: 43, position: 7.2 },
      { query: "外傭斷約處理", clicks: 32, position: 8.8 },
      { query: "termination of contract", clicks: 21, position: 10.5 },
      { query: "外傭辭工通知期", clicks: 17, position: 12.8 },
    ],
  },
  {
    id: "filipino-vs-indonesian",
    title: "菲佣vs印佣",
    url: "/blog/filipino-vs-indonesian-helpers",
    clicks: 212,
    position: 4.8,
    impressions: 4900,
    ctr: 4.3,
    color: "#8e24aa",
    angle: 180,
    category: "longtail",
    topQueries: [
      { query: "菲傭印傭比較", clicks: 76, position: 3.5 },
      { query: "菲律賓女傭特點", clicks: 54, position: 5.2 },
      { query: "印尼女傭好唔好", clicks: 43, position: 6.8 },
      { query: "filipino vs indonesian maid", clicks: 32, position: 8.5 },
      { query: "菲傭印傭薪金分別", clicks: 21, position: 10.2 },
    ],
  },
  {
    id: "first-week-guide",
    title: "到港首周安排",
    url: "/blog/first-week-guide",
    clicks: 145,
    position: 8.2,
    impressions: 3200,
    ctr: 4.5,
    color: "#8e24aa",
    angle: 231.4,
    category: "longtail",
    topQueries: [
      { query: "外傭到港安排", clicks: 43, position: 6.5 },
      { query: "新外傭第一週", clicks: 32, position: 8.1 },
      { query: "工人姐姐適應期", clicks: 21, position: 9.8 },
      { query: "new helper first week", clicks: 18, position: 11.5 },
      { query: "外傭培訓方法", clicks: 15, position: 13.2 },
    ],
  },
  {
    id: "problem-solving",
    title: "常见问题处理",
    url: "/blog/common-problems",
    clicks: 198,
    position: 6.5,
    impressions: 4500,
    ctr: 4.4,
    color: "#8e24aa",
    angle: 282.8,
    category: "longtail",
    topQueries: [
      { query: "外傭偷懶點算", clicks: 54, position: 5.2 },
      { query: "工人姐姐情緒問題", clicks: 43, position: 6.8 },
      { query: "外傭工作效率低", clicks: 32, position: 8.5 },
      { query: "helper performance issues", clicks: 21, position: 10.1 },
      { query: "外傭想換雇主", clicks: 18, position: 11.8 },
    ],
  },
  {
    id: "rest-day-rules",
    title: "休息日规定",
    url: "/guides/rest-day-rules",
    clicks: 134,
    position: 9.1,
    impressions: 2900,
    ctr: 4.6,
    color: "#8e24aa",
    angle: 334.2,
    category: "longtail",
    topQueries: [
      { query: "外傭法定假期", clicks: 43, position: 6.8 },
      { query: "外傭年假幾多天", clicks: 32, position: 8.5 },
      { query: "工人姐姐放假安排", clicks: 21, position: 10.2 },
      { query: "helper rest day rules", clicks: 18, position: 11.8 },
      { query: "外傭公眾假期表", clicks: 15, position: 13.5 },
    ],
  },
];

// ============================================
// Constants
// ============================================

const CATEGORY_CONFIG = {
  core: { label: "支柱页面", color: "#27c3da", bg: "#e0f7fa" },
  longtail: { label: "集群内容", color: "#8e24aa", bg: "#f3e5f5" },
};

// ============================================
// Components
// ============================================

function CentralNode() {
  return (
    <motion.div
      className="relative z-20 flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] shadow-2xl"
      whileHover={{ scale: 1.05 }}
      animate={{
        boxShadow: [
          "0 0 20px rgba(39, 195, 218, 0.2)",
          "0 0 40px rgba(39, 195, 218, 0.4)",
          "0 0 20px rgba(39, 195, 218, 0.2)",
        ],
      }}
      transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
    >
      <span className="text-3xl">🏠</span>
      <span className="mt-1 text-center text-[10px] font-bold leading-tight text-white">
        maidinhk.com
        <br />
        外佣雇主指南
      </span>
    </motion.div>
  );
}

function ClusterCard({
  cluster,
  isSelected,
  onClick,
  x,
  y,
}: {
  cluster: ContentCluster;
  isSelected: boolean;
  onClick: () => void;
  x: number;
  y: number;
}) {
  const config = CATEGORY_CONFIG[cluster.category];

  return (
    <motion.div
      className={`absolute z-30 w-36 cursor-pointer rounded-xl border bg-white p-3 shadow-lg transition-all ${
        isSelected
          ? "border-[#27c3da] shadow-xl shadow-[#27c3da]/20"
          : "border-[#e5e5e5] hover:border-[#27c3da]/50"
      }`}
      style={{
        left: `calc(50% + ${x}px - 72px)`,
        top: `calc(50% + ${y}px - 40px)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08, zIndex: 40 }}
      onClick={onClick}
    >
      {/* 排名徽章 */}
      <div
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{
          backgroundColor: cluster.position <= 5 ? "#27c3da" : config.color,
        }}
      >
        {cluster.position <= 5 ? "★" : cluster.position.toFixed(0)}
      </div>

      {/* 分类标签 */}
      <div
        className="mb-1 inline-block rounded px-1.5 py-0.5 text-[8px] font-medium"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {cluster.pillarContent || config.label}
      </div>

      {/* 标题 */}
      <h4 className="truncate text-xs font-semibold text-[#1a1a1a]">{cluster.title}</h4>

      {/* 指标 */}
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="text-[#27c3da]">{cluster.clicks} 点击</span>
        <span style={{ color: config.color }}>#{cluster.position}</span>
      </div>
    </motion.div>
  );
}

function ConnectionLine({
  angle,
  length,
  delay,
  isActive,
  color,
}: {
  angle: number;
  length: number;
  delay: number;
  isActive: boolean;
  color: string;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 z-10 h-px origin-left"
      style={{
        width: length,
        transform: `rotate(${angle}deg)`,
        background: isActive
          ? `linear-gradient(90deg, #27c3da 0%, ${color} 100%)`
          : "linear-gradient(90deg, #e5e5e5 0%, #d0d0d0 100%)",
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: isActive
            ? `linear-gradient(90deg, transparent 0%, rgba(39, 195, 218, 0.8) 50%, transparent 100%)`
            : "linear-gradient(90deg, transparent 0%, rgba(200, 200, 200, 0.5) 50%, transparent 100%)",
          width: "30%",
        }}
        animate={{ left: ["-30%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, delay, ease: "linear" }}
      />
    </div>
  );
}

function ClusterDetailPanel({
  cluster,
  onClose,
}: {
  cluster: ContentCluster;
  onClose: () => void;
}) {
  const config = CATEGORY_CONFIG[cluster.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-50 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: config.bg }}>
            <span className="text-sm">🔍</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a]">{cluster.title}</h4>
            <p className="text-[10px] text-[#999]">
              {cluster.pillarContent || config.label} · CTR {cluster.ctr}%
            </p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666]">
          ✕
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[#fafafa] p-2 text-center">
          <p className="text-lg font-bold text-[#27c3da]">{cluster.clicks}</p>
          <p className="text-[9px] text-[#999]">点击</p>
        </div>
        <div className="rounded-lg bg-[#fafafa] p-2 text-center">
          <p className="text-lg font-bold text-[#8e24aa]">{cluster.impressions.toLocaleString()}</p>
          <p className="text-[9px] text-[#999]">展示</p>
        </div>
        <div className="rounded-lg bg-[#fafafa] p-2 text-center">
          <p className="text-lg font-bold text-[#1a1a1a]">#{cluster.position}</p>
          <p className="text-[9px] text-[#999]">排名</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-[#666]">Top 5 搜索词</p>
        {cluster.topQueries.map((query, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg bg-[#fafafa] px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: config.color }}
              >
                {idx + 1}
              </span>
              <span className="text-xs text-[#1a1a1a]">{query.query}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-[#27c3da]">{query.clicks} 点击</span>
              <span style={{ color: config.color }}>#{query.position}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TechnicalNote() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-gradient-to-r from-[#fafafa] to-white p-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-semibold text-[#1a1a1a]">内链权重传递机制</span>
        </div>
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-[#666]">
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-[#f0f0f0] pt-4 text-sm text-[#666]">
              <p>
                <strong className="text-[#1a1a1a]">Topic Cluster 架构：</strong>
                maidinhk.com 采用 7+8 双层集群架构。内圈 7 个支柱页面（Pillar Pages）覆盖外佣雇佣的核心主题，
                外圈 8 个长尾集群内容深入细分话题。
              </p>
              <p>
                <strong className="text-[#1a1a1a]">权重传导路径：</strong>
                所有集群内容通过 next/link 反向链接至支柱页面，支柱页面聚合链接至各集群内容，
                形成双向权重循环，实现 100% 链接权重传递。
              </p>
              <p>
                <strong className="text-[#1a1a1a]">搜索入口封锁：</strong>
                通过覆盖外佣雇佣全链路的关键词（从"如何请外佣"到"外佣解约处理"），
                构建完整的主题权威度，封锁垂直领域搜索入口。
              </p>
              <div className="rounded-lg bg-[#1a1a2e] p-3 font-mono text-xs text-gray-300">
                <span className="text-[#27c3da]">// 支柱页面向集群内容传递权重</span>
                <br />
                &lt;Link href=&quot;/guides/domestic-helper-salary&quot; prefetch&gt;
                <br />
                &nbsp;&nbsp;&lt;a hrefLang=&quot;zh-HK&quot; rel=&quot;tag&quot;&gt;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;查看外佣薪资详细指南 →
                <br />
                &nbsp;&nbsp;&lt;/a&gt;
                <br />
                &lt;/Link&gt;
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function TopicClusterVisualization() {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 统计数据
  const stats = useMemo(() => {
    const totalClicks = MAIDINHK_CLUSTERS.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = MAIDINHK_CLUSTERS.reduce((sum, c) => sum + c.impressions, 0);
    const avgPosition = MAIDINHK_CLUSTERS.reduce((sum, c) => sum + c.position, 0) / MAIDINHK_CLUSTERS.length;
    const top5Count = MAIDINHK_CLUSTERS.filter((c) => c.position <= 5).length;
    const pillarCount = MAIDINHK_CLUSTERS.filter((c) => c.category === "core").length;

    return {
      totalClicks,
      totalImpressions,
      avgPosition: avgPosition.toFixed(1),
      top5Count,
      pillarCount,
      clusterCount: MAIDINHK_CLUSTERS.length,
    };
  }, []);

  // 计算位置 - 双层环形
  const getClusterPosition = (cluster: ContentCluster) => {
    const isCore = cluster.category === "core";
    const radius = isCore ? 130 : 210;
    const radian = (cluster.angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  const selectedClusterData = MAIDINHK_CLUSTERS.find((c) => c.id === selectedCluster);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 h-96 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#27c3da] to-[#8e24aa]">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1a1a1a]">内容集群可视化</h3>
            <p className="text-xs text-[#999]">maidinhk.com · Topic Cluster · 7支柱+8集群</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#27c3da]" />
          <span className="text-xs text-[#666]">支柱页面 (7个)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#8e24aa]" />
          <span className="text-xs text-[#666]">集群内容 (8个)</span>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative mx-auto mb-6 h-[450px] w-full max-w-[600px]">
        {/* Connection lines */}
        {MAIDINHK_CLUSTERS.map((cluster, index) => {
          const pos = getClusterPosition(cluster);
          const angle = Math.atan2(pos.y, pos.x) * (180 / Math.PI);
          const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
          return (
            <ConnectionLine
              key={cluster.id}
              angle={angle}
              length={distance}
              delay={index * 0.1}
              isActive={selectedCluster === cluster.id}
              color={cluster.color}
            />
          );
        })}

        {/* Center node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <CentralNode />
        </div>

        {/* Cluster cards */}
        {MAIDINHK_CLUSTERS.map((cluster) => {
          const pos = getClusterPosition(cluster);
          return (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              isSelected={selectedCluster === cluster.id}
              onClick={() => setSelectedCluster(selectedCluster === cluster.id ? null : cluster.id)}
              x={pos.x}
              y={pos.y}
            />
          );
        })}

        {/* Detail panel */}
        <AnimatePresence>
          {selectedCluster && selectedClusterData && (
            <ClusterDetailPanel cluster={selectedClusterData} onClose={() => setSelectedCluster(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-5 gap-3 border-t border-[#f0f0f0] pt-6">
        <div className="text-center">
          <p className="text-xl font-bold text-[#1a1a1a]">{stats.clusterCount}</p>
          <p className="text-[10px] text-[#999]">主题集群</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#27c3da]">{stats.totalClicks}</p>
          <p className="text-[10px] text-[#999]">总点击</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#8e24aa]">{(stats.totalImpressions / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-[#999]">展示量</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#1a1a1a]">{stats.avgPosition}</p>
          <p className="text-[10px] text-[#999]">平均排名</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-green-600">{stats.top5Count}</p>
          <p className="text-[10px] text-[#999]">首页内容</p>
        </div>
      </div>

      <TechnicalNote />
    </div>
  );
}
