import type { MetadataRoute } from "next";
import { contentfulClient } from "@/lib/contentful/client";

const BASE_URL = "https://itspmt.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const result = await contentfulClient.getEntries({
      content_type: "blogPost",
      select: ["fields.slug", "sys.updatedAt"],
      order: ["-sys.createdAt"],
      limit: 100,
    });
    articleEntries = result.items.map((item) => ({
      url: `${BASE_URL}/articles/${item.fields.slug}`,
      lastModified: new Date(item.sys.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Contentful 不可用时跳过
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articleEntries,
  ];
}
