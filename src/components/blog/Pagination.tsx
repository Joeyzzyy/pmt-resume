import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getHref = (page: number) => {
    if (page === 1) return basePath;
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}page=${page}`;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={getHref(currentPage - 1)}
          className="rounded border border-[var(--color-gray-300)] px-4 py-2 text-sm text-[var(--color-gray-700)] transition-colors hover:border-[var(--color-black)] hover:text-[var(--color-black)]"
        >
          Previous
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={getHref(page)}
          className={`rounded border px-3 py-2 text-sm transition-colors ${
            page === currentPage
              ? "border-[var(--color-black)] bg-[var(--color-black)] text-white"
              : "border-[var(--color-gray-300)] text-[var(--color-gray-700)] hover:border-[var(--color-black)] hover:text-[var(--color-black)]"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getHref(currentPage + 1)}
          className="rounded border border-[var(--color-gray-300)] px-4 py-2 text-sm text-[var(--color-gray-700)] transition-colors hover:border-[var(--color-black)] hover:text-[var(--color-black)]"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
