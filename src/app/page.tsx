import type { Metadata } from "next";
import HomeContent from "@/components/home/HomeContent";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: {
    absolute: "庞梦桐 — 内容运营 · SEO 增长 | 从特斯拉到独立站 SEO 实战",
  },
  description:
    "庞梦桐，前特斯拉新媒体运营，现专注独立站 SEO 增长。3 个月将 maidinhk.com 核心关键词推上 Google 首页，191 个关键词进入 Top 10。关键词调研、内容策略、技术 SEO、数据分析——完整的 SEO 能力闭环。",
  keywords: [
    "庞梦桐",
    "SEO",
    "内容运营",
    "SEO 增长",
    "独立站 SEO",
    "内容驱动增长",
    "Google SEO",
    "关键词调研",
    "内容策略",
    "技术 SEO",
  ],
  openGraph: {
    title: "庞梦桐 — 内容运营 · SEO 增长",
    description:
      "前特斯拉新媒体运营，3 个月从零将独立站核心关键词推上 Google 首页。用数据和内容驱动增长的 SEO 实战派。",
    url: "https://itspmt.com",
    siteName: "庞梦桐 | SEO 增长实战",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return <HomeContent />;
}
