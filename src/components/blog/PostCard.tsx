import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/contentful/types";
import { formatDate } from "@/lib/utils";

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group overflow-hidden rounded-sm bg-[#141414] border border-[#262626] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:border-[#2e2e2e] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      {post.coverImage && (
        <Link href={`/blogs/${post.slug}`}>
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={`${post.coverImage.url}?w=600&h=338&fit=fill`}
              alt={post.coverImage.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Link>
      )}
      <div className="p-6">
        {post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#999] transition-colors hover:text-[#ededed]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
        <Link href={`/blogs/${post.slug}`}>
          <h2 className="mb-2 font-serif text-xl font-semibold leading-tight tracking-tight text-[#ededed] transition-colors group-hover:text-[#a0a0a0]">
            {post.title}
          </h2>
        </Link>
        <p className="mb-4 text-sm leading-relaxed text-[#888]">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs tabular-nums tracking-wide text-[#bbb]">
            {formatDate(post.publishDate)}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full border border-[#e5e5e5] px-2.5 py-0.5 text-[0.7rem] text-[#999] transition-all duration-300 hover:border-[#ededed] hover:bg-[#ededed] hover:text-white"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
