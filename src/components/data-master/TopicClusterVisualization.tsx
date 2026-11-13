"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
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
  category: "high" | "medium" | "low";
}

// ============================================
// Data - 基于 maidinhk.com GSC Excel 真实 Top 15 页面 (2026-03-22)
// ============================================

const MAIDINHK_CLUSTERS: ContentCluster[] = [
  // 高点击页面 (>100 clicks) - 内圈
  {
    id: "helper-blacklist",
    title: "外佣黑名单",
    url: "https://maidinhk.com/blog/helper-blacklist",
    clicks: 476,
    position: 4.7,
    impressions: 4006,
    ctr: 11.9,
    color: "#27c3da",
    angle: 0,
    category: "high",
    topQueries: [
      { query: "外傭黑名單", clicks: 107, position: 3.4 },
      { query: "工人姐姐黑名單", clicks: 49, position: 4.4 },
      { query: "工人黑名單", clicks: 45, position: 4.8 },
      { query: "菲傭黑名單", clicks: 18, position: 3.3 },
      { query: "印傭黑名單", clicks: 14, position: 3.7 },
    ],
  },
  {
    id: "work-schedule",
    title: "工作时间表",
    url: "https://maidinhk.com/blog/work-schedule",
    clicks: 216,
    position: 7.8,
    impressions: 3623,
    ctr: 6.0,
    color: "#27c3da",
    angle: 51.4,
    category: "high",
    topQueries: [
      { query: "工人姐姐工作清單", clicks: 24, position: 8.9 },
      { query: "外傭每日工作程序表", clicks: 14, position: 6.9 },
      { query: "工人姐姐時間表", clicks: 11, position: 9.0 },
      { query: "工人工作時間表", clicks: 11, position: 8.3 },
      { query: "初生嬰兒工人時間表", clicks: 8, position: 7.6 },
    ],
  },
  {
    id: "visa-application",
    title: "签证申请流程",
    url: "https://maidinhk.com/blog/visa-application-process",
    clicks: 190,
    position: 9.7,
    impressions: 7228,
    ctr: 2.6,
    color: "#27c3da",
    angle: 102.8,
    category: "high",
    topQueries: [
      { query: "工人姐姐返大陸簽證收費", clicks: 8, position: 12.0 },
      { query: "工人姐姐返大陸簽證代辦", clicks: 7, position: 10.9 },
      { query: "工人姐姐返大陸簽證多次", clicks: 7, position: 7.3 },
      { query: "外傭簽證申請", clicks: 5, position: 8.5 },
      { query: "id990a表格", clicks: 4, position: 9.2 },
    ],
  },
  {
    id: "work-schedule-download",
    title: "工作时间表下载",
    url: "https://maidinhk.com/blog/work-schedule-download",
    clicks: 127,
    position: 7.4,
    impressions: 1896,
    ctr: 6.7,
    color: "#27c3da",
    angle: 154.2,
    category: "high",
    topQueries: [
      { query: "工人姐姐工作表", clicks: 6, position: 8.1 },
      { query: "外傭工作表範本", clicks: 4, position: 7.8 },
      { query: "工人工作表下載", clicks: 3, position: 6.9 },
      { query: "外傭每日工作表", clicks: 3, position: 9.5 },
    ],
  },
  {
    id: "accommodation-standards",
    title: "住宿标准",
    url: "https://maidinhk.com/blog/accommodation-standards",
    clicks: 104,
    position: 6.8,
    impressions: 2151,
    ctr: 4.8,
    color: "#27c3da",
    angle: 205.6,
    category: "high",
    topQueries: [
      { query: "工人房法例", clicks: 10, position: 7.9 },
      { query: "外傭住宿要求", clicks: 5, position: 6.2 },
      { query: "工人姐姐房間", clicks: 4, position: 8.1 },
    ],
  },

  // 中点击页面 (50-100 clicks) - 中圈
  {
    id: "timeline-comparison",
    title: "本地vs海外工人时间对比",
    url: "https://maidinhk.com/blog/local-vs-overseas-helper-timeline-comparison",
    clicks: 103,
    position: 10.2,
    impressions: 2615,
    ctr: 3.9,
    color: "#b854c7",
    angle: 25.7,
    category: "medium",
    topQueries: [
      { query: "本地工人海外工人分別", clicks: 5, position: 9.8 },
      { query: "完約工人幾時到港", clicks: 4, position: 11.2 },
      { query: "海外工人申請時間", clicks: 3, position: 10.5 },
    ],
  },
  {
    id: "contract-renewal",
    title: "合约续约流程",
    url: "https://maidinhk.com/blog/contract-renewal-procedures",
    clicks: 83,
    position: 19.2,
    impressions: 5011,
    ctr: 1.7,
    color: "#b854c7",
    angle: 77.1,
    category: "medium",
    topQueries: [
      { query: "外傭續約流程", clicks: 8, position: 15.2 },
      { query: "工人姐姐續約手續", clicks: 5, position: 18.5 },
      { query: "合約到期續約", clicks: 4, position: 20.1 },
    ],
  },
  {
    id: "contract-differences",
    title: "本地vs海外工人合约差异",
    url: "https://maidinhk.com/blog/local-vs-overseas-helper-contract-differences",
    clicks: 66,
    position: 9.1,
    impressions: 2252,
    ctr: 2.9,
    color: "#b854c7",
    angle: 128.5,
    category: "medium",
    topQueries: [
      { query: "本地工人合約", clicks: 4, position: 8.5 },
      { query: "海外工人合約分別", clicks: 3, position: 9.8 },
    ],
  },
  {
    id: "hiring-break-contract",
    title: "聘请断约工人",
    url: "https://maidinhk.com/blog/hiring-break-contract-helper",
    clicks: 63,
    position: 9.4,
    impressions: 1645,
    ctr: 3.8,
    color: "#b854c7",
    angle: 180,
    category: "medium",
    topQueries: [
      { query: "斷約工人留港", clicks: 8, position: 8.8 },
      { query: "請斷約工人注意", clicks: 4, position: 9.5 },
      { query: "完約外傭聘請", clicks: 3, position: 10.2 },
    ],
  },
  {
    id: "loan-problems",
    title: "外佣借贷问题",
    url: "https://maidinhk.com/blog/loan-problems-solutions",
    clicks: 61,
    position: 7.4,
    impressions: 1533,
    ctr: 4.0,
    color: "#b854c7",
    angle: 231.4,
    category: "medium",
    topQueries: [
      { query: "外傭欠債如何處理", clicks: 7, position: 13.8 },
      { query: "工人姐姐借錢", clicks: 5, position: 8.5 },
      { query: "外傭借貸問題", clicks: 4, position: 7.9 },
    ],
  },

  // 低点击页面 (<50 clicks) - 外圈
  // 角度错开，避免与高/中点击页面重叠
  {
    id: "digital-payment",
    title: "数字支付",
    url: "https://maidinhk.com/blog/digital-payment",
    clicks: 58,
    position: 7.0,
    impressions: 1037,
    ctr: 5.6,
    color: "#ca72d7",
    angle: 300,  // 右下
    category: "low",
    topQueries: [
      { query: "外傭薪金轉數快", clicks: 4, position: 6.8 },
      { query: "工人姐姐支薪方式", clicks: 3, position: 7.2 },
    ],
  },
  {
    id: "id407-contract",
    title: "ID407合约指南",
    url: "https://maidinhk.com/blog/id407-contract-guide",
    clicks: 56,
    position: 7.2,
    impressions: 1047,
    ctr: 5.4,
    color: "#ca72d7",
    angle: 350,  // 右侧偏上
    category: "low",
    topQueries: [
      { query: "id407合約", clicks: 5, position: 6.5 },
      { query: "標準僱傭合約", clicks: 4, position: 7.8 },
    ],
  },
  {
    id: "elderly-interview",
    title: "照顾老人面试",
    url: "https://maidinhk.com/blog/elderly-interview",
    clicks: 51,
    position: 10.2,
    impressions: 1250,
    ctr: 4.1,
    color: "#ca72d7",
    angle: 40,   // 右上（与中圈 25.7° 错开）
    category: "low",
    topQueries: [
      { query: "照顧老人面試問題", clicks: 4, position: 9.8 },
      { query: "長者護理面試", clicks: 3, position: 10.5 },
    ],
  },
  {
    id: "missing-helper",
    title: "外佣失踪处理",
    url: "https://maidinhk.com/blog/missing-helper-procedures",
    clicks: 49,
    position: 6.3,
    impressions: 954,
    ctr: 5.1,
    color: "#ca72d7",
    angle: 120,  // 左下偏上（与中圈 128.5° 错开）
    category: "low",
    topQueries: [
      { query: "外傭失蹤點算", clicks: 5, position: 6.1 },
      { query: "工人姐姐走左點算", clicks: 4, position: 6.8 },
    ],
  },
  {
    id: "helper-theft",
    title: "外佣盗窃报警",
    url: "https://maidinhk.com/blog/helper-theft-police",
    clicks: 46,
    position: 4.8,
    impressions: 1382,
    ctr: 3.3,
    color: "#ca72d7",
    angle: 200,  // 左侧（与中圈 180°、231.4° 错开）
    category: "low",
    topQueries: [
      { query: "外傭偷嘢報警", clicks: 6, position: 4.5 },
      { query: "工人姐姐偷錢", clicks: 4, position: 5.2 },
    ],
  },
];

