import type { Metadata } from "next";
import { getPosts, getTags } from "@/lib/contentful/queries";
import type { PaginatedResult, BlogPost } from "@/lib/contentful/types";
import PostList from "@/components/blog/PostList";
import Pagination from "@/components/blog/Pagination";
import Link from "next/link";

export const revalidate = 60;

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const emptyResult: PaginatedResult<BlogPost> = {
  items: [],
  total: 0,
  page: 1,
  totalPages: 0,
};

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tags = await getTags();
    const tag = tags.find((t) => t.slug === slug);
    return {
      title: tag ? `#${tag.name} - Blog` : "Tag",
      description: `Blog posts tagged with ${tag?.name || slug}`,
    };
  } catch {
    return { title: "Tag" };
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  let postsResult = emptyResult;
  let error = false;
  let activeTagName = slug;

  try {
    const [result, tags] = await Promise.all([
      getPosts(page, 10, undefined, slug),
      getTags(),
    ]);
    postsResult = result;
    const activeTag = tags.find((t) => t.slug === slug);
    if (activeTag) activeTagName = activeTag.name;
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[860px] px-5 py-12 text-center">
        <p className="font-serif text-xl text-[var(--color-gray-700)]">
          Unable to load content
        </p>
        <Link
          href="/blogs"
          className="mt-4 inline-block text-sm text-[var(--color-gray-500)] underline"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-5 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-black)]">
          #{activeTagName}
        </h1>
        <p className="mt-2 text-[var(--color-gray-500)]">
          Posts tagged with &ldquo;{activeTagName}&rdquo;
        </p>
      </div>

      <PostList posts={postsResult.items} />

      <Pagination
        currentPage={postsResult.page}
        totalPages={postsResult.totalPages}
        basePath={`/tag/${slug}`}
      />
    </div>
  );
}
