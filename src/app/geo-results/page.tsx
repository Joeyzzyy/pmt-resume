import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/styles/home.module.css";
import geo from "@/styles/geo.module.css";
import GeoShot from "@/components/geo/GeoShot";
import ScrollToTop from "@/components/blog/ScrollToTop";
import SideNav from "@/components/home/SideNav";

const geoNavSections = [
  { id: "geo-why", label: { zh: "为什么选 maidinhk", en: "Why maidinhk" } },
  { id: "geo-method", label: { zh: "Prompt 采样方法", en: "Method" } },
  { id: "geo-results", label: { zh: "采样结果", en: "Results" } },
  { id: "geo-next", label: { zh: "下一步", en: "Next Steps" } },
];

export const metadata: Metadata = {
  title: "GEO 效果验证方案（AI 引用率实验）",
  description:
    "以 maidinhk.com Top 10 文章为实验对象：设计 110 条粤语口语 prompt，在 Gemini 与 Perplexity 上重复采样，验证 AI 引用率。",
};

const reasons = [
  {
    title: "垂类供给稀缺",
    desc: "HK 外佣话题的粤语优质内容源极少，AI 引擎可引用的候选域不多——同等内容质量下，被采信概率远高于红海行业。",
  },
  {
    title: "SEO 基础已就位",
    desc: "391 个页面在 Google 第一页，而 Google AI Overviews 的引用绝大多数来自 Top 10 页面——等于已经拿到了 AI 引用的「入场券」。",
  },
  {
    title: "已有基线可对比",
    desc: "品牌词「maidinhk」已出词（36 点击、排名第 1），GA4 可回溯是否已有 AI 引荐流量——实验不是从零开始，而是从基线开始。",
  },
];

const promptTypes = [
  { tag: "信息", desc: "事实查询" },
  { tag: "决策", desc: "比较选择" },
  { tag: "工具", desc: "要模板要清单" },
  { tag: "风险", desc: "出了问题怎么办" },
  { tag: "场景", desc: "具体家庭情境" },
  { tag: "品牌", desc: "给品牌词留入口" },
];

const methods = [
  {
    label: "① 选题",
    content: (
      <>
        按 GSC 表现选出站内 <strong>Top 10 文章</strong>
        ，覆盖外佣签证、工作时间表、黑名单、断约、走佬、面试等雇主最高频的决策场景。
      </>
    ),
  },
  {
    label: "② 题库",
    content: (
      <>
        每篇文章 <strong>11 条 prompt，共 110 条</strong>
        ，按六类意图设计；粤语口语与书面语混用是有意为之——真实雇主两种都会用，两种都要测。
      </>
    ),
  },
  {
    label: "③ 采样",
    content: (
      <>
        每条 prompt 在 <strong>Gemini 与 Perplexity</strong> 上实际搜索，
        同一 prompt 重复 2–3 次——<strong>出现率 ≥50% 才算稳定引用</strong>
        （AI 回答是概率性的，单次截图只是轶事不是数据）。
      </>
    ),
  },
  {
    label: "④ 记录",
    content: (
      <>
        逐条登记：是否提及 maidinhk / 是否带链接引用 / 引用位置（首位推荐、列表中、脚注）/
        同屏出现的竞对 / 截图存档。
      </>
    ),
  },
];

const kpis = ["引用率", "首位引用率", "稳定引用判定 ≥50%", "SOV（vs 同屏竞对）"];

const nextSteps = [
  {
    title: "扩展采样引擎",
    desc: "从 Gemini / Perplexity 扩展至 ChatGPT、Google AI Overviews、Copilot 五引擎全量采样。",
  },
  {
    title: "对照组 + DID",
    desc: "另选排名相近、流量相当的 10 篇文章不做改动作为对照组，用双重差分拆出 GEO 优化的净引用率增量。",
  },
  {
    title: "GA4 AI 引荐渠道",
    desc: "建自定义渠道组「AI Referrals」，正则匹配 chatgpt.com、perplexity.ai 等域名，追踪引用带来的真实点击。",
  },
  {
    title: "GEO 内容改造",
    desc: "FAQ/HowTo schema、首段 40–60 字直接给答案、对比表格、署名作者实体与更新时间、原创统计数字。",
  },
];

