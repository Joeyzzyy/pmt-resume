"use client";

import { useState } from "react";
import styles from "@/styles/home.module.css";
import ScrollReveal from "@/components/resume/ScrollReveal";
import HoverTooltip, { getTooltipPlacement, type TooltipPlacement } from "@/components/home/HoverTooltip";

const pages = {
  blacklist: {
    title: "外佣黑名单",
    href: "https://maidinhk.com/blog/helper-blacklist",
  },
  visa: {
    title: "外佣返大陆签证申请流程",
    href: "https://maidinhk.com/blog/visa-application-process",
  },
  schedule: {
    title: "外佣工作时间表与工作清单",
    href: "https://maidinhk.com/blog/work-schedule",
  },
  download: {
    title: "外佣工作时间表 Excel 下载",
    href: "https://maidinhk.com/blog/work-schedule-download",
  },
  interview: {
    title: "本地外佣面试 10 问",
    href: "https://maidinhk.com/blog/local-helper-interview-guide-10-questions",
  },
  accommodation: {
    title: "外佣住宿标准与工人房法例",
    href: "https://maidinhk.com/blog/accommodation-standards",
  },
  minimumWage: {
    title: "外佣最低工资与聘用预算",
    href: "https://maidinhk.com/blog/minimum-wage-and-budget",
  },
  seniorDay: {
    title: "长者日优惠与活动指南",
    href: "https://maidinhk.com/blog/senior-citizens-day",
  },
  food: {
    title: "外佣膳食津贴与膳食安排",
    href: "https://maidinhk.com/blog/food-allowance-vs-food",
  },
  consulate: {
    title: "外佣合约领事馆认证与预约",
    href: "https://maidinhk.com/blog/consulate-contract-verification",
  },
  visaId: {
    title: "外佣签证 ID988A 表格指南",
    href: "https://maidinhk.com/blog/visa-application-id988a",
  },
  salary: {
    title: "菲佣与印佣薪资成本对比",
    href: "https://maidinhk.com/blog/filipino-vs-indonesian-salary-cost",
  },
  sunshine: {
    title: "阳光女佣评价与服务分析",
    href: "https://maidinhk.com/blog/sunshine-maid-review-audit",
  },
  breakContract: {
    title: "断约外佣聘用与留港指南",
    href: "https://maidinhk.com/blog/hiring-break-contract-helper",
  },
  experience: {
    title: "本地与海外外佣经验对比",
    href: "https://maidinhk.com/blog/local-vs-overseas-helper-experience-comparison",
  },
  timeline: {
    title: "本地 vs 海外外佣申请时间对比",
    href: "https://maidinhk.com/blog/local-vs-overseas-helper-timeline-comparison",
  },
  recipes: {
    title: "外佣烹饪与口味适应指南",
    href: "https://maidinhk.com/blog/helper-cooking-taste",
  },
  debt: {
    title: "外佣欠债处理指南",
    href: "https://maidinhk.com/blog/helper-debt-collection",
  },
};

const queries = [
  { name: "外傭黑名單", clicks: "416", position: "3.9", page: pages.blacklist },
  { name: "工人姐姐返大陸簽證收費", clicks: "264", position: "4.9", page: pages.visa },
  { name: "工人姐姐黑名單", clicks: "249", position: "3.7", page: pages.blacklist },
  { name: "工人黑名單", clicks: "209", position: "4.4", page: pages.blacklist },
  { name: "工人姐姐工作清單", clicks: "148", position: "4.5", page: pages.schedule },
  { name: "工人姐姐工作時間表", clicks: "140", position: "3.5", page: pages.schedule },
  { name: "工人姐姐時間表", clicks: "119", position: "3.2", page: pages.schedule },
  { name: "工人工作時間表", clicks: "112", position: "3.9", page: pages.schedule },
  { name: "入境處blacklist工人", clicks: "105", position: "1.7", page: pages.blacklist },
  { name: "印傭每日工作表", clicks: "99", position: "4.3", page: pages.schedule },
  { name: "印傭工作時間表excel", clicks: "95", position: "3.8", page: pages.download },
  { name: "菲傭工作時間表excel", clicks: "86", position: "3.5", page: pages.download },
  { name: "工人姐姐返大陸簽證多次", clicks: "78", position: "4.1", page: pages.visa },
  { name: "菲傭面試問題英文", clicks: "73", position: "9.6", page: pages.interview },
  { name: "工人姐姐返大陸簽證代辦", clicks: "59", position: "7.3", page: pages.visa },
  { name: "工人時間表excel", clicks: "55", position: "3.0", page: pages.download },
  { name: "工人房法例", clicks: "55", position: "3.7", page: pages.accommodation },
  { name: "外傭工作時間表excel", clicks: "54", position: "3.6", page: pages.download },
  { name: "工人姐姐時間表excel", clicks: "52", position: "2.5", page: pages.download },
  { name: "菲傭黑名單", clicks: "50", position: "3.3", page: pages.blacklist },
  { name: "外傭最低工資2026", clicks: "91", position: "6.6", page: pages.minimumWage },
  { name: "長者日2026", clicks: "88", position: "5.5", page: pages.seniorDay },
  { name: "外傭欠債如何處理", clicks: "65", position: "8.6", page: pages.debt },
  { name: "id988a", clicks: "44", position: "7.6", page: pages.visaId },
  { name: "外傭膳食津貼", clicks: "44", position: "5.8", page: pages.food },
  { name: "菲律賓領事館網上預約", clicks: "42", position: "8.0", page: pages.consulate },
  { name: "工人姐姐返大陸簽證申請表", clicks: "35", position: "7.1", page: pages.visa },
  { name: "外傭工作表", clicks: "33", position: "7.5", page: pages.schedule },
  { name: "工人姐姐返大陸簽證", clicks: "32", position: "6.2", page: pages.visa },
  { name: "工人房", clicks: "31", position: "7.0", page: pages.accommodation },
  { name: "外傭中國旅遊簽證", clicks: "29", position: "6.3", page: pages.visa },
  { name: "印傭人工", clicks: "28", position: "6.1", page: pages.salary },
  { name: "工人姐姐人工2026", clicks: "28", position: "6.7", page: pages.minimumWage },
  { name: "陽光女傭好唔好", clicks: "28", position: "7.4", page: pages.sunshine },
  { name: "外傭提早解約原因", clicks: "27", position: "6.7", page: pages.breakContract },
  { name: "印尼姐姐返大陸", clicks: "27", position: "6.6", page: pages.visa },
  { name: "請工人心得", clicks: "26", position: "6.9", page: pages.experience },
  { name: "工人姐姐返大陸", clicks: "26", position: "6.8", page: pages.visa },
  { name: "工人中國簽證", clicks: "26", position: "6.0", page: pages.visa },
  { name: "工人姐姐返大陸簽證預約", clicks: "25", position: "6.1", page: pages.visa },
  { name: "工人膳食津貼", clicks: "24", position: "5.3", page: pages.food },
  { name: "中旅社外傭簽證收費", clicks: "23", position: "5.7", page: pages.visa },
  { name: "菲傭申請中國簽證", clicks: "22", position: "5.7", page: pages.visa },
  { name: "工人姐姐返大陸簽證網上申請", clicks: "22", position: "6.8", page: pages.visa },
  { name: "請本地完約工人手續", clicks: "22", position: "7.2", page: pages.timeline },
  { name: "菲律賓入境中國簽證費用", clicks: "22", position: "7.8", page: pages.visa },
  { name: "工人姐姐 工作時間表", clicks: "21", position: "6.5", page: pages.schedule },
  { name: "工人姐姐中國簽證", clicks: "21", position: "6.4", page: pages.visa },
  { name: "外傭申請中國簽證", clicks: "21", position: "6.3", page: pages.visa },
  { name: "工人姐姐食譜", clicks: "21", position: "8.8", page: pages.recipes },
];

