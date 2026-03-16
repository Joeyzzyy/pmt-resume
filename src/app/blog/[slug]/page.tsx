import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPostBySlug,
  getAllPosts,
  getLatestPosts,
} from "@/data/posts";
import type { StaticPost } from "@/data/posts";

export const dynamic = "force-static";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://itspmt.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publishDate,
      authors: ["庞梦桐"],
    },
  };
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

/* ── Simple Markdown renderer ── */
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mt-8 mb-3 font-serif text-xl font-semibold text-[#333]">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-10 mb-4 font-serif text-2xl font-semibold text-[#1a1a1a]">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={key++} className="my-6 overflow-x-auto rounded bg-[#f7f7f7] border border-[#eee] p-4 text-sm leading-relaxed text-[#333]">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={key++} lines={tableLines} />);
      continue;
    }

    if (line.match(/^- /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-6 text-[#555]">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="my-4 list-decimal space-y-2 pl-6 text-[#555]">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.match(/^- \[[ x]\] /)) {
      const items: { checked: boolean; text: string }[] = [];
      while (i < lines.length && lines[i].match(/^- \[[ x]\] /)) {
        items.push({
          checked: lines[i].includes("[x]"),
          text: lines[i].replace(/^- \[[ x]\]\s/, ""),
        });
        i++;
      }
      elements.push(
        <ul key={key++} className="my-4 space-y-2 pl-2 text-[#555]">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">
                {item.checked ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="14" height="14" rx="2"/><polyline points="4.5 8 7 10.5 11.5 5.5"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="14" height="14" rx="2"/></svg>
                )}
              </span>
              <span>{renderInline(item.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    elements.push(
      <p key={key++} className="my-4 leading-[1.85] text-[#555]">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="prose mx-auto max-w-none">{elements}</div>;
}

/* ── Table renderer ── */
function MarkdownTable({ lines }: { lines: string[] }) {
  const parseRow = (line: string) =>
    line
      .split("|")
      .filter((c) => c.trim() !== "")
      .map((c) => c.trim());

  if (lines.length < 2) return null;
  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b-2 border-[#ddd] px-4 py-2 text-left font-semibold text-[#1a1a1a]"
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-[#f0f0f0]">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 text-[#555]">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Inline markdown renderer ── */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let k = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      boldMatch && { type: "bold", idx: boldMatch.index!, match: boldMatch },
      codeMatch && { type: "code", idx: codeMatch.index!, match: codeMatch },
      linkMatch && { type: "link", idx: linkMatch.index!, match: linkMatch },
    ].filter(Boolean) as { type: string; idx: number; match: RegExpMatchArray }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    matches.sort((a, b) => a.idx - b.idx);
    const earliest = matches[0];

    if (earliest.idx > 0) {
      parts.push(remaining.slice(0, earliest.idx));
    }

    if (earliest.type === "bold") {
      parts.push(
        <strong key={k++} className="font-semibold text-[#1a1a1a]">
          {earliest.match[1]}
        </strong>
      );
      remaining = remaining.slice(earliest.idx + earliest.match[0].length);
    } else if (earliest.type === "code") {
      parts.push(
        <code
          key={k++}
          className="rounded bg-[#f3f3f3] px-1.5 py-0.5 text-[0.875em] font-medium text-[#1a1a1a]"
        >
          {earliest.match[1]}
        </code>
      );
      remaining = remaining.slice(earliest.idx + earliest.match[0].length);
    } else if (earliest.type === "link") {
      parts.push(
        <a
          key={k++}
          href={earliest.match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-[#ccc] text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]"
        >
          {earliest.match[1]}
        </a>
      );
      remaining = remaining.slice(earliest.idx + earliest.match[0].length);
    }
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

/* ── Related posts sidebar ── */
function RelatedPosts({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === currentSlug);
  const related: StaticPost[] = [];

  if (currentIndex > 0) related.push(allPosts[currentIndex - 1]);
  if (currentIndex < allPosts.length - 1)
    related.push(allPosts[currentIndex + 1]);

  const latest = getLatestPosts(5);
  for (const p of latest) {
    if (related.length >= 3) break;
    if (p.slug !== currentSlug && !related.find((r) => r.slug === p.slug)) {
      related.push(p);
    }
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-[#eee] pt-10">
      <h3 className="mb-6 font-serif text-lg font-semibold text-[#1a1a1a]">
        继续阅读
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-sm border border-[#eee] bg-[#fafafa] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#999]">
              {post.category}
            </span>
            <h4 className="mt-2 text-sm font-semibold leading-snug text-[#1a1a1a] transition-colors group-hover:text-[#555]">
              {post.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: "庞梦桐",
      url: "https://itspmt.com",
    },
    datePublished: post.publishDate,
    publisher: {
      "@type": "Person",
      name: "庞梦桐",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://itspmt.com/blog/${slug}`,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-[860px] px-5 py-12">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[#bbb] transition-colors hover:text-[#1a1a1a]"
      >
        &larr; 返回文章列表
      </Link>

      <div className="rounded-sm bg-[#fafafa] border border-[#eee] p-8 md:p-16">
        {/* Header */}
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#999]">
              {post.category}
            </span>
            {post.tools.length > 0 && (
              <>
                <span className="text-[#ddd]">·</span>
                {post.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[0.7rem] font-medium text-[#888]"
                  >
                    {tool}
                  </span>
                ))}
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a] md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-[#bbb]">
            <span>庞梦桐</span>
            <span>&middot;</span>
            <time dateTime={post.publishDate} className="tabular-nums">
              {new Intl.DateTimeFormat("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(post.publishDate))}
            </time>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#e5e5e5] px-3 py-1 text-xs text-[#999]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <MarkdownContent content={post.content} />
      </div>

      {/* Related Posts */}
      <RelatedPosts currentSlug={slug} />
    </article>
    </>
  );
}
