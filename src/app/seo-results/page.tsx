import type { Metadata } from "next";
import Link from "next/link";
import KeyResults from "@/components/home/KeyResults";
import SideNav from "@/components/home/SideNav";
import ScrollToTop from "@/components/blog/ScrollToTop";
import styles from "@/styles/home.module.css";

const sections = [
  { id: "two-phases", label: { zh: "两个阶段", en: "两个阶段" } },
  { id: "popular-pages", label: { zh: "热门页面 Top 10", en: "热门页面 Top 10" } },
  { id: "keyword-sea", label: { zh: "Keyword词海", en: "Keyword词海" } },
];

export const metadata: Metadata = {
  title: "SEO 成果 — 用数据说话",
  description:
    "maidinhk.com 自建站以来的真实 SEO 数据：零外链、零预算，累计曝光 102 万+；前 3 个月从零到 Google 首页，停更后通过诊断修复实现增长反转。",
};

export default function SeoResultsPage() {
  return (
    <>
      <SideNav sections={sections} />
      <Link href="/" className={styles.backHome}>
        ← 回到首页
      </Link>
      <div className={styles.seoResultsPage}>
        <KeyResults />
      </div>
      <ScrollToTop />
    </>
  );
}