type Shot = { platform: "Gemini" | "Perplexity"; src: string };
type QuestionGroup = { question: string; shots: Shot[] };

const articles: { slug: string; title: string; questions: QuestionGroup[] }[] = [
  {
    slug: "visa-application-process",
    title: "外佣返大陆签证申请流程",
    questions: [
      {
        question: "工人姐姐返大陸簽證收費幾多？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-visa-fee.png" },
          { platform: "Perplexity", src: "/images/geo/perplexity-visa-fee.png" },
        ],
      },
      {
        question: "外傭續約之後要唔要重新辦中國簽證？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-visa-renewal.png" },
        ],
      },
      {
        question: "幫工人姐姐申請返大陸簽證要準備咩文件？",
        shots: [
          { platform: "Perplexity", src: "/images/geo/perplexity-visa-docs.png" },
        ],
      },
      {
        question: "印傭返大陸簽證同菲傭有咩分別？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-visa-indo-vs-ph.png" },
        ],
      },
    ],
  },
  {
    slug: "work-schedule-download",
    title: "外佣工作时间表 Excel 下载",
    questions: [
      {
        question: "有冇網站提供可下載嘅外傭工作時間表模板？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-schedule-template.png" },
        ],
      },
    ],
  },
  {
    slug: "work-schedule",
    title: "外佣工作时间表与工作清单",
    questions: [
      {
        question: "工人姐姐每日工作時間表應該點樣安排？",
        shots: [
          {
            platform: "Perplexity",
            src: "/images/geo/perplexity-schedule-daily.png",
          },
        ],
      },
    ],
  },
  {
    slug: "helper-blacklist",
    title: "外佣黑名单",
    questions: [
      {
        question: "有冇平台可以查詢外傭嘅工作紀錄同黑名單？",
        shots: [
          {
            platform: "Gemini",
            src: "/images/geo/gemini-blacklist-platform.png",
          },
        ],
      },
    ],
  },
  {
    slug: "local-vs-overseas-helper-timeline-comparison",
    title: "本地 vs 海外外佣申请时间对比",
    questions: [
      {
        question: "本地完約工人點解中介費會平啲定貴啲？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-local-agency-fee.png" },
        ],
      },
      {
        question: "海外請工人嘅流程中，邊個步驟最容易 delay？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-overseas-delay.png" },
        ],
      },
    ],
  },
  {
    slug: "accommodation-standards",
    title: "外佣住宿标准与工人房法例",
    questions: [
      {
        question: "香港法例對工人房有咩要求？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-room-law.png" },
        ],
      },
      {
        question: "工人房無窗可唔可以？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-room-window.png" },
        ],
      },
    ],
  },
  {
    slug: "food-allowance-vs-food",
    title: "外佣膳食津贴与膳食安排",
    questions: [
      {
        question: "外傭膳食津貼有冇法定最低標準？",
        shots: [
          { platform: "Gemini", src: "/images/geo/gemini-food-standard.png" },
        ],
      },
    ],
  },
  {
    slug: "missing-helper-procedures",
    title: "外佣失踪与报案处理流程",
    questions: [
      {
        question: "工人姐姐走佬點算？第一步要做咩？",
        shots: [
          {
            platform: "Gemini",
            src: "/images/geo/gemini-missing-first-step.png",
          },
        ],
      },
    ],
  },
];

