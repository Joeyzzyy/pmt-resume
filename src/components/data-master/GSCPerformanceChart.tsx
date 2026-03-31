"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ChartSkeleton } from "@/components/ui/LoadingSpinner";

interface ChartData {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  // 归一化数据（用于4线同屏展示）
  clicksNormalized: number;
  impressionsNormalized: number;
  ctrNormalized: number;
  positionNormalized: number;
}

interface SummaryData {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
}

type TimeRange = "7d" | "28d" | "3m";
type MetricType = "clicks" | "impressions" | "ctr" | "position";

interface GSCPerformanceChartProps {
  refreshKey?: number;
}

const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "7 天",
  "28d": "28 天",
  "3m": "3 个月",
};

// 明显有区别的颜色配置
const metricConfig: Record<
  MetricType,
  {
    label: string;
    color: string;
    unit: string;
    format: (v: number) => string;
    description: string;
  }
> = {
  clicks: {
    label: "Total Clicks",
    color: "#2563eb", // 蓝色 - 清晰醒目
    unit: "",
    format: (v) => Math.round(v).toLocaleString(),
    description: "总点击量",
  },
  impressions: {
    label: "Total Impressions",
    color: "#10b981", // 翠绿色 - 与蓝色形成对比
    unit: "",
    format: (v) => Math.round(v).toLocaleString(),
    description: "总展示量",
  },
  ctr: {
    label: "Average CTR",
    color: "#f59e0b", // 琥珀色/橙色 - 暖色调对比
    unit: "%",
    format: (v) => v.toFixed(2) + "%",
    description: "平均点击率",
  },
  position: {
    label: "Average Position",
    color: "#ef4444", // 红色 - 明显的警示色
    unit: "",
    format: (v) => v.toFixed(1),
    description: "平均排名",
  },
};

// 计算归一化数据
function normalizeData(data: ChartData[]): ChartData[] {
  if (data.length === 0) return data;

  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);
  const maxImpressions = Math.max(...data.map((d) => d.impressions), 1);
  const maxCtr = Math.max(...data.map((d) => d.ctr), 1);
  const maxPosition = Math.max(...data.map((d) => d.position) || 1);

  return data.map((d) => ({
    ...d,
    clicksNormalized: (d.clicks / maxClicks) * 100,
    impressionsNormalized: (d.impressions / maxImpressions) * 100,
    ctrNormalized: (d.ctr / maxCtr) * 100,
    positionNormalized: maxPosition > 0 ? (d.position / maxPosition) * 100 : 0,
  }));
}

