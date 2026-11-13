import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contentfulClient } from "@/lib/contentful/client";
import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import type { Block, Inline, TopLevelBlock } from "@contentful/rich-text-types";
import ScrollToTop from "@/components/blog/ScrollToTop";
import ClusterSideNav from "@/components/blog/ClusterSideNav";

type Props = {
  params: Promise<{ cluster: string; slug: string }>;
};

const renderOptions: Options = {
  renderNode: {
    [BLOCKS.TABLE]: (node: Block | Inline, children: ReactNode) => {
      const rows = (node as Block).content;
      const headerRow = rows[0] as Block;
      const bodyRows = rows.slice(1);

      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-[0.9rem]">
            <thead>
              <tr>
                {headerRow.content.map((cell, i) => (
                  <th
                    key={i}
                    className="border border-[#2e2e2e] bg-[#1a1a1a] px-4 py-2.5 text-left font-semibold text-[#ededed]"
                  >
                    {documentToReactComponents(
                      {
                        nodeType: BLOCKS.DOCUMENT,
                        data: {},
                        content: (cell as Block).content as TopLevelBlock[],
                      },
                      renderOptions,
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="transition-colors hover:bg-[#141414]">
                  {(row as Block).content.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-[#262626] px-4 py-2.5 text-[#d4d4d4]"
                    >
                      {documentToReactComponents(
                        {
                          nodeType: BLOCKS.DOCUMENT,
                          data: {},
                          content: (cell as Block).content as TopLevelBlock[],
                        },
                        renderOptions,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    [BLOCKS.TABLE_ROW]: (_node: Block | Inline, children: ReactNode) => (
      <tr>{children}</tr>
    ),
    [BLOCKS.TABLE_CELL]: (_node: Block | Inline, children: ReactNode) => (
      <td>{children}</td>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node: Block | Inline, children: ReactNode) => (
      <th>{children}</th>
    ),
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePost(entry: any) {
  return {
    id: entry.sys.id,
    title: entry.fields.title as string,
    slug: entry.fields.slug as string,
    description: (entry.fields.description || "") as string,
    content: entry.fields.content,
    cluster: (entry.fields.cluster || "") as string,
    author: (entry.fields.author || "") as string,
    keywords: (entry.fields.keywords || "") as string,
    createdAt: entry.sys.createdAt as string,
  };
}

async function getClusterPosts(cluster: string) {
  const result = await contentfulClient.getEntries({
    content_type: "blogPost",
    "fields.cluster": cluster,
    select: ["fields.title", "fields.slug", "fields.cluster"],
    order: ["sys.createdAt"],
    limit: 50,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.items.map((entry: any) => ({
    slug: entry.fields.slug as string,
    title: entry.fields.title as string,
    shortTitle: (entry.fields.shortTitle || "") as string,
    cluster: (entry.fields.cluster || "") as string,
  }));
}

async function getPostBySlug(slug: string) {
  const result = await contentfulClient.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
    include: 2,
  });
  if (result.items.length === 0) return null;
  return parsePost(result.items[0]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — 庞梦桐`,
    description: post.description,
    keywords: post.keywords,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { cluster, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Verify the cluster in URL matches the post's actual cluster
  if (post.cluster && post.cluster !== cluster) notFound();

  const siblingPosts = post.cluster ? await getClusterPosts(post.cluster) : [];

  return (
    <>
      {siblingPosts.length > 1 && <ClusterSideNav posts={siblingPosts} />}
      <div className="mx-auto max-w-[860px] px-5 py-12">
      <Link
        href="/blogs"
        className="mb-8 inline-block text-sm text-[#999] transition-colors hover:text-[#ededed]"
      >
        &larr; SEO 实战笔记
      </Link>

      <article>
        <header className="mb-10">
          {post.cluster && (
            <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#999]">
              {post.cluster}
            </p>
          )}
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#ededed] sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-xs text-[#bbb]">
            {post.author && <span>{post.author}</span>}
            <span>
              {new Intl.DateTimeFormat("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(post.createdAt))}
            </span>
          </div>
        </header>

        <div className="prose prose-neutral max-w-none text-[#d4d4d4] leading-relaxed [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#ededed] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#ededed] [&_p]:mb-4 [&_p]:text-[0.95rem] [&_p]:leading-[1.8] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_li]:text-[0.95rem] [&_a]:text-[#BD0858] [&_a]:font-black [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#2e2e2e] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#888]">
          {documentToReactComponents(post.content, renderOptions)}
        </div>
      </article>
      <ScrollToTop />
    </div>
    </>
  );
}
