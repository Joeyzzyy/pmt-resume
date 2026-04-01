"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const landingPages = [
    { name: "LP 组件库", href: "/lp/showroom" },
    { name: "Maidinhk LP1", href: "/lp/wheelchair-transport-guide" },
    { name: "Maidinhk LP2", href: "/lp/baby-sun-protection" },
  ];

  const isLandingPageActive = isActive("/lp");

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[860px] items-center justify-end px-6 py-5">
        <nav className="flex items-center gap-6 sm:gap-10">
          <Link
            href="/"
            className={`text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
              isActive("/")
                ? "text-[#FF2D55]"
                : "text-[#bbb] hover:text-[#1a1a1a]"
            }`}
          >
            首页
          </Link>
          <Link
            href="/blogs"
            className={`text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
              isActive("/blogs")
                ? "text-[#FF2D55]"
                : "text-[#bbb] hover:text-[#1a1a1a]"
            }`}
          >
            SEO 实战笔记
          </Link>
          <Link
            href="/data-master"
            className={`text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
              isActive("/data-master")
                ? "text-[#FF2D55]"
                : "text-[#bbb] hover:text-[#1a1a1a]"
            }`}
          >
            数据管理大师
          </Link>
          
          {/* 落地页展示 下拉菜单 */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-1 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
                isLandingPageActive
                  ? "text-[#FF2D55]"
                  : "text-[#bbb] hover:text-[#1a1a1a]"
              }`}
            >
              落地页展示
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 下拉菜单 */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[#eee] bg-white shadow-lg">
                {landingPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={() => setIsDropdownOpen(false)}
                    className={`block px-4 py-2.5 text-[0.75rem] transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      isActive(page.href)
                        ? "bg-[#FFF5F7] text-[#FF2D55]"
                        : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
      <div className="mx-auto max-w-[860px] px-6">
        <div className="h-px bg-gradient-to-r from-[#ddd] via-[#eee] to-transparent" />
      </div>
    </header>
  );
}
