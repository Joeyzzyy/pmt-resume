import type { Metadata } from "next";
import { getPosts, getCategories } from "@/lib/contentful/queries";
import type { PaginatedResult, BlogPost, Category } from "@/lib/contentful/types";
import PostList from "@/components/blog/PostList";
import CategoryFilter from "@/components/blog/CategoryFilter";
import Pagination from "@/components/blog/Pagination";
import Link from "next/link";

export const revalidate = 60;

interface CategoryPageProps {
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
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === slug);
    return {
      title: category ? `${category.name} - Blog` : "Category",
      description:
        category?.description || `Blog posts in ${category?.name || slug}`,
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  let postsResult = emptyResult;
  let categories: Category[] = [];
  let error = false;

  try {
    [postsResult, categories] = await Promise.all([
      getPosts(page, 10, slug),
      getCategories(),
    ]);
  } catch {
    error = true;
  }

  const activeCategory = categories.find((c) => c.slug === slug);

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
          {activeCategory?.name || slug}
        </h1>
        {activeCategory?.description && (
          <p className="mt-2 text-[var(--color-gray-500)]">
            {activeCategory.description}
          </p>
        )}
      </div>

      <CategoryFilter categories={categories} activeSlug={slug} />

      <PostList posts={postsResult.items} />

      <Pagination
        currentPage={postsResult.page}
        totalPages={postsResult.totalPages}
        basePath={`/category/${slug}`}
      />
    </div>
  );
}
