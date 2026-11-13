"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/home.module.css";
import ScrollReveal from "@/components/resume/ScrollReveal";
import HoverTooltip, { getTooltipPlacement, type TooltipPlacement } from "@/components/home/HoverTooltip";

const pages = [
  {
    title: "外佣返大陆签证申请流程",
    href: "https://maidinhk.com/blog/visa-application-process",
    clicks: 4057,
    impressions: 100394,
    ctr: "4.04%",
    position: "6.6",
    keywords: ["工人姐姐返大陸簽證收費", "工人姐姐返大陸簽證多次", "工人姐姐返大陸簽證代辦", "外傭中國旅遊簽證", "菲傭申請中國簽證"],
  },
  {
    title: "外佣工作时间表 Excel 下载",
    href: "https://maidinhk.com/blog/work-schedule-download",
    clicks: 2464,
    impressions: 23547,
    ctr: "10.46%",
    position: "5.7",
    keywords: ["印傭工作時間表excel", "菲傭工作時間表excel", "工人時間表excel", "外傭工作時間表excel", "工人姐姐時間表excel"],
    note: "CTR 10.46%，约为全站均值 3.68% 的 2.8 倍。",
  },
  {
    title: "外佣工作时间表与工作清单",
    href: "https://maidinhk.com/blog/work-schedule",
    clicks: 2443,
    impressions: 26833,
    ctr: "9.10%",
    position: "5.4",
    keywords: ["工人姐姐工作清單", "工人姐姐工作時間表", "工人姐姐時間表", "工人工作時間表", "印傭每日工作表"],
    note: "时间表 / 工作清单两篇合计 4,907 点击。",
  },
  {
    title: "外佣黑名单",
    href: "https://maidinhk.com/blog/helper-blacklist",
    clicks: 2412,
    impressions: 24383,
    ctr: "9.89%",
    position: "4.7",
    keywords: ["外傭黑名單", "工人姐姐黑名單", "工人黑名單", "入境處blacklist工人", "菲傭黑名單"],
  },
  {
    title: "本地 vs 海外外佣申请时间对比",
    href: "https://maidinhk.com/blog/local-vs-overseas-helper-timeline-comparison",
    clicks: 1078,
    impressions: 24936,
    ctr: "4.32%",
    position: "8.8",
    keywords: ["請工人要幾耐", "請本地完約工人手續", "請印傭要幾耐", "本地完約工人"],
  },
  {
    title: "外佣住宿标准与工人房法例",
    href: "https://maidinhk.com/blog/accommodation-standards",
    clicks: 992,
    impressions: 13960,
    ctr: "7.11%",
    position: "7.1",
    keywords: ["工人房法例", "工人房", "香港工人房", "工人房無窗"],
  },
  {
    title: "外佣膳食津贴与膳食安排",
    href: "https://maidinhk.com/blog/food-allowance-vs-food",
    clicks: 984,
    impressions: 26064,
    ctr: "3.78%",
    position: "5.3",
    keywords: ["外傭膳食津貼", "外傭膳食津貼2026", "工人膳食津貼", "外傭膳食津貼每日"],
  },
  {
    title: "断约外佣聘用与留港指南",
    href: "https://maidinhk.com/blog/hiring-break-contract-helper",
    clicks: 871,
    impressions: 16439,
    ctr: "5.30%",
    position: "6.7",
    keywords: ["斷約工人留港", "外傭提早解約原因", "斷約工人", "請斷約工人手續"],
  },
  {
    title: "外佣失踪与报案处理流程",
    href: "https://maidinhk.com/blog/missing-helper-procedures",
    clicks: 816,
    impressions: 9070,
    ctr: "9.00%",
    position: "4.9",
    keywords: ["工人走佬", "工人姐姐走佬", "工人失蹤網上報案", "姐姐走佬"],
  },
  {
    title: "本地外佣面试 10 问",
    href: "https://maidinhk.com/blog/local-helper-interview-guide-10-questions",
    clicks: 795,
    impressions: 14062,
    ctr: "5.65%",
    position: "7.2",
    keywords: ["菲傭面試問題英文", "工人面試英文問題", "面試工人姐姐問題", "工人姐姐interview問題英文"],
  },
];

