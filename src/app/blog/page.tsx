import type { Metadata } from "next";
import Link from "next/link";
import { getPostsByPhase, phases } from "@/data/posts";
import type { StaticPost } from "@/data/posts";
import BlogSideNav from "@/components/blog/BlogSideNav";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "SEO 实战笔记 — 90 天从零到 Google 首页的完整记录",
  description:
    "15 篇 SEO 实战文章，完整记录 maidinhk.com 从空白域名到 Google 首页的 90 天旅程。涵盖关键词调研、内容策略、TDK 优化、Topic Cluster 规划、GSC 数据分析等全流程方法论。",
  openGraph: {
    title: "SEO 实战笔记 — 90 天从零到 Google 首页的完整记录",
    description:
      "15 篇实战文章，涵盖关键词调研、内容策略、TDK 优化、Topic Cluster 规划等 SEO 全流程。",
    url: "https://itspmt.com/blog",
    type: "website",
  },
};

function StaticPostCard({ post }: { post: StaticPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <article className="group overflow-hidden rounded-sm bg-[#fafafa] border border-[#eee] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:border-[#ddd] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#999]">
              {post.category}
            </span>
            {post.tools.length > 0 && (
              <>
                <span className="text-[#ddd]">&middot;</span>
                {post.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[0.65rem] font-medium text-[#888]"
                  >
                    {tool}
                  </span>
                ))}
              </>
            )}
          </div>
          <h2 className="mb-2 font-serif text-xl font-semibold leading-tight tracking-tight text-[#1a1a1a] transition-colors group-hover:text-[#555]">
            {post.title}
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-[#888]">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs tabular-nums tracking-wide text-[#bbb]">
              {new Intl.DateTimeFormat("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(post.publishDate))}
            </span>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#e5e5e5] px-2.5 py-0.5 text-[0.7rem] text-[#999]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  return (
    <>
      <BlogSideNav />
      <div id="blog-top" className="mx-auto max-w-[860px] px-5 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#999]">
          SEO Journey
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1a1a1a]">
          我的 SEO 实践之路
        </h1>
        <p className="mt-3 max-w-[560px] text-[0.95rem] leading-relaxed text-[#888]">
          用 3 个月时间，把 maidinhk.com 从空白域名做到稳定有机流量。每一步都遵循「调研 → 创作 → 发布 → 监控 → 迭代」的闭环方法论，所有决策都有数据支撑。
        </p>
      </div>

      {/* Tool Legend */}
      <div className="mb-12 flex flex-wrap items-center gap-2 text-[0.75rem] text-[#888]">
        <span className="font-medium">工具栈：</span>
        {["Semrush", "Google Search Console", "Contentful", "Gemini", "YouMind", "Perplexity", "QuickCreator Extension"].map(
          (tool) => (
            <span
              key={tool}
              className="rounded-full border border-[#e5e5e5] px-2.5 py-0.5 text-[0.7rem] text-[#888]"
            >
              {tool}
            </span>
          )
        )}
      </div>

      {/* Phases */}
      <div className="space-y-16">
        {phases.map((phase) => {
          const phasePosts = getPostsByPhase(phase.id);
          return (
            <section key={phase.id} id={`phase-${phase.id}`}>
              {/* Phase Header */}
              <div className="mb-6 border-l-2 border-[#1a1a1a] pl-5">
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#999]">
                  Phase {String(phase.id).padStart(2, "0")} · {phase.label}
                </p>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a]">
                  {phase.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#888]">
                  {phase.subtitle}
                </p>
              </div>

              {/* Phase Posts */}
              <div className="grid grid-cols-1 gap-5">
                {phasePosts.map((post) => (
                  <StaticPostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-sm text-[#999]">
          这些文章记录了我从新媒体运营转向 SEO 的完整旅程
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full border border-[#1a1a1a] bg-[#1a1a1a] px-6 py-2.5 text-sm text-white transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a]"
        >
          &larr; 返回首页
        </Link>
      </div>
    </div>
    </>
  );
}
