"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/resume/ScrollReveal";
import ScrollToTop from "@/components/blog/ScrollToTop";
import GSCPerformanceChart from "@/components/data-master/GSCPerformanceChart";
import GSCImport from "@/components/data-master/GSCImport";
import SEOTracker from "@/components/data-master/SEOTracker";
import TopicClusterVisualization from "@/components/data-master/TopicClusterVisualization";
import RankingDistributionChart from "@/components/data-master/RankingDistributionChart";
import SearchIntentRadar from "@/components/data-master/SearchIntentRadar";
import SEOActionImpact from "@/components/data-master/SEOActionImpact";
import PageDataExplorer from "@/components/data-master/PageDataExplorer";
import { TableSkeleton, CardSkeleton, ChartSkeleton } from "@/components/ui/LoadingSpinner";

interface QueryData {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface PageData {
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface StatsData {
  queryCount: number;
  pageCount: number;
  totalCount: number;
  topQueries: QueryData[];
  topPages: PageData[];
  optimizationTargets: PageData[];
  latestUpload?: {
    upload_batch: string;
    upload_date: string;
    notes: string;
  } | null;
}

type ActiveTab = 'performance' | 'seo-tracking' | 'page-explorer';

export default function DataMasterPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('performance');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/data-master-stats");
      
      if (!response.ok) {
        throw new Error("获取数据失败");
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("数据加载失败，请刷新页面重试");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[860px] px-5 py-12">
        <div className="mb-10 animate-pulse">
          <div className="mb-2 h-3 w-24 rounded bg-[#e0e0e0]" />
          <div className="mb-4 h-10 w-48 rounded bg-[#f0f0f0]" />
          <div className="h-4 w-3/4 rounded bg-[#f0f0f0]" />
        </div>
        <div className="mb-16"><CardSkeleton count={3} /></div>
        <div className="mb-16"><ChartSkeleton /></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-[860px] px-5 py-12">
        <div className="flex flex-col items-center justify-center rounded-sm border border-[#eee] bg-white py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0f0]">
            <svg className="h-8 w-8 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="mb-4 text-[#666]">{error || "暂无数据"}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-sm bg-[#1a1a1a] px-6 py-2 text-sm text-white transition-colors hover:bg-[#333]"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[860px] px-5 py-12">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-10">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
              Data Platform
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1a1a]">
              数据管理大师
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#666]">
              实时监控 maidinhk.com 的 Google Search Console 数据，智能分析搜索表现与页面流量，提供 Title/Description 优化建议。
            </p>
            {stats.latestUpload && (
              <p className="mt-2 text-xs text-[#999]">
                最新数据：{stats.latestUpload.upload_date}
                {stats.latestUpload.notes ? ` · ${stats.latestUpload.notes}` : ''}
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* 数据导入 */}
        <ScrollReveal>
          <GSCImport onImportSuccess={() => setRefreshKey((k) => k + 1)} />
        </ScrollReveal>

        {/* Tab 导航 */}
        <ScrollReveal>
          <div className="mb-8 border-b border-[#eee]">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('performance')}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'performance'
                    ? 'text-[#1a1a1a]'
                    : 'text-[#999] hover:text-[#666]'
                }`}
              >
                Performance
                {activeTab === 'performance' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('seo-tracking')}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'seo-tracking'
                    ? 'text-[#1a1a1a]'
                    : 'text-[#999] hover:text-[#666]'
                }`}
              >
                SEO 动作影响追踪
                {activeTab === 'seo-tracking' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('page-explorer')}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'page-explorer'
                    ? 'text-[#1a1a1a]'
                    : 'text-[#999] hover:text-[#666]'
                }`}
              >
                页面数据详情
                {activeTab === 'page-explorer' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
                )}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <>
            {/* Stats Overview */}
            <ScrollReveal>
              <div className="mb-16">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-[#999]">数据来源: GSC 导入数据</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                      搜索词记录
                    </p>
                    <p className="font-serif text-3xl font-bold text-[#1a1a1a]">
                      {stats?.queryCount?.toLocaleString() ?? "—"}
                    </p>
                    <p className="mt-2 text-xs text-[#888]">Queries 工作表</p>
                  </div>

                  <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                      页面记录
                    </p>
                    <p className="font-serif text-3xl font-bold text-[#1a1a1a]">
                      {stats?.pageCount?.toLocaleString() ?? "—"}
                    </p>
                    <p className="mt-2 text-xs text-[#888]">Pages 工作表</p>
                  </div>

                  <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                      总数据量
                    </p>
                    <p className="font-serif text-3xl font-bold text-[#1a1a1a]">
                      {stats?.totalCount?.toLocaleString() ?? "—"}
                    </p>
                    <p className="mt-2 text-xs text-[#888]">查询 + 页面</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Performance Chart */}
            <ScrollReveal>
              <section className="mb-16">
                <GSCPerformanceChart refreshKey={refreshKey} />
              </section>
            </ScrollReveal>

            {/* Ranking Distribution */}
            <ScrollReveal>
              <section className="mb-16">
                <RankingDistributionChart refreshKey={refreshKey} />
              </section>
            </ScrollReveal>

            {/* Search Intent Radar */}
            <ScrollReveal>
              <section className="mb-16">
                <SearchIntentRadar refreshKey={refreshKey} />
              </section>
            </ScrollReveal>

            {/* SEO Action Impact */}
            <ScrollReveal>
              <section className="mb-16">
                <SEOActionImpact refreshKey={refreshKey} optimizationTargets={stats?.optimizationTargets} />
              </section>
            </ScrollReveal>

            {/* Topic Cluster Visualization */}
            <ScrollReveal>
              <section className="mb-16">
                <TopicClusterVisualization refreshKey={refreshKey} topPages={stats?.topPages} />
              </section>
            </ScrollReveal>
          </>
        )}

        {/* SEO Tracking Tab */}
        {activeTab === 'seo-tracking' && (
          <ScrollReveal>
            <section className="mb-16">
              <SEOTracker refreshKey={refreshKey} />
            </section>
          </ScrollReveal>
        )}

        {/* Page Explorer Tab */}
        {activeTab === 'page-explorer' && (
          <ScrollReveal>
            <section className="mb-16">
              <PageDataExplorer refreshKey={refreshKey} />
            </section>
          </ScrollReveal>
        )}

        {/* CTA */}
        <ScrollReveal>
          <section className="rounded-sm border border-[#eee] bg-gradient-to-br from-[#fafafa] to-white p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a]">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-[#1a1a1a]">
                数据好看，但流量怎么还不涨？
              </h2>
              <p className="mb-2 max-w-lg text-sm leading-relaxed text-[#666]">
                做 SEO 最焦虑的不是没数据，而是有数据却不知道下一步该干什么。
              </p>
              <p className="mb-6 max-w-lg text-sm leading-relaxed text-[#666]">
                我在 maidinhk.com 上踩过所有你能想到的坑：CTR 低到想哭的页面、排名卡在第 11 位死活上不去的关键词、
                以为是内容问题结果竟是 TDK 少了一个词……这些血泪教训，都写在实战笔记里了。
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/blogs" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#333] hover:shadow-lg">
                  阅读实战笔记
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <a href="mailto:pangmengtong@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#ddd] bg-white px-6 py-3 text-sm font-medium text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]">
                  一起聊聊 SEO
                </a>
              </div>
              <p className="mt-6 text-xs text-[#999]">
                如果你也在做独立站 SEO，欢迎交流，说不定你的问题我也遇到过 👋
              </p>
            </div>
          </section>
        </ScrollReveal>
      </div>

      <ScrollToTop />
    </>
  );
}