const maxClicks = pages[0].clicks;

export default function PopularPagesChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [placement, setPlacement] = useState<TooltipPlacement>({ align: "center", side: "below" });

  const showPage = (index: number, element: HTMLElement) => {
    setPlacement(getTooltipPlacement(element));
    setActiveIndex(index);
  };

  return (
    <ScrollReveal>
      <section
        id="popular-pages"
        className={styles.popularSection}
        aria-labelledby="popular-content-heading"
        onKeyDown={(event) => {
          if (event.key === "Escape") setActiveIndex(null);
        }}
      >
        <p className={styles.sectionLabel}>Top Content</p>
        <h2 className={styles.popularHeading} id="popular-content-heading">
          热门页面 Top 10
        </h2>
        <p className={styles.querySeaNote}>
          按 2026.01.09–11.08 已汇总 GSC 报表的累计点击排序，取前 10 个页面；
          <br />
          页面数据仅覆盖当前已汇总报表，并非全站实时完整数据，不等同于全站完整页面排行。
          <br />
          注：出词数据仅含 GSC 网页版导出的前 1,000 条 Query，不代表完整词表；页面与词汇的对应关系按主题匹配。
        </p>

        <ol className={styles.pageBarChart}>
          {pages.map((page, index) => {
            const active = activeIndex === index;

            return (
              <li className={styles.pageBarItem} key={page.href}>
                <span className={styles.pageBarRank}>{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.pageBarContent}>
                  <div className={styles.pageBarKeywords}>
                    <span>出词</span>
                    {page.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
                  </div>
                  <div className={styles.pageBarHeader}>
                    <div className={styles.pageBarTitleWrap}>
                      <button
                        type="button"
                        className={styles.pageBarTitle}
                        aria-expanded={active}
                        aria-controls={`page-tooltip-${index}`}
                        onPointerEnter={(event) => {
                          if (event.pointerType === "mouse") showPage(index, event.currentTarget);
                        }}
                        onPointerLeave={(event) => {
                          if (event.pointerType === "mouse") setActiveIndex(null);
                        }}
                        onFocus={(event) => {
                          if (event.currentTarget.matches(":focus-visible")) showPage(index, event.currentTarget);
                        }}
                        onClick={(event) => {
                          if (active) setActiveIndex(null);
                          else showPage(index, event.currentTarget);
                        }}
                      >
                        {page.title}
                      </button>
                      {active && (
                        <HoverTooltip
                          id={`page-tooltip-${index}`}
                          eyebrow={`热门页面 #${index + 1}`}
                          title={page.title}
                          placement={placement}
                          onClose={() => setActiveIndex(null)}
                        >
                          <dl className={styles.hoverTooltipStats}>
                            <div><dt>累计点击</dt><dd>{page.clicks.toLocaleString("en-US")}</dd></div>
                            <div><dt>累计曝光</dt><dd>{page.impressions.toLocaleString("en-US")}</dd></div>
                            <div><dt>CTR</dt><dd>{page.ctr}</dd></div>
                            <div><dt>平均排名</dt><dd>#{page.position}</dd></div>
                          </dl>
                          <a className={styles.hoverTooltipLink} href={page.href} target="_blank" rel="noopener noreferrer">
                            访问页面 ↗
                          </a>
                        </HoverTooltip>
                      )}
                    </div>
                    <strong className={styles.pageBarClicks}>{page.clicks.toLocaleString("en-US")} 点击</strong>
                  </div>
                  <div className={styles.pageBarTrack} aria-hidden="true">
                    <span style={{ width: `${(page.clicks / maxClicks) * 100}%` }} />
                  </div>
                  {page.note && <p className={styles.popularDataNote}>{page.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.expCtaWrap}>
          <Link href="/geo-results" className={styles.expCta}>
            查看GEO实验 →
          </Link>
        </div>
      </section>
    </ScrollReveal>
  );
}
