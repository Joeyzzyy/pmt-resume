"use client";

/**
 * RankingDistributionChart 使用示例
 * 
 * 展示如何在实际项目中使用该组件，包括：
 * 1. 基础用法
 * 2. 配合 gscDataProcessor 使用
 * 3. 深色模式
 * 4. 实时数据更新
 */

import { useState, useEffect, useMemo } from "react";
import RankingDistributionChart, {
  calculateHomepageRate,
  GSC_COLORS,
} from "./RankingDistributionChart";
import { processGSCData } from "@/lib/gscDataProcessor";

// ============================================
// 示例 1: 基础用法
// ============================================

export function BasicExample() {
  // 直接使用静态数据
  const staticData = [
    { range: "top3", label: "Top 3", count: 15, percentage: 18.8, color: "#27c3da", description: "黄金位置" },
    { range: "top4-10", label: "Top 4-10", count: 32, percentage: 40.0, color: "#5fd4e6", description: "首页中部" },
    { range: "top11-30", label: "Top 11-30", count: 22, percentage: 27.5, color: "#8e24aa", description: "第2-3页" },
    { range: "beyond30", label: "31+", count: 11, percentage: 13.8, color: "#e0e0e0", description: "第4页后" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">基础用法</h2>
      <RankingDistributionChart data={staticData} />
    </div>
  );
}

// ============================================
// 示例 2: 配合 GSC 数据处理器使用
// ============================================

export function WithGSCDataProcessor() {
  const [processedData, setProcessedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 模拟 GSC CSV 数据
  const mockGSCData = [
    { Query: "女傭中介流程", Position: 2.5, Clicks: 45, Impressions: 1200, CTR: 0.0375 },
    { Query: "印傭點樣請", Position: 4.2, Clicks: 32, Impressions: 890, CTR: 0.036 },
    { Query: "女傭中介邊間好", Position: 6.8, Clicks: 28, Impressions: 2100, CTR: 0.013 },
    { Query: "請工人姐姐價錢", Position: 3.1, Clicks: 67, Impressions: 1850, CTR: 0.036 },
    { Query: "maidinhk 評價", Position: 1.2, Clicks: 89, Impressions: 2300, CTR: 0.039 },
    { Query: "外傭續約手續", Position: 8.5, Clicks: 15, Impressions: 560, CTR: 0.027 },
    { Query: "菲傭 vs 印傭 比較", Position: 5.3, Clicks: 41, Impressions: 1450, CTR: 0.028 },
    { Query: "預約女傭面試", Position: 12.4, Clicks: 8, Impressions: 320, CTR: 0.025 },
    { Query: "完約菲傭招聘", Position: 15.2, Clicks: 12, Impressions: 480, CTR: 0.025 },
    { Query: "工人姐姐保險", Position: 7.1, Clicks: 23, Impressions: 890, CTR: 0.026 },
  ];

  useEffect(() => {
    // 模拟 API 加载
    setTimeout(() => {
      const result = processGSCData(mockGSCData) as any;
      
      // 转换 rankingBuckets 为图表所需格式
      const buckets = result.rawStats.rankingBuckets;
      const total = result.rawStats.totalKeywords;
      
      const chartData = [
        {
          range: "top3",
          label: "Top 3",
          count: buckets["1-3"],
          percentage: parseFloat(((buckets["1-3"] / total) * 100).toFixed(1)),
          color: GSC_COLORS.ranking.top3,
          description: "黄金位置，流量主力",
        },
        {
          range: "top4-10",
          label: "Top 4-10",
          count: buckets["4-10"],
          percentage: parseFloat(((buckets["4-10"] / total) * 100).toFixed(1)),
          color: GSC_COLORS.ranking.top10,
          description: "首页中部，稳定曝光",
        },
        {
          range: "top11-30",
          label: "Top 11-30",
          count: buckets["11-30"],
          percentage: parseFloat(((buckets["11-30"] / total) * 100).toFixed(1)),
          color: GSC_COLORS.ranking.top30,
          description: "第2-3页，潜力区域",
        },
        {
          range: "beyond30",
          label: "31+",
          count: buckets["31+"],
          percentage: parseFloat(((buckets["31+"] / total) * 100).toFixed(1)),
          color: GSC_COLORS.ranking.beyond30,
          description: "第4页后，需优化",
        },
      ];

      setProcessedData({
        chartData,
        totalKeywords: total,
        homepageKeywords: buckets["1-3"] + buckets["4-10"],
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">配合 GSC 数据处理器</h2>
      {processedData && (
        <RankingDistributionChart
          data={processedData.chartData}
          totalKeywords={processedData.totalKeywords}
          homepageKeywords={processedData.homepageKeywords}
          loading={loading}
        />
      )}
    </div>
  );
}

// ============================================
// 示例 3: API 数据加载
// ============================================

export function WithAPIData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 实际项目中替换为真实 API
        const response = await fetch("/api/gsc-ranking-distribution");
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError("加载数据失败");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">API 数据加载</h2>
      <RankingDistributionChart
        data={data?.chartData}
        totalKeywords={data?.totalKeywords}
        homepageKeywords={data?.homepageKeywords}
        loading={loading}
      />
    </div>
  );
}

// ============================================
// 示例 4: 实时数据更新动画
// ============================================

export function LiveUpdateExample() {
  const [data, setData] = useState([
    { range: "top3", label: "Top 3", count: 5, percentage: 12.5, color: "#27c3da", description: "黄金位置" },
    { range: "top4-10", label: "Top 4-10", count: 12, percentage: 30.0, color: "#5fd4e6", description: "首页中部" },
    { range: "top11-30", label: "Top 11-30", count: 15, percentage: 37.5, color: "#8e24aa", description: "第2-3页" },
    { range: "beyond30", label: "31+", count: 8, percentage: 20.0, color: "#e0e0e0", description: "第4页后" },
  ]);

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = prev.map((item) => ({
          ...item,
          count: Math.max(0, item.count + Math.floor(Math.random() * 5) - 2),
        }));
        // 重新计算百分比
        const total = newData.reduce((sum, item) => sum + item.count, 0);
        return newData.map((item) => ({
          ...item,
          percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
        }));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalKeywords = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);
  const homepageKeywords = useMemo(
    () => data.filter((item) => item.range === "top3" || item.range === "top4-10").reduce((sum, item) => sum + item.count, 0),
    [data]
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">实时数据更新 (每 5 秒)</h2>
      <RankingDistributionChart
        data={data}
        totalKeywords={totalKeywords}
        homepageKeywords={homepageKeywords}
      />
    </div>
  );
}

// ============================================
// 示例 5: 完整页面集成
// ============================================

export default function RankingDistributionDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-8 text-center font-serif text-3xl font-bold text-[#1a1a1a]">
          RankingDistributionChart 组件示例
        </h1>

        <div className="space-y-12">
          <BasicExample />
          <WithGSCDataProcessor />
          <LiveUpdateExample />
        </div>

        {/* 使用说明 */}
        <div className="mt-16 rounded-xl border border-[#e5e5e5] bg-white p-6">
          <h3 className="mb-4 font-serif text-lg font-bold text-[#1a1a1a]">
            使用说明
          </h3>
          <pre className="overflow-x-auto rounded-lg bg-[#1a1a2e] p-4 text-sm text-gray-300">
{`import RankingDistributionChart from "@/components/data-master/RankingDistributionChart";

// 基础用法
<RankingDistributionChart 
  data={[
    { range: "top3", label: "Top 3", count: 12, percentage: 15, 
      color: "#27c3da", description: "黄金位置" },
    // ...
  ]}
/>

// 配合 GSC 数据处理器
const result = processGSCData(csvData);
const chartData = convertToChartData(result.rawStats.rankingBuckets);

<RankingDistributionChart 
  data={chartData}
  totalKeywords={result.rawStats.totalKeywords}
  homepageKeywords={result.rawStats.rankingBuckets["1-3"] + result.rawStats.rankingBuckets["4-10"]}
  loading={isLoading}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
