import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/contentful/types";
import { formatDate } from "@/lib/utils";

export default function PostHeader({ post }: { post: BlogPost }) {
  return (
    <header className="mb-12">
      {post.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {post.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#999] transition-colors hover:text-[#ededed]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-[#ededed] md:text-5xl">
        {post.title}
      </h1>

      <div className="mt-4 flex items-center gap-4 text-sm text-[#bbb]">
        <span>{post.author}</span>
        <span>&middot;</span>
        <time className="tabular-nums">{formatDate(post.publishDate)}</time>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-full border border-[#e5e5e5] px-3 py-1 text-xs text-[#999] transition-all duration-300 hover:border-[#ededed] hover:bg-[#ededed] hover:text-white"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {post.coverImage && (
        <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-sm">
          <Image
            src={`${post.coverImage.url}?w=1200&h=600&fit=fill`}
            alt={post.coverImage.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 860px"
            priority
          />
        </div>
      )}
    </header>
  );
}
