import type { Asset, Entry, EntrySkeletonType } from "contentful";
import type { Document } from "@contentful/rich-text-types";

// ========== Field Interfaces ==========

export interface CategoryFields {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

export interface TagFields {
  name: string;
  slug: string;
}

export interface BlogPostFields {
  title: string;
  slug: string;
  excerpt: string;
  body: Document;
  coverImage?: Asset;
  author: string;
  publishDate: string;
  categories?: Entry<CategorySkeleton>[];
  tags?: Entry<TagSkeleton>[];
  featured?: boolean;
}

// ========== Skeleton Types (for Contentful SDK v10+) ==========

export interface CategorySkeleton extends EntrySkeletonType {
  contentTypeId: "category";
  fields: CategoryFields;
}

export interface TagSkeleton extends EntrySkeletonType {
  contentTypeId: "tag";
  fields: TagFields;
}

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: "blogPost";
  fields: BlogPostFields;
}

// ========== Parsed Types (for use in components) ==========

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: Document;
  coverImage?: {
    url: string;
    width: number;
    height: number;
    title: string;
  };
  author: string;
  publishDate: string;
  categories: Category[];
  tags: Tag[];
  featured: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
