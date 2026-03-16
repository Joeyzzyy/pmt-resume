import type { BlogPost } from "@/lib/contentful/types";
import PostCard from "./PostCard";

export default function PostList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-xl text-[var(--color-gray-500)]">
          No posts yet.
        </p>
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">
          Check back soon for new content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
