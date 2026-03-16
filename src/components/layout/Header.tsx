"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[860px] items-center justify-end px-6 py-5">
        <nav className="flex items-center gap-6 sm:gap-10">
          <Link
            href="/"
            className={`text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
              isActive("/") && !isActive("/blog")
                ? "text-[#FF2D55]"
                : "text-[#bbb] hover:text-[#1a1a1a]"
            }`}
          >
            首页
          </Link>
          <Link
            href="/blog"
            className={`text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
              isActive("/blog")
                ? "text-[#FF2D55]"
                : "text-[#bbb] hover:text-[#1a1a1a]"
            }`}
          >
            SEO 实战笔记
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-[860px] px-6">
        <div className="h-px bg-gradient-to-r from-[#ddd] via-[#eee] to-transparent" />
      </div>
    </header>
  );
}
