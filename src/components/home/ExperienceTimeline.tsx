"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/home.module.css";
import experiencesEn from "@/data/experiencesEn";
import { useLanguage } from "@/components/layout/LanguageProvider";

const experienceLabels = {
  zh: {
    current: "当前阶段",
    work: "工作内容",
    results: "关键业绩",
    cta: "查看 SEO 成果 →",
    ctaGeo: "查看 GEO 成果 →",
  },
  en: {
    current: "Current",
    work: "What I Do",
    results: "Key Results",
    cta: "View SEO Results →",
    ctaGeo: "View GEO Results →",
  },
};

interface Experience {
  id: string;
  company: string;
  short: string;
  role: string;
  period: string;
  current?: boolean;
  summary: string;
  details: string[];
  results: string[];
}

const experiences: Experience[] = [
  {
    id: "shengying",
    company: "声影动漫科技有限公司",
    short: "声影动漫",
    role: "新媒体运营",
    period: "2020.09 — 2021.02",
    summary: "双微运营 · 短视频策划 · 线上拉新活动",
    details: [
      "负责项目双微内容运营：涨粉、互动与日常维护，独立完成文案撰写、文章输出与海报制作",
      "策划并执行线上拉新活动与产品宣传推广，对接渠道、后台开发与合作 KOL",
      "负责活动预算申报、效果预估与效果监控，根据活动数据跟踪分析并复盘",
      "策划短视频平台运营方案，对接渠道与制作团队，监督方案落地执行",
    ],
    results: [
      "推动产品在小鹅通、万达宝贝王、优课库、爱奇艺、喜马拉雅等平台上线",
      "策划 H5 线上拉新活动，公众号涨粉 3,000+",
    ],
  },
  {
    id: "tesla",
    company: "特斯拉汽车（北京）有限公司",
    short: "特斯拉",
    role: "新媒体运营",
    period: "2021.04 — 2024.12",
    summary: "百万级官方新媒体矩阵 · 舆情监控 · 用户反馈闭环",
    details: [
      "负责 Tesla 中国官方新媒体矩阵运营：微博、抖音、小红书等平台的内容运营、用户互动及品牌传播",
      "负责线上舆情监控与用户反馈管理，覆盖微博、抖音、小红书、懂车帝、汽车之家、知乎、市监局、黑猫投诉等平台，识别用户关注问题及潜在风险",
      "建立用户反馈收集机制，持续分析用户对车辆功能、软件更新及服务体验的需求，反馈至产品研发及业务团队，推动产品与用户体验优化",
      "支持 Tesla 微信公众号、官方企微、CRM 及市场营销活动运营，协助提升用户沟通效率及品牌影响力",
    ],
    results: [
      "覆盖 8+ 主流社交媒体、汽车垂媒及用户反馈渠道，沉淀用户洞察，为内容策略及品牌传播提供依据",
      "累计跟进 2,000+ 用户反馈及潜在风险事件，建立「舆情发现—风险判断—跨部门协同—问题闭环」机制",
      "协调客服、售后、产品、研发、市场等 5+ 业务团队推进问题解决，维护品牌声誉及用户体验",
    ],
  },
  {
    id: "sikao",
    company: "Gap Year · 备战司法考试",
    short: "司法考试",
    role: "职业探索与转型",
    period: "2025.01 — 2025.11",
    summary: "逻辑思维训练 · 锁定出海 SEO 赛道",
    details: [
      "系统备战国家统一法律职业资格考试，高强度训练逻辑思维与信息检索能力",
      "职业探索期接触 AI 浪潮下的 SaaS 产品出海赛道，系统学习出海营销全套方法论",
      "在 SEO、SEM、红人营销、社媒营销、社群营销等方向中，选定 SEO 与 Reddit 运营作为主战场深入学习",
    ],
    results: [],
  },
  {
    id: "zuoyoushou",
    company: "香港左右手有限公司",
    short: "香港左右手",
    role: "SEO",
    period: "2025.12 — 至今",
    current: true,
    summary: "独立站 0-1 冷启动 · 关键词集群 · 数据驱动增长",
    details: [
      "自动化数据链路：用 Node.js 自研数据同步脚本，打通 Google Search Console API 与 Supabase，实现 7,000+ 核心关键词指标的结构化存储与实时监控，数据分析效率提升 80%",
      "关键词策略与集群构建：用 Semrush 建立「母词拆解」模型，对核心类目维度聚类，挖掘 500+ 高流量低竞争长尾词，构建主题集群增强站点 E-E-A-T",
      "AI 驱动的内容工程化：结合 Gemini 与 Perplexity 深度解析香港劳工处等官方政策，产出 400+ 篇具备权威背书的专业文章，通过 Contentful 实现跨平台敏捷发布",
      "搜索意图优化与 CTR 提升：通过 GSC 曝光数据反向审计用户真实搜索意图，用 QuickCreator 与 YouMind 对存量页面做 TDK A/B 测试，优化搜索结果页视觉呈现",
      "技术 SEO 审计与收录管理：优化 Sitemap、Canonical Tags 及内链架构，解决页面重复与抓取异常，新增内容 24 小时内被 Google 快速收录",
      "竞品情报与策略复盘：定期对标同领域头部站点做流量猎取分析，识别竞品未覆盖的功能盲区，动态调整内容分发节奏",
    ],
    results: [
      "零成本冷启动：新域名零权重、零外链、零付费推广，纯内容策略 3 个月实现月曝光 89,000+、月点击 2,700+",
      "关键词霸屏：8 个词进入 Top 5，174 个词进入 Top 10，近 270 个首页关键词构建完整内容集群",
      "CTR 极致优化：核心文章 CTR 10%+，高意向页面 CTR 22%+，超行业均值 5 倍",
      "技术 SEO 落地：页面收录率 95%，通过 Contentful + Next.js 构建高性能内容站点",
    ],
  },
];