export default function QuerySea() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [placement, setPlacement] = useState<TooltipPlacement>({ align: "center", side: "below" });

  const showQuery = (index: number, element: HTMLElement) => {
    setPlacement(getTooltipPlacement(element));
    setActiveIndex(index);
  };

  return (
    <ScrollReveal>
      <section
        id="keyword-sea"
        className={styles.querySeaModule}
        aria-labelledby="query-sea-heading"
        onKeyDown={(event) => {
          if (event.key === "Escape") setActiveIndex(null);
        }}
      >
        <p className={styles.sectionLabel}>Keyword Sea</p>
        <h2 className={styles.popularHeading} id="query-sea-heading">
          Keyword词海
        </h2>
        <p className={styles.querySeaNote}>
          词海保留 20 个核心词，并补充 30 个 Google 第 6–10 位的高点击词，共 50 个；
          <br />
          补充词按 2026.01.09–11.08 历史累计点击排序，页面归属按主题匹配。
          <br />
          注：数据源仅含 GSC 网页版导出的前 1,000 条 Query，并非全量关键词，不等同于全站完整查询词排行。
        </p>

        <div className={styles.querySeaCloud} role="group" aria-label="热门搜索词词海">
          {queries.map((query, index) => {
            const active = activeIndex === index;
            const sizeClass = index < 5
              ? styles.queryWordLarge
              : index < 10
                ? styles.queryWordMedium
                : styles.queryWordSmall;

            return (
              <div className={`${styles.querySeaItem} ${active ? styles.querySeaItemActive : ""}`} key={query.name}>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(query.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.queryWord} ${sizeClass} ${active ? styles.queryWordActive : ""}`}
                  aria-label={`在 Google 搜索「${query.name}」（新窗口打开）`}
                  aria-expanded={active}
                  aria-controls={`query-tooltip-${index}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") showQuery(index, event.currentTarget);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") setActiveIndex(null);
                  }}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible")) showQuery(index, event.currentTarget);
                  }}
                >
                  {query.name}
                </a>
                {active && (
                  <HoverTooltip
                    id={`query-tooltip-${index}`}
                    eyebrow={`Keyword #${index + 1}`}
                    title={query.name}
                    placement={placement}
                    onClose={() => setActiveIndex(null)}
                  >
                    <dl className={styles.hoverTooltipStats}>
                      <div><dt>累计点击</dt><dd>{query.clicks}</dd></div>
                      <div><dt>GSC 平均排名</dt><dd>#{query.position}</dd></div>
                    </dl>
                    <a className={styles.hoverTooltipLink} href={query.page.href} target="_blank" rel="noopener noreferrer">
                      {query.page.title} ↗
                    </a>
                    <small className={styles.hoverTooltipNote}>主题匹配，非该页唯一来源词。</small>
                  </HoverTooltip>
                )}
              </div>
            );
          })}
        </div>
        <p className={styles.querySeaHint}>
          点击词汇在新窗口打开 Google 搜索结果 · 桌面悬停查看数据 · 离开词汇或按 Esc 收起浮层
        </p>
      </section>
    </ScrollReveal>
  );
}
