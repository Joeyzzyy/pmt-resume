import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GSC 数据洞察 — Google Search Console 实战数据面板",
  description:
    "基于 Google Search Console 真实数据构建的交互式分析面板。搜索词排名、页面表现、四象限分析、CTR 趋势——用数据验证 SEO 策略的有效性。",
  openGraph: {
    title: "GSC 数据洞察 — 实战数据面板",
    description:
      "基于 Google Search Console 真实数据的交互式分析面板，搜索词排名、页面表现、四象限分析一目了然。",
    url: "https://itspmt.com/gsc",
    type: "website",
  },
};

export default function GscLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