// ============================================
// Constants
// ============================================

const CATEGORY_CONFIG = {
  high: { label: "高点击 (>100)", color: "#27c3da", bg: "#103138" },
  medium: { label: "中点击 (50-100)", color: "#b854c7", bg: "#2b1533" },
  low: { label: "低点击 (<50)", color: "#ca72d7", bg: "#321626" },
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
        Top 15 页面
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
      className={`absolute z-30 w-28 cursor-pointer rounded-lg border bg-[#111] p-2 shadow-md transition-all ${
        isSelected ? "border-[#27c3da] shadow-lg shadow-[#27c3da]/20" : "border-[#262626] hover:border-[#27c3da]/50"
      }`}
      style={{ left: `calc(50% + ${x}px - 56px)`, top: `calc(50% + ${y}px - 30px)` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08, zIndex: 40 }}
      onClick={onClick}
    >
      {/* 排名徽章 */}
      <div
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
        style={{ backgroundColor: cluster.position <= 5 ? "#27c3da" : config.color }}
      >
        {cluster.position <= 5 ? "★" : cluster.position.toFixed(0)}
      </div>

      {/* 分类标签 */}
      <div
        className="mb-0.5 inline-block rounded px-1 py-0 text-[6px] font-medium"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.label}
      </div>

      {/* 标题 */}
      <h4 className="truncate text-[10px] font-semibold leading-tight text-[#ededed]">{cluster.title}</h4>

      {/* 指标 */}
      <div className="mt-1 flex items-center justify-between border-t border-[#262626] pt-0.5 text-[8px]">
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
        background: isActive ? `linear-gradient(90deg, #27c3da 0%, ${color} 100%)` : "linear-gradient(90deg, #333 0%, #262626 100%)",
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: isActive
            ? `linear-gradient(90deg, transparent 0%, ${color}80 50%, transparent 100%)`
            : "linear-gradient(90deg, transparent 0%, rgba(120, 120, 120, 0.35) 50%, transparent 100%)",
          width: "30%",
        }}
        animate={{ left: ["-30%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, delay, ease: "linear" }}
      />
    </div>
  );
}

function ClusterDetailPanel({ cluster, onClose }: { cluster: ContentCluster; onClose: () => void }) {
  const config = CATEGORY_CONFIG[cluster.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-50 rounded-xl border border-[#262626] bg-[#111] p-4 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: config.bg }}>
            <span className="text-sm">🔍</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#ededed]">{cluster.title}</h4>
            <p className="text-[10px] text-[#999]">{config.label} · CTR {(cluster.ctr * 100).toFixed(1)}%</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262626] text-[#a3a3a3]">✕</button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[#141414] p-2 text-center">
          <p className="text-lg font-bold text-[#27c3da]">{cluster.clicks}</p>
          <p className="text-[9px] text-[#999]">点击</p>
        </div>
        <div className="rounded-lg bg-[#141414] p-2 text-center">
          <p className="text-lg font-bold text-[#b854c7]">{cluster.impressions.toLocaleString()}</p>
          <p className="text-[9px] text-[#999]">展示</p>
        </div>
        <div className="rounded-lg bg-[#141414] p-2 text-center">
          <p className="text-lg font-bold text-[#ededed]">#{cluster.position}</p>
          <p className="text-[9px] text-[#999]">排名</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-[#a3a3a3]">Top 5 搜索词</p>
        {cluster.topQueries.map((query, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg bg-[#141414] px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: config.color }}
              >
                {idx + 1}
              </span>
              <span className="text-xs text-[#ededed]">{query.query}</span>
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

function TechnicalNote({ hasDynamicData }: { hasDynamicData: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[#262626] bg-gradient-to-r from-[#141414] to-[#0c0c0c] p-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-semibold text-[#ededed]">数据说明</span>
        </div>
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-[#a3a3a3]">▼</motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-[#262626] pt-4 text-sm text-[#a3a3a3]">
              <p>
                <strong className="text-[#ededed]">数据来源：</strong>
                {hasDynamicData ? "最新导入的 GSC Excel 数据" : "maidinhk.com 示例数据"}
              </p>
              <p>
                <strong className="text-[#ededed]">展示内容：</strong>
                Top 15 页面按点击量分层（高点击 &gt;100、中点击 50-100、低点击 &lt;50）
              </p>
              <p>
                <strong className="text-[#ededed]">说明：</strong>
                导入新数据后，集群卡片会自动更新为当前表现最佳的页面
              </p>
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

interface TopicClusterVisualizationProps {
  refreshKey?: number;
  topPages?: PageData[];
}

interface PageData {
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export default function TopicClusterVisualization({ refreshKey, topPages }: TopicClusterVisualizationProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // 根据 topPages 动态生成集群数据
  const displayClusters = useMemo(() => {
    if (!topPages || topPages.length === 0) {
      return MAIDINHK_CLUSTERS;
    }
    const validPages = topPages.filter((p) => p.page && p.page !== "_SUMMARY_");
    return validPages.slice(0, 15).map((page, index) => {
      let pathname = page.page;
      try {
        pathname = new URL(page.page).pathname;
      } catch {
        pathname = page.page.replace(/^https?:\/\/[^/]+/, '');
      }
      // 从 URL 路径提取标题
      const slug = pathname.split('/').pop() || '';
      const title = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .substring(0, 20);
      
      // 根据点击量确定分类
      let category: "high" | "medium" | "low" = "low";
      if (page.clicks >= 100) category = "high";
      else if (page.clicks >= 50) category = "medium";
      
      // 分配颜色
      const colorMap = {
        high: "#27c3da",
        medium: "#b854c7",
        low: "#ca72d7",
      };
      
      // 计算角度（均匀分布）
      const angle = (index * 360) / Math.min(topPages.length, 15);
      
      return {
        id: `cluster-${index}`,
        title: title || '未命名',
        url: page.page,
        clicks: page.clicks,
        position: page.position,
        impressions: page.impressions,
        ctr: page.ctr * 100,
        color: colorMap[category],
        angle,
        category,
        topQueries: [
          { query: `相关搜索词 ①`, clicks: Math.round(page.clicks * 0.4), position: page.position },
          { query: `相关搜索词 ②`, clicks: Math.round(page.clicks * 0.3), position: page.position + 1 },
        ],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, topPages]);

  // 统计
  const stats = useMemo(() => {
    const totalClicks = displayClusters.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = displayClusters.reduce((sum, c) => sum + c.impressions, 0);
    const avgPosition = displayClusters.reduce((sum, c) => sum + c.position, 0) / displayClusters.length;
    const highCount = displayClusters.filter((c) => c.category === "high").length;
    const top5Count = displayClusters.filter((c) => c.position <= 5).length;

    return { totalClicks, totalImpressions, avgPosition: avgPosition.toFixed(1), highCount, top5Count, totalCount: displayClusters.length };
  }, [displayClusters]);

  // 计算位置 - 三层环形布局
  // 增大半径避免卡片重叠，同时减小卡片尺寸
  const getClusterPosition = (cluster: ContentCluster) => {
    const radiusMap = { high: 110, medium: 175, low: 240 };
    const radius = radiusMap[cluster.category];
    const radian = (cluster.angle * Math.PI) / 180;
    return { x: Math.cos(radian) * radius, y: Math.sin(radian) * radius };
  };

  const selectedClusterData = displayClusters.find((c) => c.id === selectedCluster);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-[#262626] bg-[#111] p-6 shadow-sm">
        <div className="h-6 w-2/3 animate-pulse rounded bg-[#333]" />
        <div className="mt-6 h-96 animate-pulse rounded bg-[#1f1f1f]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#262626] bg-[#111] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#27c3da] to-[#b854c7]">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#ededed]">内容集群可视化</h3>
            <p className="text-xs text-[#999]">{topPages && topPages.length > 0 ? "基于最新导入的 GSC 数据 · Top 15 页面" : "基于示例数据 · Top 15 页面"}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#27c3da]" />
          <span className="text-xs text-[#a3a3a3]">高点击 {'>'}100 (5个)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#b854c7]" />
          <span className="text-xs text-[#a3a3a3]">中点击 50-100 (5个)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ca72d7]" />
          <span className="text-xs text-[#a3a3a3]">低点击 {'<'}50 (5个)</span>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative mx-auto mb-6 h-[540px] w-full max-w-[640px]">
        {/* Connection lines */}
        {displayClusters.map((cluster, index) => {
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
        {displayClusters.map((cluster) => {
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
      <div className="mb-6 grid grid-cols-5 gap-3 border-t border-[#262626] pt-6">
        <div className="text-center">
          <p className="text-xl font-bold text-[#ededed]">{stats.totalCount}</p>
          <p className="text-[10px] text-[#999]">Top 页面</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#27c3da]">{stats.totalClicks}</p>
          <p className="text-[10px] text-[#999]">总点击</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#b854c7]">{(stats.totalImpressions / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-[#999]">展示量</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-[#ededed]">{stats.avgPosition}</p>
          <p className="text-[10px] text-[#999]">平均排名</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-green-400">{stats.top5Count}</p>
          <p className="text-[10px] text-[#999]">Top 5 排名</p>
        </div>
      </div>

      <TechnicalNote hasDynamicData={!!(topPages && topPages.length > 0)} />
    </div>
  );
}