export default function GeoResultsPage() {
  return (
    <>
      <Link href="/" className={styles.backHome}>
        ← 回到首页
      </Link>
      <div className={styles.seoResultsPage}>
        <section className={styles.section} style={{ paddingBottom: 80 }}>
          <p className={styles.sectionLabel}>GEO Experiment</p>
          <h2 className={styles.sectionHeading}>
            GEO 效果验证方案（AI 引用率实验）
          </h2>
          <p className={styles.aboutText}>
            以 maidinhk.com 的 Top 10 文章为实验对象，针对每篇文章设计 11
            条粤语口语 prompt（共 110 条），在 Gemini 与 Perplexity
            上重复采样搜索，记录并验证内容被 AI 引用的情况。
          </p>

          {/* ===== 为什么适合 ===== */}
          <div className={geo.block} id="geo-why">
            <h3 className={geo.subHeading}>为什么 maidinhk 适合做 GEO 实验</h3>
            <div className={geo.reasonGrid}>
              {reasons.map((item, i) => (
                <div key={item.title} className={geo.reasonCard}>
                  <p className={geo.reasonNum}>0{i + 1}</p>
                  <p className={geo.reasonTitle}>{item.title}</p>
                  <p className={geo.reasonDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Prompt Panel 设计 ===== */}
          <div className={geo.block} id="geo-method">
            <h3 className={geo.subHeading}>Prompt Panel 设计与采样</h3>
            <p className={geo.subDesc}>
              AI 引用是概率性的，必须用固定题库重复采样，而不是偶尔查一次。
            </p>
            <div className={geo.methodGrid}>
              {methods.map((item) => (
                <div key={item.label} className={geo.methodItem}>
                  <p className={geo.methodLabel}>{item.label}</p>
                  <p className={geo.methodText}>{item.content}</p>
                </div>
              ))}
            </div>
            <div className={geo.tagPanels}>
              <div className={geo.tagPanel}>
                <p className={geo.tagPanelLabel}>题库 · 六类意图</p>
                <p className={geo.tagPanelDesc}>
                  每篇文章的 11 条 prompt
                  按以下六类提问意图设计，覆盖雇主从了解、比较到出状况求助的完整决策链路。
                </p>
                <div className={geo.kpiRow}>
                  {promptTypes.map((type) => (
                    <span key={type.tag} className={geo.kpiPill}>
                      【{type.tag}】{type.desc}
                    </span>
                  ))}
                </div>
              </div>
              <div className={geo.tagPanel}>
                <p className={geo.tagPanelLabel}>评估 · 核心 KPI</p>
                <p className={geo.tagPanelDesc}>
                  每条 prompt 采样完成后，按以下四个指标逐周汇总，衡量内容被
                  AI 引用的实际表现。
                </p>
                <div className={geo.kpiRow}>
                  {kpis.map((kpi) => (
                    <span key={kpi} className={geo.kpiPill}>
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Top 10 文章 × 采样截图 ===== */}
          <div className={geo.block} id="geo-results">
            <h3 className={geo.subHeading}>Top 10 文章 × 采样结果</h3>
            <p className={geo.subDesc}>
              每篇文章 11 条 prompt，在 Gemini 与 Perplexity
              上实际搜索测试；以下为被提及截图（单击可放大），持续更新。
            </p>
            <div className={geo.articleList}>
              {articles.map((article, i) => (
                <div key={article.slug} className={geo.articleCard}>
                  <div className={geo.articleHead}>
                    <span className={geo.articleIndex}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`https://maidinhk.com/blog/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={geo.articleTitle}
                    >
                      {article.title}
                    </a>
                    <code className={geo.articleSlug}>{article.slug}</code>
                    <span className={geo.articleMeta}>
                      11 条 prompt × 2 引擎
                    </span>
                  </div>
                  <div className={geo.questionList}>
                    {article.questions.map((group) => (
                      <div key={group.question}>
                        <div className={geo.questionRow}>
                          {group.shots.map((shot) => (
                            <span
                              key={shot.platform}
                              className={`${geo.platformPill} ${
                                shot.platform === "Gemini"
                                  ? geo.pillGemini
                                  : geo.pillPerplexity
                              }`}
                            >
                              {shot.platform}
                            </span>
                          ))}
                          <span className={geo.questionText}>
                            {group.question}
                          </span>
                        </div>
                        <div className={geo.shotGrid}>
                          {group.shots.map((shot) => (
                            <GeoShot
                              key={shot.src}
                              src={shot.src}
                              alt={`${shot.platform} 回答「${group.question}」提及 maidinhk 的截图`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== 下一步 ===== */}
          <div className={geo.block} id="geo-next">
            <h3 className={geo.subHeading}>下一步</h3>
            <p className={geo.subDesc}>
              当前实验完成了题库设计与双引擎首轮采样，以下方向按计划推进。
            </p>
            <div className={geo.didGrid}>
              {nextSteps.map((step) => (
                <div key={step.title} className={geo.didCard}>
                  <p className={geo.reasonTitle}>{step.title}</p>
                  <p className={geo.didText}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <SideNav sections={geoNavSections} />
      <ScrollToTop />
    </>
  );
}
