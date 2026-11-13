import type { Metadata } from "next";
import Link from "next/link";
import { contentfulClient } from "@/lib/contentful/client";
import ArticlesSideNav from "@/components/articles/ArticlesSideNav";
import ScrollToTop from "@/components/blog/ScrollToTop";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "博客 — 庞梦桐",
  description: "来自 Contentful 的博客文章",
  robots: {
    index: true,
    follow: true,
  },
};

const clusterMeta: Record<
  string,
  { label: string; phase: string; title: string; subtitle: string }
> = {
  "seo-foundations-month-one": {
    label: "第一个月：SEO 基础",
    phase: "Phase 01 · 第一个月",
    title: "从 0 到 1：打地基",
    subtitle: "搭建监控体系、学会用数据选词、建立内容规范与信任基线",
  },
  "content-strategy-intent-month-two": {
    label: "第二个月：内容策略",
    phase: "Phase 02 · 第二个月",
    title: "从摸索到熟悉：精炼方法论",
    subtitle: "深挖用户意图、构建审计与发布 SOP、用数据驱动内容迭代",
  },
  "data-driven-efficiency-month-three": {
    label: "第三个月：数据驱动",
    phase: "Phase 03 · 第三个月",
    title: "细节致胜：思维进化",
    subtitle: "从零散选词到系统化规划，用 Topic Cluster 封锁流量入口",
  },
};

const clusterOrder = [
  "seo-foundations-month-one",
  "content-strategy-intent-month-two",
  "data-driven-efficiency-month-three",
];

// 每个 cluster 内文章的自定义排序（按 slug）
const slugOrder: Record<string, string[]> = {
  "seo-foundations-month-one": [
    "seo-jargon-complete-glossary-guide",
    "tecnicas-seo-basicas-gsc-setup",
    "what-is-semrush-rank-keyword-guide",
    "google-eeat-checklist-seo-guide",
    "google-sitemap-best-practices-guide",
  ],
  "content-strategy-intent-month-two": [
    "intent-driven-searches-seo-strategy",
    "how-to-increase-domain-authority-topic-cluster",
    "internal-link-strategy-seo-guide",
    "ymyl-eeat-content-audit-guide",
    "youmind-ai-visual-seo-ctr",
    "seo-audit-services-automation-sop",
    "google-search-console-data-audit-tutorial",
  ],
  "data-driven-efficiency-month-three": [
    "how-to-choose-keywords-efficiency-guide",
    "keyword-research-checklist-pillar-strategy",
    "serp-click-through-rates-optimization-guide",
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePost(entry: any) {
  return {
    id: entry.sys.id,
    title: entry.fields.title,
    slug: entry.fields.slug,
    description: entry.fields.description || "",
    cluster: entry.fields.cluster || "",
    author: entry.fields.author || "",
    createdAt: entry.sys.createdAt,
  };
}

export default async function ArticlesPage() {
  let posts;
  try {
    const result = await contentfulClient.getEntries({
      content_type: "blogPost",
      order: ["-sys.createdAt"],
      limit: 100,
    });
    posts = result.items.map(parsePost);
  } catch (e) {
    console.error("Articles fetch error:", e);
    posts = null;
  }

  // 按 cluster 分组
  const grouped: Record<string, typeof posts> = {};
  if (posts) {
    for (const post of posts) {
      const key = post.cluster || "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key]!.push(post);
    }
  }

  // 按自定义 slug 顺序排列 cluster 内文章
  for (const [cluster, order] of Object.entries(slugOrder)) {
    if (grouped[cluster]) {
      grouped[cluster]!.sort((a, b) => {
        const ai = order.indexOf(a.slug);
        const bi = order.indexOf(b.slug);
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
      });
    }
  }

  // 按预定义顺序排列，未知 cluster 排末尾
  const sortedClusters = [
    ...clusterOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !clusterOrder.includes(c)),
  ];

  const sections = sortedClusters.map((c) => ({
    id: c,
    label: clusterMeta[c]?.label || c,
  }));

  return (
    <>
      {posts && posts.length > 0 && <ArticlesSideNav sections={sections} />}
      <div id="articles-top" className="mx-auto max-w-[860px] px-5 py-12">
        <div className="mb-10">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
            Blog
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#ededed]">
            SEO 实战笔记
          </h1>
        </div>

        {posts === null ? (
          <p className="text-sm text-[#999]">
            暂时无法加载文章，请稍后再试。
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-[#999]">
            暂无文章，敬请期待。
          </p>
        ) : (
          <div className="space-y-16">
            {sortedClusters.map((cluster) => (
              <section key={cluster} id={cluster}>
                {clusterMeta[cluster] ? (
                  <div className="mb-8">
                    <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
                      {clusterMeta[cluster].phase}
                    </p>
                    <h2 className="mb-1 font-serif text-2xl font-bold tracking-tight text-[#ededed]">
                      {clusterMeta[cluster].title}
                    </h2>
                    <p className="text-sm leading-relaxed text-[#888]">
                      {clusterMeta[cluster].subtitle}
                    </p>
                  </div>
                ) : (
                  <h2 className="mb-8 font-serif text-2xl font-bold tracking-tight text-[#ededed]">
                    {cluster}
                  </h2>
                )}
                <div className="grid grid-cols-1 gap-5">
                  {grouped[cluster]!.map((post) => (
                    <Link key={post.id} href={`/${post.cluster || cluster}/${post.slug}`} className="block">
                      <article className="group overflow-hidden rounded-sm bg-[#141414] border border-[#262626] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:border-[#2e2e2e] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                        <div className="p-6">
                          <h3 className="mb-2 font-serif text-xl font-semibold leading-tight tracking-tight text-[#ededed] transition-colors group-hover:text-[#a0a0a0]">
                            {post.title}
                          </h3>
                          <p className="mb-4 text-sm leading-relaxed text-[#888]">
                            {post.description}
                          </p>
                          <span className="text-xs tabular-nums tracking-wide text-[#bbb]">
                            {new Intl.DateTimeFormat("zh-CN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(new Date(post.createdAt))}
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <ScrollToTop />
    </>
  );
}
