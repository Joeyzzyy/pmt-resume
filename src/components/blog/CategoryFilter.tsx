import Link from "next/link";
import type { Category } from "@/lib/contentful/types";

interface CategoryFilterProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryFilter({
  categories,
  activeSlug,
}: CategoryFilterProps) {
  return (
    <div className="mb-10 flex flex-wrap gap-3">
      <Link
        href="/"
        className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-300 ${
          !activeSlug
            ? "border-[var(--color-black)] bg-[var(--color-black)] text-white"
            : "border-[var(--color-gray-300)] text-[var(--color-gray-700)] hover:border-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-white"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-300 ${
            activeSlug === cat.slug
              ? "border-[var(--color-black)] bg-[var(--color-black)] text-white"
              : "border-[var(--color-gray-300)] text-[var(--color-gray-700)] hover:border-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-white"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
