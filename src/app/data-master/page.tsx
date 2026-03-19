"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/resume/ScrollReveal";
import ScrollToTop from "@/components/blog/ScrollToTop";
import GSCPerformanceChart from "@/components/data-master/GSCPerformanceChart";
import LoadingSpinner, { TableSkeleton, CardSkeleton, ChartSkeleton } from "@/components/ui/LoadingSpinner";

// 数据类型定义
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
}

export default function DataMasterPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

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
        {/* Header Skeleton */}
        <div className="mb-10 animate-pulse">
          <div className="mb-2 h-3 w-24 rounded bg-[#e0e0e0]" />
          <div className="mb-4 h-10 w-48 rounded bg-[#f0f0f0]" />
          <div className="h-4 w-3/4 rounded bg-[#f0f0f0]" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="mb-16">
          <CardSkeleton count={3} />
        </div>

        {/* Chart Skeleton */}
        <div className="mb-16">
          <ChartSkeleton />
        </div>

        {/* Table Skeleton */}
        <div className="mb-16">
          <div className="mb-6 h-6 w-32 rounded bg-[#e0e0e0]" />
          <div className="rounded-sm border border-[#eee] bg-white">
            <TableSkeleton rows={5} cols={5} />
          </div>
        </div>
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
          </div>
        </ScrollReveal>

        {/* Stats Overview */}
        <ScrollReveal>
          <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                搜索词记录
              </p>
              <p className="font-serif text-3xl font-bold text-[#1a1a1a]">
                {stats.queryCount.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#888]">过去 90 天数据</p>
            </div>

            <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                页面记录
              </p>
              <p className="font-serif text-3xl font-bold text-[#1a1a1a]">
                {stats.pageCount.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#888]">过去 90 天数据</p>
            </div>

            <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                总数据量
              </p>
              <p className="font-serif text-3xl font-bold text-[#1a1a1a]">
                {stats.totalCount.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#888]">查询 + 页面</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Performance Chart */}
        <ScrollReveal>
          <section className="mb-16">
            <GSCPerformanceChart />
          </section>
        </ScrollReveal>

        {/* Data Source Info */}
        <ScrollReveal>
          <div className="mb-16 rounded-sm border border-[#eee] bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0]">
                <svg className="h-4 w-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">数据来源</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-[#999]">网站</p>
                <p className="font-medium text-[#1a1a1a]">maidinhk.com</p>
              </div>
              <div>
                <p className="text-[#999]">更新频率</p>
                <p className="font-medium text-[#1a1a1a]">每日自动同步</p>
              </div>
              <div>
                <p className="text-[#999]">数据表</p>
                <p className="font-medium text-[#1a1a1a]">GSC Data & Pages</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Top Queries Section */}
        {stats.topQueries.length > 0 && (
          <ScrollReveal>
            <section className="mb-16">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                    Top Queries
                  </p>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a]">
                    热门搜索关键词
                  </h2>
                </div>
                <Link
                  href="#"
                  className="text-xs text-[#888] transition-colors hover:text-[#1a1a1a]"
                >
                  查看全部 →
                </Link>
              </div>

              <div className="overflow-hidden rounded-sm border border-[#eee]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr className="border-b border-[#eee]">
                      <th className="px-4 py-3 text-left font-medium text-[#666]">关键词</th>
                      <th className="px-4 py-3 text-right font-medium text-[#666]">展示量</th>
                      <th className="px-4 py-3 text-right font-medium text-[#666]">点击</th>
                      <th className="px-4 py-3 text-right font-medium text-[#666]">CTR</th>
                      <th className="px-4 py-3 text-right font-medium text-[#666]">排名</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topQueries.map((query, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]"
                      >
                        <td className="px-4 py-3 text-[#1a1a1a]">{query.query}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-[#666]">
                          {query.impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[#666]">
                          {query.clicks}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[#666]">
                          {(query.ctr * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[#666]">
                          {query.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Top Pages Section */}
        {stats.topPages.length > 0 && (
          <ScrollReveal>
            <section className="mb-16">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                    Top Pages
                  </p>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a]">
                    热门页面流量
                  </h2>
                </div>
                <Link
                  href="#"
                  className="text-xs text-[#888] transition-colors hover:text-[#1a1a1a]"
                >
                  查看全部 →
                </Link>
              </div>

              <div className="space-y-3">
                {stats.topPages.slice(0, 5).map((page, index) => {
                  const url = page.page.replace("https://maidinhk.com", "");
                  const displayUrl = url.length > 50 ? url.substring(0, 47) + "..." : url;
                  
                  return (
                    <Link key={index} href={page.page} target="_blank">
                      <div className="group flex items-center justify-between rounded-sm border border-[#eee] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-xs font-medium text-[#666]">
                              {index + 1}
                            </span>
                            <p className="truncate font-medium text-[#1a1a1a] transition-colors group-hover:text-[#555]">
                              {displayUrl}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-6 text-xs tabular-nums text-[#888]">
                          <div className="text-right">
                            <p className="text-[#999]">展示</p>
                            <p className="font-medium text-[#1a1a1a]">{page.impressions.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#999]">点击</p>
                            <p className="font-medium text-[#1a1a1a]">{page.clicks}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#999]">CTR</p>
                            <p className={`font-medium ${page.ctr < 0.03 ? "text-[#FF2D55]" : "text-[#1a1a1a]"}`}>
                              {(page.ctr * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* TD Optimization Priority */}
        {stats.optimizationTargets.length > 0 && (
          <ScrollReveal>
            <section className="mb-16">
              <div className="mb-6">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                  TD Optimization
                </p>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a]">
                  优先优化页面
                </h2>
                <p className="mt-2 text-sm text-[#888]">
                  高展示量但低 CTR 的页面，优化 Title/Description 可带来显著流量提升
                </p>
              </div>

              <div className="space-y-3">
                {stats.optimizationTargets.map((page, index) => {
                  const url = page.page.replace("https://maidinhk.com", "");
                  const potentialGain = Math.round(page.impressions * 0.05 - page.clicks);
                  
                  return (
                    <div
                      key={index}
                      className="rounded-sm border border-[#FF2D55]/20 bg-[#FF2D55]/[0.02] p-4 transition-all duration-300 hover:border-[#FF2D55]/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF2D55] text-xs font-medium text-white">
                              {index + 1}
                            </span>
                            <p className="truncate text-sm font-medium text-[#1a1a1a]">
                              {url}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#888]">
                            <span>展示 {page.impressions.toLocaleString()}</span>
                            <span>点击 {page.clicks}</span>
                            <span className="text-[#FF2D55]">CTR {(page.ctr * 100).toFixed(1)}%</span>
                            <span>排名 {page.position.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-[#999]">预计可增</p>
                          <p className="text-lg font-bold text-[#FF2D55]">+{potentialGain}</p>
                          <p className="text-xs text-[#999]">点击/月</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                <Link
                  href="/blogs"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#333] hover:shadow-lg"
                >
                  阅读实战笔记
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <a
                  href="mailto:pangmengtong@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#ddd] bg-white px-6 py-3 text-sm font-medium text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                >
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