const VB_W = 1200;
const VB_H = 720;
// 一条线：左下角（最早）蜿蜒升至右上角（最新）
const ROAD_D =
  "M 580 690 C 530 660 620 640 595 600 C 570 555 670 540 660 480 C 650 430 560 420 545 365 C 535 325 620 325 645 280 C 670 245 635 190 655 140";
const NODE_T = [0.1, 0.36, 0.62, 0.92];
const CARD_POS: React.CSSProperties[] = [
  { left: 140, bottom: 0 },
  { right: 0, bottom: 40 },
  { left: 140, top: 170 },
  { right: 0, top: 16 },
];
const CARD_SIDE = ["sm", "lg", "sm", "lg"] as const;

const timeline = experiences;
const CURRENT_IDX = Math.max(0, timeline.findIndex((e) => e.current));
const SAMPLE_COUNT = 320;

type Pt = { x: number; y: number };

export default function ExperienceTimeline() {
  const { locale } = useLanguage();
  const labels = experienceLabels[locale];
  const timeline: Experience[] = locale === "zh" ? experiences : experiencesEn;
  const pathRef = useRef<SVGPathElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [nodePts, setNodePts] = useState<Pt[]>([]);
  const [charPt, setCharPt] = useState<Pt | null>(null);
  const [charIdx, setCharIdx] = useState(CURRENT_IDX);
  const charIdxRef = useRef(CURRENT_IDX);
  const samplesRef = useRef<Pt[]>([]);

  // 计算节点坐标与路径采样点
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    samplesRef.current = Array.from({ length: SAMPLE_COUNT }, (_, i) => {
      const p = path.getPointAtLength((i / (SAMPLE_COUNT - 1)) * len);
      return { x: p.x, y: p.y };
    });
    const pts = NODE_T.map((t) => {
      const p = path.getPointAtLength(len * t);
      return { x: p.x, y: p.y };
    });
    setNodePts(pts);
    setCharPt(pts[CURRENT_IDX]);
  }, []);

  const moveCharTo = useCallback(
    (idx: number) => {
      if (!nodePts.length) return;
      charIdxRef.current = idx;
      setCharIdx(idx);
      setCharPt(nodePts[idx]);
    },
    [nodePts]
  );

  // 光标移动：人物沿小路走到离光标最近的路面点，信息卡切换到最近节点
  // 悬停在卡片上时锁定激活状态，光标在卡片上移动不再切换（保证 CTA 可点击）
  const hoverLockRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoverLockRef.current !== null) return;
    const stage = stageRef.current;
    const samples = samplesRef.current;
    if (!stage || !samples.length) return;
    const r = stage.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * VB_W;
    const vy = ((e.clientY - r.top) / r.height) * VB_H;
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const dx = samples[i].x - vx;
      const dy = samples[i].y - vy;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    const t = bi / (SAMPLE_COUNT - 1);
    const pt = samples[bi];
    setCharPt((prev) =>
      prev && Math.hypot(prev.x - pt.x, prev.y - pt.y) < 4 ? prev : pt
    );
    let ni = 0;
    let nd = Infinity;
    NODE_T.forEach((nt, i) => {
      const d = Math.abs(nt - t);
      if (d < nd) {
        nd = d;
        ni = i;
      }
    });
    if (ni !== charIdxRef.current) {
      charIdxRef.current = ni;
      setCharIdx(ni);
    }
  };

  return (
    <div className={styles.roadWrap} onMouseMove={handleMouseMove}>
      <div ref={stageRef} className={styles.roadStage}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={styles.roadSvg}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d={ROAD_D}
            className={styles.roadLine}
            fill="none"
          />
          {/* 路的尽头：省略号，未完待续 */}
          <circle cx={668} cy={124} r={4.5} className={styles.roadTailDot} />
          <circle cx={677} cy={110} r={3.5} className={styles.roadTailDot2} />
          <circle cx={684} cy={96} r={2.5} className={styles.roadTailDot3} />
          {/* 节点 */}
          {nodePts.map((p, i) => (
            <g
              key={timeline[i].id}
              className={styles.roadNodeG}
              onClick={() => moveCharTo(i)}
            >
              {charIdx === i && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={10}
                  className={styles.roadDotPulse}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={9}
                className={`${styles.roadDot} ${
                  timeline[i].current ? styles.roadDotCurrent : ""
                } ${charIdx === i ? styles.roadDotActive : ""}`}
              />
            </g>
          ))}
        </svg>

        {/* 人物 */}
        {charPt && (
          <div
            className={styles.character}
            style={{
              left: `${(charPt.x / VB_W) * 100}%`,
              top: `${(charPt.y / VB_H) * 100}%`,
            }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/character.png"
              alt=""
              className={styles.characterImg}
            />
          </div>
        )}
      </div>

      {/* 路两侧的信息卡 */}
      <div className={styles.roadCards}>
        {nodePts.length > 0 &&
          timeline.map((exp, i) => {
            const active = charIdx === i;
            return (
              <div
                key={exp.id}
                className={`${styles.roadCard} ${
                  CARD_SIDE[i] === "sm" ? styles.roadCardSm : styles.roadCardLg
                } ${active ? styles.roadCardActive : ""} ${
                  exp.current ? styles.roadCardCurrent : ""
                }`}
                style={CARD_POS[i]}
                onClick={() => moveCharTo(i)}
                onMouseEnter={() => {
                  hoverLockRef.current = i;
                  moveCharTo(i);
                }}
                onMouseLeave={() => {
                  hoverLockRef.current = null;
                }}
              >
                <div className={styles.roadCardHead}>
                  <span className={styles.roadCardCompany}>{exp.company}</span>
                  <span className={styles.roadCardPeriod}>{exp.period}</span>
                </div>
                <div className={styles.roadCardRoleRow}>
                  <span className={styles.roadCardRole}>{exp.role}</span>
                  {exp.current && (
                    <span className={styles.roadBadge}>{labels.current}</span>
                  )}
                </div>
                <p className={styles.roadCardSummary}>{exp.summary}</p>

                <div
                  className={`${styles.roadCardDetails} ${
                    active ? styles.roadCardDetailsOpen : ""
                  }`}
                >
                  <div className={styles.roadCardDetailsInner}>
                    <div className={styles.roadCardScroll}>
                      <p className={styles.roadBlockTitle}>{labels.work}</p>
                      <ul className={styles.roadList}>
                        {exp.details.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ul>
                      {exp.results.length > 0 && (
                        <>
                          <p className={styles.roadBlockTitle}>{labels.results}</p>
                          <ul className={styles.roadList}>
                            {exp.results.map((r0, j) => (
                              <li key={j}>{r0}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {exp.id === "zuoyoushou" && (
                        <div className={styles.expCtaWrap}>
                          <Link href="/seo-results" className={styles.expCta}>
                            {labels.cta}
                          </Link>
                          <Link href="/geo-results" className={styles.expCta}>
                            {labels.ctaGeo}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
