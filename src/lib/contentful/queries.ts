import { contentfulClient } from "./client";
import type {
  BlogPost,
  Category,
  Tag,
  PaginatedResult,
} from "./types";

const POSTS_PER_PAGE = 10;

// ========== Parsers ==========
// Using `any` for raw Contentful entries since the SDK's generic typing
// is overly strict with custom skeleton types. We parse into our own typed interfaces.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCategory(entry: any): Category {
  return {
    id: entry.sys.id,
    name: entry.fields.name,
    slug: entry.fields.slug,
    description: entry.fields.description,
    sortOrder: entry.fields.sortOrder,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTag(entry: any): Tag {
  return {
    id: entry.sys.id,
    name: entry.fields.name,
    slug: entry.fields.slug,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBlogPost(entry: any): BlogPost {
  const coverImage = entry.fields.coverImage;
  const categories = entry.fields.categories || [];
  const tags = entry.fields.tags || [];

  let parsedCover: BlogPost["coverImage"];
  if (coverImage?.fields?.file) {
    const file = coverImage.fields.file;
    parsedCover = {
      url: `https:${file.url}`,
      width: file.details.image.width,
      height: file.details.image.height,
      title: coverImage.fields.title || "",
    };
  }

  return {
    id: entry.sys.id,
    title: entry.fields.title,
    slug: entry.fields.slug,
    excerpt: entry.fields.excerpt,
    body: entry.fields.body,
    coverImage: parsedCover,
    author: entry.fields.author,
    publishDate: entry.fields.publishDate,
    categories: categories.map(parseCategory),
    tags: tags.map(parseTag),
    featured: entry.fields.featured || false,
  };
}

// ========== Query Functions ==========

export async function getPosts(
  page = 1,
  limit = POSTS_PER_PAGE,
  categorySlug?: string,
  tagSlug?: string
): Promise<PaginatedResult<BlogPost>> {
  let linkedEntryId: string | undefined;

  if (categorySlug) {
    const catResult = await contentfulClient.getEntries({
      content_type: "category",
      "fields.slug": categorySlug,
      limit: 1,
    });
    if (catResult.items.length > 0) {
      linkedEntryId = catResult.items[0].sys.id;
    }
  } else if (tagSlug) {
    const tagResult = await contentfulClient.getEntries({
      content_type: "tag",
      "fields.slug": tagSlug,
      limit: 1,
    });
    if (tagResult.items.length > 0) {
      linkedEntryId = tagResult.items[0].sys.id;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    content_type: "blogPost",
    order: ["-fields.publishDate"],
    skip: (page - 1) * limit,
    limit,
    include: 2,
  };

  if (linkedEntryId) {
    query.links_to_entry = linkedEntryId;
  }

  const result = await contentfulClient.getEntries(query);

  return {
    items: result.items.map(parseBlogPost),
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const result = await contentfulClient.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
    include: 2,
  });

  if (result.items.length === 0) return null;
  return parseBlogPost(result.items[0]);
}

export async function getCategories(): Promise<Category[]> {
  const result = await contentfulClient.getEntries({
    content_type: "category",
    order: ["fields.sortOrder"],
  });

  return result.items.map(parseCategory);
}

export async function getTags(): Promise<Tag[]> {
  const result = await contentfulClient.getEntries({
    content_type: "tag",
    order: ["fields.name"],
  });

  return result.items.map(parseTag);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const result = await contentfulClient.getEntries({
    content_type: "blogPost",
    select: ["fields.slug"],
    limit: 100,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.items.map((item: any) => item.fields.slug);
}
