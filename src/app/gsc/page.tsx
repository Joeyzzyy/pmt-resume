"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import './gsc.css';

Chart.register(...registerables);

const subTabs = [
  { key: 'overview', label: '概览' },
  { key: 'queries', label: '搜索词' },
  { key: 'pages', label: '页面表现' },
  { key: 'ranking', label: '排名分析' },
  { key: 'seo', label: 'SEO 洞察' },
  { key: 'trend', label: '变更分析' },
];

const quadrantList = [
  { key: 'highImpHighClick', cls: 'q-star', icon: '★', title: '高展示 & 高点击', advice: '核心优势页面，保持内容质量并持续优化。关注排名变化，防止竞争对手超越。可作为内链枢纽为其他页面导流。' },
  { key: 'highImpLowClick', cls: 'q-opportunity', icon: '⚠', title: '高展示 & 低点击', advice: '曝光充足但 CTR 偏低，是最大的优化机会。建议优化 Title 和 Meta Description 提升点击吸引力，添加结构化数据争取富文本摘要。' },
  { key: 'lowImpHighClick', cls: 'q-precision', icon: '🎯', title: '低展示 & 高点击', advice: '精准流量页面，CTR 很高但曝光不足。建议拓展相关长尾关键词增加覆盖面，加强内链建设提升页面权重，考虑产出更多同主题内容形成主题集群。' },
  { key: 'lowImpLowClick', cls: 'q-review', icon: '🔍', title: '低展示 & 低点击', advice: '需要重新审视的页面。评估是否值得保留：有价值的页面应补充内容深度、优化关键词定位；无价值页面考虑合并或 301 重定向到相关强势页面。' },
];