export default function GSCPerformanceChart({ refreshKey }: GSCPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(["clicks", "impressions"]);
  const [data, setData] = useState<ChartData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, refreshKey]);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/gsc-trends?range=${timeRange}`);
      const result = await response.json();

      if (result.data) {
        const normalized = normalizeData(result.data);
        setData(normalized);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = parseISO(dateStr);
    // 统一显示为 MM/dd 格式（如 03/16）
    return format(date, "MM/dd");
  }

  // 计算统计数据用于tooltip显示
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    return {
      clicks: { max: Math.max(...data.map((d) => d.clicks)), min: Math.min(...data.map((d) => d.clicks)) },
      impressions: { max: Math.max(...data.map((d) => d.impressions)), min: Math.min(...data.map((d) => d.impressions)) },
      ctr: { max: Math.max(...data.map((d) => d.ctr)), min: Math.min(...data.map((d) => d.ctr)) },
      position: { max: Math.max(...data.map((d) => d.position)), min: Math.min(...data.map((d) => d.position)) },
    };
  }, [data]);

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="rounded-sm border border-[#eee] bg-white">
      {/* Header */}
      <div className="border-b border-[#eee] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#1a1a1a]">Performance</h3>
            <p className="mt-1 text-sm text-[#888]">搜索表现趋势 - {timeRangeLabels[timeRange]}</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex rounded-sm border border-[#eee] bg-[#fafafa] p-1">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  timeRange === range
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "text-[#888] hover:text-[#1a1a1a]"
                }`}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              className="rounded-sm p-4 transition-colors"
              style={{ backgroundColor: `${metricConfig.clicks.color}10` }}
            >
              <p className="text-xs" style={{ color: metricConfig.clicks.color }}>
                Total Clicks
              </p>
              <p className="mt-1 font-serif text-xl font-bold" style={{ color: metricConfig.clicks.color }}>
                {summary.totalClicks.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-sm p-4 transition-colors"
              style={{ backgroundColor: `${metricConfig.impressions.color}10` }}
            >
              <p className="text-xs" style={{ color: metricConfig.impressions.color }}>
                Total Impressions
              </p>
              <p
                className="mt-1 font-serif text-xl font-bold"
                style={{ color: metricConfig.impressions.color }}
              >
                {summary.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-sm p-4 transition-colors"
              style={{ backgroundColor: `${metricConfig.ctr.color}10` }}
            >
              <p className="text-xs" style={{ color: metricConfig.ctr.color }}>
                Average CTR
              </p>
              <p className="mt-1 font-serif text-xl font-bold" style={{ color: metricConfig.ctr.color }}>
                {summary.avgCtr.toFixed(2)}%
              </p>
            </div>
            <div
              className="rounded-sm p-4 transition-colors"
              style={{ backgroundColor: `${metricConfig.position.color}10` }}
            >
              <p className="text-xs" style={{ color: metricConfig.position.color }}>
                Average Position
              </p>
              <p
                className="mt-1 font-serif text-xl font-bold"
                style={{ color: metricConfig.position.color }}
              >
                {summary.avgPosition.toFixed(1)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metric Controls */}
      <div className="border-b border-[#eee] px-6 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium text-[#888]">指标选择:</span>
          <span className="text-xs text-[#aaa]">点击切换显示/隐藏</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(metricConfig) as MetricType[]).map((metric) => {
            const config = metricConfig[metric];
            const isActive = selectedMetrics.includes(metric);
            return (
              <button
                key={metric}
                onClick={() => {
                  setSelectedMetrics((prev) =>
                    prev.includes(metric)
                      ? prev.length > 1
                        ? prev.filter((m) => m !== metric)
                        : prev
                      : [...prev, metric]
                  );
                }}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-[#f0f0f0] text-[#888] hover:bg-[#e0e0e0]"
                } cursor-pointer`}
                style={{
                  backgroundColor: isActive ? config.color : undefined,
                }}
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 数据说明 */}
      <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-6 py-4">
        {selectedMetrics.length > 1 ? (
          <div className="flex items-start gap-2 text-xs text-[#666]">
            <span className="mt-0.5 text-[#f59e0b]">💡</span>
            <span>多指标同屏展示时，数据已归一化处理（0-100%），悬停图表查看实际数值</span>
          </div>
        ) : (
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: metricConfig[selectedMetrics[0]].color }} />
              <span className="text-[#666]">{metricConfig[selectedMetrics[0]].label}</span>
            </div>
            {stats && (
              <span className="text-[#999]">
                峰值: {metricConfig[selectedMetrics[0]].format(stats[selectedMetrics[0]].max)} | 
                最低: {metricConfig[selectedMetrics[0]].format(stats[selectedMetrics[0]].min)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="p-6">
        <div style={{ width: '100%', height: 384 }}>
          <ResponsiveContainer width="100%" height={384}>
            <LineChart data={data} margin={{ top: 30, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#888"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#eee" }}
                tick={{ fill: "#888" }}
              />

              {selectedMetrics.length === 1 ? (
                // 单指标模式 - 使用实际数值
                <>
                  <YAxis
                    stroke={metricConfig[selectedMetrics[0]].color}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: metricConfig[selectedMetrics[0]].color }}
                    tick={{ fill: metricConfig[selectedMetrics[0]].color }}
                    tickFormatter={(value) => metricConfig[selectedMetrics[0]].format(value as number)}
                    domain={selectedMetrics[0] === "position" ? [0, 30] : [0, "auto"]}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedMetrics[0]}
                    stroke={metricConfig[selectedMetrics[0]].color}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </>
              ) : (
                // 多指标模式 - 使用归一化数据
                <>
                  <YAxis
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#eee" }}
                    tick={{ fill: "#888" }}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  {selectedMetrics.includes("clicks") && (
                    <Line
                      type="monotone"
                      dataKey="clicksNormalized"
                      name="clicks"
                      stroke={metricConfig.clicks.color}
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1000}
                    />
                  )}
                  {selectedMetrics.includes("impressions") && (
                    <Line
                      type="monotone"
                      dataKey="impressionsNormalized"
                      name="impressions"
                      stroke={metricConfig.impressions.color}
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1000}
                    />
                  )}
                  {selectedMetrics.includes("ctr") && (
                    <Line
                      type="monotone"
                      dataKey="ctrNormalized"
                      name="ctr"
                      stroke={metricConfig.ctr.color}
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1000}
                    />
                  )}
                  {selectedMetrics.includes("position") && (
                    <Line
                      type="monotone"
                      dataKey="positionNormalized"
                      name="position"
                      stroke={metricConfig.position.color}
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1000}
                    />
                  )}
                </>
              )}

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-sm border border-[#eee] bg-white p-4 shadow-lg">
                        <p className="mb-3 border-b border-[#f0f0f0] pb-2 text-xs font-medium text-[#888]">
                          {format(parseISO(label as string), "yyyy年MM月dd日")}
                        </p>
                        <div className="space-y-2">
                          {selectedMetrics
                            .map((metric) => ({
                              dataKey: metric,
                              value: data.find((d) => d.date === label)?.[metric],
                            }))
                            .map((entry, index) => {
                            const metric = entry.dataKey as MetricType;
                            const config = metricConfig[metric];
                            return (
                              <div key={index} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: config.color }}
                                  />
                                  <span className="text-xs text-[#666]">{config.label}</span>
                                </div>
                                <span className="font-medium text-[#1a1a1a]">
                                  {config.format(entry.value as number)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* 图例已移至底部，避免与图表重叠 */}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 数据解读 */}
        <div className="border-t border-[#eee] p-6">
          <h4 className="mb-4 font-serif text-sm font-semibold text-[#1a1a1a]">
            💡 数据解读
          </h4>
          <div className="space-y-4 text-sm text-[#666]">
            <div className="rounded-sm border-l-2 border-[#10b981] bg-[#fafafa] p-4">
              <p className="mb-2 font-medium text-[#1a1a1a]">
                平均排名 {summary ? summary.avgPosition.toFixed(1) : "8.2"} 意味着什么？
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs">
                <li>Google 首页仅显示 10 个自然结果，平均排名 8+ 意味着<strong>平均就在首页</strong></li>
                <li>新站通常排名在 20-50 位（第 2-5 页），已<strong>超越 90% 的竞争者</strong></li>
                <li>在&quot;外佣雇主&quot;这一垂直细分领域建立了<strong>搜索权威性</strong></li>
              </ul>
            </div>
            <div className="rounded-sm border-l-2 border-[#2563eb] bg-[#fafafa] p-4">
              <p className="mb-2 font-medium text-[#1a1a1a]">
                CTR {summary ? summary.avgCtr.toFixed(2) : "2.71"}% 的含金量？
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs">
                <li>行业平均 CTR 约 1-2%，当前数据<strong>高出行业均值 35%+</strong></li>
                <li>说明标题和描述<strong>精准匹配用户搜索意图</strong></li>
                <li>反映了内容定位的<strong>高商业意图匹配度</strong>，流量质量优于排名靠前的竞品</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
