// 一次性导出 Contentful 博客文章为本地静态 JSON，供页面直接读取（跳过运行时 Contentful 请求）
// 用法：node scripts/export_contentful.mjs
import { createClient } from "contentful";
import { readFileSync, writeFileSync } from "fs";

// 从 .env.local 读取环境变量（不依赖 dotenv）
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;
if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error("缺少 CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN");
  process.exit(1);
}

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
});

const res = await client.getEntries({
  content_type: "blogPost",
  limit: 200,
  include: 2,
  order: ["-sys.createdAt"],
});

const posts = res.items.map((entry) => ({
  id: entry.sys.id,
  title: entry.fields.title ?? "",
  slug: entry.fields.slug ?? "",
  description: entry.fields.description ?? "",
  shortTitle: entry.fields.shortTitle ?? "",
  cluster: entry.fields.cluster ?? "",
  author: entry.fields.author ?? "",
  keywords: entry.fields.keywords ?? "",
  createdAt: entry.sys.createdAt,
  content: entry.fields.content ?? null,
}));

writeFileSync(
  new URL("../src/data/blogPosts.json", import.meta.url),
  JSON.stringify(posts, null, 2)
);
console.log(`已导出 ${posts.length} 篇文章到 src/data/blogPosts.json`);