export default function GscDashboard() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const [gscSubTab, setGscSubTab] = useState('overview');
  const [rankingTab, setRankingTab] = useState('pages');

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trendChartCanvas = useRef<HTMLCanvasElement>(null);
  const trendChartInstance = useRef<Chart | null>(null);


  const [data, setData] = useState<any>({
    dailyTrend: [],
    topQueries: [],
    topPages: [],
    topCountries: [],
    deviceBreakdown: [],
    queryGrowth: [],
    pageGrowth: [],
    importHistory: [],
    insights: [],
    quadrantAnalysis: null,
    rankingDistribution: null,
    trendAnalysis: null,
  });

  const hasData = useMemo(() => {
    return data.dailyTrend.length > 0 || data.importHistory.length > 0;
  }, [data]);

  const summary = useMemo(() => {
    const daily = data.dailyTrend;
    if (!daily.length) return { totalClicks: 0, totalImpressions: 0, avgCTR: 0, avgPosition: 0 };
    const totalClicks = daily.reduce((s: number, d: any) => s + d.clicks, 0);
    const totalImpressions = daily.reduce((s: number, d: any) => s + d.impressions, 0);
    const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const validPos = daily.filter((d: any) => d.position > 0);
    const avgPosition = validPos.length > 0 ? validPos.reduce((s: number, d: any) => s + d.position, 0) / validPos.length : 0;
    return { totalClicks, totalImpressions, avgCTR, avgPosition };
  }, [data.dailyTrend]);

  function rankPercent(count: number, total: number) {
    if (!total) return 0;
    return Math.max(Math.round((count / total) * 100), count > 0 ? 3 : 0);
  }

  function devicePercent(clicks: number) {
    const total = (data.deviceBreakdown || []).reduce((s: number, d: any) => s + d.clicks, 0);
    if (total === 0) return 0;
    return Math.round((clicks / total) * 100);
  }

  function shortenUrl(url: string) {
    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url.replace('https://maidinhk.com', '').replace('http://maidinhk.com', '') || '/';
    }
  }

  function formatTime(ts: string) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function handleUploadClick() {
    setPwd('');
    setPwdError(false);
    setShowPwdModal(true);
  }

  function handlePwdConfirm() {
    if (pwd !== '970718') {
      setPwdError(true);
      return;
    }
    setShowPwdModal(false);
    fileInputRef.current?.click();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/admin/gsc-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: base64, fileName: file.name }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setUploadResult({ success: true, ...result });
        await loadData();
      } else {
        setUploadResult({ success: false, error: result.error || '导入失败' });
      }
    } catch (err: any) {
      setUploadResult({ success: false, error: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/gsc-analytics', {
        headers: {},
      });
      if (!response.ok) throw new Error('获取数据失败');
      const resultData = await response.json();
      setData(resultData);
    } catch (err) {
      console.error('加载 GSC 数据失败:', err);
    } finally {
      setLoading(false);
    }
  }

  function renderTrendChart() {
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
      trendChartInstance.current = null;
    }

    if (!trendChartCanvas.current || !data.dailyTrend.length || gscSubTab !== 'overview') return;

    const daily = data.dailyTrend;
    const labels = daily.map((d: any) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const clicksData = daily.map((d: any) => d.clicks);
    const impressionsData = daily.map((d: any) => d.impressions);

    const isMobile = window.innerWidth <= 768;
    const ctx = trendChartCanvas.current.getContext('2d');
    if (!ctx) return;

    trendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Clicks',
            data: clicksData,
            borderColor: '#FF2D55',
            backgroundColor: 'rgba(255, 45, 85, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: isMobile ? 1 : 2,
            pointHoverRadius: 5,
            yAxisID: 'y',
          },
          {
            label: 'Impressions',
            data: impressionsData,
            borderColor: '#bbb',
            backgroundColor: 'rgba(187, 187, 187, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: isMobile ? 1 : 2,
            pointHoverRadius: 5,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: isMobile ? 11 : 13 } },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: isMobile ? 8 : 12,
          },
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: !isMobile, text: 'Clicks' },
            beginAtZero: true,
            ticks: { font: { size: isMobile ? 10 : 12 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: !isMobile, text: 'Impressions' },
            beginAtZero: true,
            ticks: { font: { size: isMobile ? 10 : 12 } },
            grid: { drawOnChartArea: false },
          },
          x: {
            ticks: {
              font: { size: isMobile ? 9 : 11 },
              maxRotation: isMobile ? 45 : 0,
              maxTicksLimit: isMobile ? 15 : 30,
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (gscSubTab === 'overview') {
      const timer = setTimeout(() => renderTrendChart(), 100);
      return () => clearTimeout(timer);
    }
  }, [gscSubTab, data.dailyTrend]);

  return (
    <div className="gsc-container mx-auto max-w-5xl py-10 px-6">
      {/* 介绍区 */}
      <div className="gsc-intro">
        <p className="gsc-intro-label">GSC Data Insights</p>
        <h1 className="gsc-intro-heading">真实数据，实时呈现</h1>
        <p className="gsc-intro-desc">
          这个页面展示的是 <a href="https://maidinhk.com" target="_blank" rel="noopener noreferrer" className="gsc-intro-link">maidinhk.com</a> 在 Google Search Console 中的真实搜索表现数据。
          从关键词排名到页面点击率，每一个数字都来自 GSC 导出，可随时验证。
        </p>
        <p className="gsc-intro-desc">
          这个数据面板本身，也是我在学习 SEO 的同时，用 <span className="gsc-intro-highlight">Claude Code</span> 从零开发的全栈项目 —— 从数据解析、API 设计到前端可视化，体现的不只是 SEO 能力，更是<span className="gsc-intro-highlight">快速学习和跨领域整合</span>的综合素质。
        </p>
        <div className="gsc-intro-tags">
          <span className="gsc-intro-tag">Google Search Console</span>
          <span className="gsc-intro-tag">Next.js</span>
          <span className="gsc-intro-tag">Claude Code</span>
          <span className="gsc-intro-tag">Supabase</span>
        </div>
      </div>

      {/* 头部：上传 + 导入历史 */}
      <div className="gsc-header">
        <h2>GSC 搜索分析</h2>
        <div className="header-actions">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          <button className={`upload-btn ${uploading ? 'disabled' : ''}`} onClick={handleUploadClick} disabled={uploading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {uploading ? '导入中...' : '上传 Excel'}
          </button>
          <button className="refresh-btn" onClick={loadData} disabled={loading}>刷新数据</button>
        </div>
      </div>

      {/* 上传结果 */}
      {uploadResult && (
        <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
          {uploadResult.success ? (
            <span>
              导入成功！日期范围: {uploadResult.dateRange.from} ~ {uploadResult.dateRange.to}，
              每日 {uploadResult.counts.daily} 行，搜索词 {uploadResult.counts.queries} 行，
              页面 {uploadResult.counts.pages} 行
            </span>
          ) : (
            <span>{uploadResult.error}</span>
          )}
          <button className="close-btn" onClick={() => setUploadResult(null)}>&times;</button>
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载 GSC 数据中...</p>
        </div>
      ) : !hasData ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5"/></svg>
          <p>暂无 GSC 数据，请先上传 Excel 文件</p>
        </div>
      ) : (
        <div className="gsc-content">
          {/* 子 Tab 导航 */}
          <div className="gsc-sub-tabs">
            {subTabs.map(tab => (
              <button key={tab.key}
                className={gscSubTab === tab.key ? 'active' : ''}
                onClick={() => setGscSubTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: 概览 */}
          {gscSubTab === 'overview' && (
            <>
              {/* 概览卡片 */}
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon clicks-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{summary.totalClicks.toLocaleString()}</div>
                    <div className="stat-label">总点击数</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon impressions-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{summary.totalImpressions.toLocaleString()}</div>
                    <div className="stat-label">总展示数</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon ctr-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{(summary.avgCTR * 100).toFixed(2)}%</div>
                    <div className="stat-label">平均 CTR</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon position-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{summary.avgPosition.toFixed(1)}</div>
                    <div className="stat-label">平均排名</div>
                  </div>
                </div>
              </div>

              {/* 趋势图 */}
              <div className="chart-card full-width">
                <h3>Clicks & Impressions 趋势</h3>
                <div className="chart-container">
                  <canvas ref={trendChartCanvas}></canvas>
                </div>
              </div>

              {/* 设备 & 国家分布 */}
              <div className="tables-grid">
                {data.deviceBreakdown && data.deviceBreakdown.length > 0 && (
                  <div className="table-card">
                    <h3>设备分布</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>设备</th>
                            <th>点击</th>
                            <th>展示</th>
                            <th>CTR</th>
                            <th>占比</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.deviceBreakdown.map((d: any) => (
                            <tr key={d.device}>
                              <td>{d.device}</td>
                              <td>{d.clicks}</td>
                              <td>{d.impressions}</td>
                              <td>{(d.ctr * 100).toFixed(1)}%</td>
                              <td>
                                <div className="bar-wrapper">
                                  <div className="bar-fill" style={{ width: devicePercent(d.clicks) + '%' }}></div>
                                  <span>{devicePercent(d.clicks)}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {data.topCountries && data.topCountries.length > 0 && (
                  <div className="table-card">
                    <h3>Top 国家/地区</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>国家</th>
                            <th>点击</th>
                            <th>展示</th>
                            <th>CTR</th>
                            <th>排名</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topCountries.map((c: any) => (
                            <tr key={c.country}>
                              <td>{c.country}</td>
                              <td>{c.clicks}</td>
                              <td>{c.impressions}</td>
                              <td>{(c.ctr * 100).toFixed(1)}%</td>
                              <td>{c.position.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab 2: 搜索词 */}
          {gscSubTab === 'queries' && (
            <>
              <div className="table-card">
                <h3>Top 搜索词（按点击数）</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>搜索词</th>
                        <th>点击</th>
                        <th>展示</th>
                        <th>CTR</th>
                        <th>排名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topQueries.map((q: any, i: number) => (
                        <tr key={q.query}>
                          <td>{i + 1}</td>
                          <td className="query-cell">{q.query}</td>
                          <td>{q.clicks}</td>
                          <td>{q.impressions}</td>
                          <td>{(q.ctr * 100).toFixed(1)}%</td>
                          <td>{q.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.queryGrowth && data.queryGrowth.length > 0 && (
                <div className="table-card">
                  <h3>搜索词增长 Top 10</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>搜索词</th>
                          <th>当前点击</th>
                          <th>上期点击</th>
                          <th>增长率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.queryGrowth.map((q: any) => (
                          <tr key={q.query}>
                            <td className="query-cell">{q.query}</td>
                            <td>{q.clicks}</td>
                            <td>{q.prevClicks}</td>
                            <td>
                              <span className={`growth-badge ${q.growthRate >= 0 ? 'up' : 'down'}`}>
                                {q.growthRate >= 0 ? '+' : ''}{q.growthRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 3: 页面表现 */}
          {gscSubTab === 'pages' && (
            <>
              <div className="table-card">
                <h3>Top 页面（按点击数）</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>页面</th>
                        <th>点击</th>
                        <th>展示</th>
                        <th>CTR</th>
                        <th>排名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPages.map((p: any, i: number) => (
                        <tr key={p.page}>
                          <td>{i + 1}</td>
                          <td className="page-cell" title={p.page}>{shortenUrl(p.page)}</td>
                          <td>{p.clicks}</td>
                          <td>{p.impressions}</td>
                          <td>{(p.ctr * 100).toFixed(1)}%</td>
                          <td>{p.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.pageGrowth && data.pageGrowth.length > 0 && (
                <div className="table-card">
                  <h3>页面增长 Top 10</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>页面</th>
                          <th>当前点击</th>
                          <th>上期点击</th>
                          <th>增长率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pageGrowth.map((p: any) => (
                          <tr key={p.page}>
                            <td className="page-cell" title={p.page}>{shortenUrl(p.page)}</td>
                            <td>{p.clicks}</td>
                            <td>{p.prevClicks}</td>
                            <td>
                              <span className={`growth-badge ${p.growthRate >= 0 ? 'up' : 'down'}`}>
                                {p.growthRate >= 0 ? '+' : ''}{p.growthRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 4: 排名分析 */}
          {gscSubTab === 'ranking' && (
            <>
              {data.rankingDistribution && (
                <div className="ranking-section">
                  <h3>搜索排名分布</h3>
                  <p className="ranking-desc">
                    共 {data.rankingDistribution.totalPages} 个页面出词，{data.rankingDistribution.totalQueries} 个搜索词有排名
                  </p>

                  <div className="ranking-overview">
                    <div className="ranking-bar-group">
                      <span className="ranking-bar-label">页面</span>
                      <div className="ranking-bar">
                        <div className="ranking-bar-seg seg-p1" style={{ width: rankPercent(data.rankingDistribution.pageCounts.page1, data.rankingDistribution.totalPages) + '%' }} title={'第1页: ' + data.rankingDistribution.pageCounts.page1}>
                          {data.rankingDistribution.pageCounts.page1}
                        </div>
                        <div className="ranking-bar-seg seg-p2" style={{ width: rankPercent(data.rankingDistribution.pageCounts.page2, data.rankingDistribution.totalPages) + '%' }} title={'第2页: ' + data.rankingDistribution.pageCounts.page2}>
                          {data.rankingDistribution.pageCounts.page2}
                        </div>
                        <div className="ranking-bar-seg seg-p3" style={{ width: rankPercent(data.rankingDistribution.pageCounts.page3, data.rankingDistribution.totalPages) + '%' }} title={'第3页: ' + data.rankingDistribution.pageCounts.page3}>
                          {data.rankingDistribution.pageCounts.page3}
                        </div>
                        <div className="ranking-bar-seg seg-other" style={{ width: rankPercent(data.rankingDistribution.pageCounts.other, data.rankingDistribution.totalPages) + '%' }} title={'第4页+: ' + data.rankingDistribution.pageCounts.other}>
                          {data.rankingDistribution.pageCounts.other}
                        </div>
                      </div>
                    </div>
                    <div className="ranking-bar-group">
                      <span className="ranking-bar-label">搜索词</span>
                      <div className="ranking-bar">
                        <div className="ranking-bar-seg seg-p1" style={{ width: rankPercent(data.rankingDistribution.queryCounts.page1, data.rankingDistribution.totalQueries) + '%' }} title={'第1页: ' + data.rankingDistribution.queryCounts.page1}>
                          {data.rankingDistribution.queryCounts.page1}
                        </div>
                        <div className="ranking-bar-seg seg-p2" style={{ width: rankPercent(data.rankingDistribution.queryCounts.page2, data.rankingDistribution.totalQueries) + '%' }} title={'第2页: ' + data.rankingDistribution.queryCounts.page2}>
                          {data.rankingDistribution.queryCounts.page2}
                        </div>
                        <div className="ranking-bar-seg seg-p3" style={{ width: rankPercent(data.rankingDistribution.queryCounts.page3, data.rankingDistribution.totalQueries) + '%' }} title={'第3页: ' + data.rankingDistribution.queryCounts.page3}>
                          {data.rankingDistribution.queryCounts.page3}
                        </div>
                        <div className="ranking-bar-seg seg-other" style={{ width: rankPercent(data.rankingDistribution.queryCounts.other, data.rankingDistribution.totalQueries) + '%' }} title={'第4页+: ' + data.rankingDistribution.queryCounts.other}>
                          {data.rankingDistribution.queryCounts.other}
                        </div>
                      </div>
                    </div>
                    <div className="ranking-legend">
                      <span className="legend-item"><span className="legend-dot seg-p1"></span>第1页 (1-10)</span>
                      <span className="legend-item"><span className="legend-dot seg-p2"></span>第2页 (11-20)</span>
                      <span className="legend-item"><span className="legend-dot seg-p3"></span>第3页 (21-30)</span>
                      <span className="legend-item"><span className="legend-dot seg-other"></span>第4页+</span>
                    </div>
                  </div>

                  <div className="ranking-tabs">
                    <button className={rankingTab === 'pages' ? 'active' : ''} onClick={() => setRankingTab('pages')}>按页面</button>
                    <button className={rankingTab === 'queries' ? 'active' : ''} onClick={() => setRankingTab('queries')}>按搜索词</button>
                  </div>

                  <div className="ranking-pages-detail">
                    {[1, 2, 3].map(pageNum => (
                      <div key={pageNum} className={`ranking-page-card rp-${pageNum}`}>
                        <div className="rp-header">
                          <h4>第 {pageNum} 页<span className="rp-range">（排名 {(pageNum - 1) * 10 + 1}-{pageNum * 10}）</span></h4>
                          <span className="rp-count">
                            {rankingTab === 'pages'
                              ? data.rankingDistribution.pageCounts['page' + pageNum]
                              : data.rankingDistribution.queryCounts['page' + pageNum]} 个{rankingTab === 'pages' ? '页面' : '搜索词'}
                          </span>
                        </div>
                        <div className="quadrant-table-wrapper">
                          {rankingTab === 'pages' ? (
                            <table>
                              <thead><tr><th>页面</th><th>排名</th><th>点击</th><th>展示</th><th>CTR</th></tr></thead>
                              <tbody>
                                {data.rankingDistribution.pages[pageNum].map((p: any) => (
                                  <tr key={p.page}>
                                    <td className="page-cell" title={p.fullValue}>{p.page}</td>
                                    <td><span className={`rank-badge rp-${pageNum}`}>{p.position.toFixed(1)}</span></td>
                                    <td>{p.clicks}</td>
                                    <td>{p.impressions}</td>
                                    <td>{(p.ctr * 100).toFixed(1)}%</td>
                                  </tr>
                                ))}
                                {!data.rankingDistribution.pages[pageNum].length && (
                                  <tr><td colSpan={5} className="empty-row">暂无数据</td></tr>
                                )}
                              </tbody>
                            </table>
                          ) : (
                            <table>
                              <thead><tr><th>搜索词</th><th>排名</th><th>点击</th><th>展示</th><th>CTR</th></tr></thead>
                              <tbody>
                                {data.rankingDistribution.queries[pageNum].map((q: any) => (
                                  <tr key={q.query}>
                                    <td className="query-cell">{q.query}</td>
                                    <td><span className={`rank-badge rp-${pageNum}`}>{q.position.toFixed(1)}</span></td>
                                    <td>{q.clicks}</td>
                                    <td>{q.impressions}</td>
                                    <td>{(q.ctr * 100).toFixed(1)}%</td>
                                  </tr>
                                ))}
                                {!data.rankingDistribution.queries[pageNum].length && (
                                  <tr><td colSpan={5} className="empty-row">暂无数据</td></tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 5: SEO 洞察 */}
          {gscSubTab === 'seo' && (
            <>
              {data.quadrantAnalysis && (
                <div className="quadrant-section">
                  <h3>页面四象限分析</h3>
                  <p className="quadrant-desc">
                    基于中位数动态划分（共 {data.quadrantAnalysis.totalPages} 个页面，
                    点击分界线: {data.quadrantAnalysis.thresholds.clicks}，
                    展示分界线: {data.quadrantAnalysis.thresholds.impressions}）
                  </p>

                  <div className="quadrant-grid">
                    {quadrantList.map(q => (
                      <div key={q.key} className={`quadrant-card ${q.cls}`}>
                        <div className="quadrant-header">
                          <span className="quadrant-icon">{q.icon}</span>
                          <div>
                            <h4>{q.title}</h4>
                            <span className="quadrant-count">{data.quadrantAnalysis.counts[q.key]} 个页面</span>
                          </div>
                        </div>
                        <p className="quadrant-advice">{q.advice}</p>
                        <div className="quadrant-table-wrapper">
                          <table>
                            <thead><tr><th>页面</th><th>点击</th><th>展示</th><th>CTR</th><th>排名</th></tr></thead>
                            <tbody>
                              {data.quadrantAnalysis[q.key].map((p: any) => (
                                <tr key={p.page}>
                                  <td className="page-cell" title={p.fullPage}>{p.page}</td>
                                  <td>{p.clicks}</td>
                                  <td>{p.impressions}</td>
                                  <td>{(p.ctr * 100).toFixed(1)}%</td>
                                  <td>{p.position.toFixed(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.insights && data.insights.length > 0 && (
                <div className="insights-section">
                  <h3>增长 / 下降洞察</h3>
                  <div className="insights-grid">
                    {data.insights.map((insight: any) => (
                      <div key={insight.type} className={`insight-card ${insight.type}`}>
                        <h4>{insight.title}</h4>
                        <ul>
                          {insight.items.map((item: any) => (
                            <li key={item.label}>
                              <span className="insight-label">{item.label}</span>
                              <span className="insight-metrics">
                                {item.growth !== undefined ? (
                                  <>
                                    <span className="growth-badge up">+{item.growth}%</span>
                                    <span className="metric-detail">{item.prevClicks} → {item.clicks}</span>
                                  </>
                                ) : item.change !== undefined ? (
                                  <>
                                    <span className="growth-badge down">{item.change}%</span>
                                    <span className="metric-detail">{item.prevClicks} → {item.clicks}</span>
                                  </>
                                ) : item.position !== undefined ? (
                                  <>
                                    <span className="position-badge">排名 {item.position.toFixed(1)}</span>
                                    <span className="metric-detail">{item.clicks} 次点击</span>
                                  </>
                                ) : (
                                  <span className="metric-detail">{item.clicks} 次点击 / {item.impressions} 次展示</span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 6: 变更分析 */}
          {gscSubTab === 'trend' && (
            <>
              {!data.trendAnalysis || data.trendAnalysis.periods < 2 ? (
                <div className="trend-empty-card">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h4>数据不足</h4>
                  <p>仅 1 次上传数据，需要至少 2 次数据才能进行变更分析。请再上传一份不同日期范围的 Excel 文件。</p>
                </div>
              ) : (
                <>
                  <div className="trend-scope-card">
                    <h3>分析范围</h3>
                    <p>对比最近 {data.trendAnalysis.periods} 个日期区间的数据变化：</p>
                    <div className="trend-periods">
                      {data.trendAnalysis.periodDetails.map((p: any, i: number) => (
                        <span key={i} className={`trend-period-tag ${i === 0 ? 'latest' : ''}`}>
                          {i === 0 ? '最新' : i === 1 ? '上期' : '更早'}：{p.dateFrom} ~ {p.dateTo}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="trend-metrics-grid">
                    <div className="trend-metric-card">
                      <div className="trend-metric-label">总点击</div>
                      <div className="trend-metric-value">{data.trendAnalysis.overallChanges.clicks.current.toLocaleString()}</div>
                      <div className={`trend-metric-change ${data.trendAnalysis.overallChanges.clicks.change >= 0 ? 'up' : 'down'}`}>
                        {data.trendAnalysis.overallChanges.clicks.change >= 0 ? '+' : ''}{data.trendAnalysis.overallChanges.clicks.change}%
                        <span className="trend-metric-prev">上期 {data.trendAnalysis.overallChanges.clicks.previous.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="trend-metric-card">
                      <div className="trend-metric-label">总展示</div>
                      <div className="trend-metric-value">{data.trendAnalysis.overallChanges.impressions.current.toLocaleString()}</div>
                      <div className={`trend-metric-change ${data.trendAnalysis.overallChanges.impressions.change >= 0 ? 'up' : 'down'}`}>
                        {data.trendAnalysis.overallChanges.impressions.change >= 0 ? '+' : ''}{data.trendAnalysis.overallChanges.impressions.change}%
                        <span className="trend-metric-prev">上期 {data.trendAnalysis.overallChanges.impressions.previous.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="trend-metric-card">
                      <div className="trend-metric-label">平均 CTR</div>
                      <div className="trend-metric-value">{(data.trendAnalysis.overallChanges.ctr.current * 100).toFixed(2)}%</div>
                      <div className={`trend-metric-change ${data.trendAnalysis.overallChanges.ctr.change >= 0 ? 'up' : 'down'}`}>
                        {data.trendAnalysis.overallChanges.ctr.change >= 0 ? '+' : ''}{data.trendAnalysis.overallChanges.ctr.change}%
                        <span className="trend-metric-prev">上期 {(data.trendAnalysis.overallChanges.ctr.previous * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="trend-metric-card">
                      <div className="trend-metric-label">平均排名</div>
                      <div className="trend-metric-value">{data.trendAnalysis.overallChanges.position.current.toFixed(1)}</div>
                      <div className={`trend-metric-change ${data.trendAnalysis.overallChanges.position.change <= 0 ? 'up' : 'down'}`}>
                        {data.trendAnalysis.overallChanges.position.change <= 0 ? '' : '+'}{data.trendAnalysis.overallChanges.position.change}%
                        <span className="trend-metric-prev">上期 {data.trendAnalysis.overallChanges.position.previous.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="trend-changes-grid">
                    {data.trendAnalysis.newQueries.length > 0 && (
                      <div className="trend-change-card new-queries">
                        <h4>新出现的搜索词</h4>
                        <ul>
                          {data.trendAnalysis.newQueries.map((q: any) => (
                            <li key={q.query}>
                              <span className="trend-item-label">{q.query}</span>
                              <span className="trend-item-metrics">
                                <span className="trend-badge new">新</span>
                                {q.clicks} 次点击
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.trendAnalysis.lostQueries.length > 0 && (
                      <div className="trend-change-card lost-queries">
                        <h4>消失的搜索词</h4>
                        <ul>
                          {data.trendAnalysis.lostQueries.map((q: any) => (
                            <li key={q.query}>
                              <span className="trend-item-label">{q.query}</span>
                              <span className="trend-item-metrics">
                                <span className="trend-badge lost">失</span>
                                {q.clicks} 次点击(上期)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.trendAnalysis.topRankChanges.length > 0 && (
                      <div className="trend-change-card rank-changes">
                        <h4>排名显著变化</h4>
                        <ul>
                          {data.trendAnalysis.topRankChanges.map((q: any) => (
                            <li key={q.query}>
                              <span className="trend-item-label">{q.query}</span>
                              <span className="trend-item-metrics">
                                <span className={`trend-badge ${q.change > 0 ? 'rank-up' : 'rank-down'}`}>
                                  {q.change > 0 ? '↑' : '↓'}{Math.abs(q.change).toFixed(1)}位
                                </span>
                                {q.previousPos.toFixed(1)} → {q.currentPos.toFixed(1)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.trendAnalysis.topPageChanges.length > 0 && (
                      <div className="trend-change-card page-changes">
                        <h4>页面点击变化 Top 5</h4>
                        <ul>
                          {data.trendAnalysis.topPageChanges.map((p: any) => (
                            <li key={p.fullPage}>
                              <span className="trend-item-label page-cell" title={p.fullPage}>{p.page}</span>
                              <span className="trend-item-metrics">
                                <span className={`trend-badge ${p.change >= 0 ? 'up' : 'down'}`}>
                                  {p.change >= 0 ? '+' : ''}{p.change}
                                </span>
                                {p.previousClicks} → {p.currentClicks}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.trendAnalysis.newPages.length > 0 && (
                      <div className="trend-change-card new-pages">
                        <h4>新增页面</h4>
                        <ul>
                          {data.trendAnalysis.newPages.map((p: any) => (
                            <li key={p.fullPage}>
                              <span className="trend-item-label page-cell" title={p.fullPage}>{p.page}</span>
                              <span className="trend-item-metrics">
                                <span className="trend-badge new">新</span>
                                {p.clicks} 次点击
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.trendAnalysis.lostPages.length > 0 && (
                      <div className="trend-change-card lost-pages">
                        <h4>消失的页面</h4>
                        <ul>
                          {data.trendAnalysis.lostPages.map((p: any) => (
                            <li key={p.fullPage}>
                              <span className="trend-item-label page-cell" title={p.fullPage}>{p.page}</span>
                              <span className="trend-item-metrics">
                                <span className="trend-badge lost">失</span>
                                {p.clicks} 次点击(上期)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* 导入历史 */}
          {data.importHistory && data.importHistory.length > 0 && (
            <div className="table-card import-history-section">
              <h3>导入历史</h3>
              {/* 桌面端表格 */}
              <div className="table-wrapper import-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>文件名</th>
                      <th>日期范围</th>
                      <th>每日</th>
                      <th>搜索词</th>
                      <th>页面</th>
                      <th>国家</th>
                      <th>设备</th>
                      <th>导入时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.importHistory.map((log: any) => (
                      <tr key={log.id}>
                        <td className="page-cell">{log.file_name}</td>
                        <td>{log.date_from} ~ {log.date_to}</td>
                        <td>{log.daily_rows}</td>
                        <td>{log.query_rows}</td>
                        <td>{log.page_rows}</td>
                        <td>{log.country_rows}</td>
                        <td>{log.device_rows}</td>
                        <td>{formatTime(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 移动端卡片 */}
              <div className="import-history-cards">
                {data.importHistory.map((log: any) => (
                  <div key={log.id} className="import-card">
                    <div className="import-card-header">
                      <span className="import-card-file">{log.file_name}</span>
                      <span className="import-card-time">{formatTime(log.created_at)}</span>
                    </div>
                    <div className="import-card-date">{log.date_from} ~ {log.date_to}</div>
                    <div className="import-card-stats">
                      <span>每日 <strong>{log.daily_rows}</strong></span>
                      <span>搜索词 <strong>{log.query_rows}</strong></span>
                      <span>页面 <strong>{log.page_rows}</strong></span>
                      <span>国家 <strong>{log.country_rows}</strong></span>
                      <span>设备 <strong>{log.device_rows}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {showPwdModal && (
        <div className="pwd-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="pwd-modal" onClick={e => e.stopPropagation()}>
            <h3>请输入上传密码</h3>
            <input
              type="password"
              className="pwd-input"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setPwdError(false); }}
              onKeyDown={e => e.key === 'Enter' && handlePwdConfirm()}
              autoFocus
              placeholder="请输入密码"
            />
            {pwdError && <p className="pwd-error">密码错误，请重试</p>}
            <div className="pwd-actions">
              <button className="pwd-cancel" onClick={() => setShowPwdModal(false)}>取消</button>
              <button className="pwd-confirm" onClick={handlePwdConfirm}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
