"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

const navCopy = {
  zh: {
    home: "首页",
    blog: "SEO 实战笔记",
    dashboard: "数据管理大师",
    landingPages: "落地页展示",
    showroom: "LP 组件库",
  },
  en: {
    home: "Home",
    blog: "SEO Notes",
    dashboard: "SEO Dashboard",
    landingPages: "Landing Pages",
    showroom: "LP Library",
  },
};

export default function Header() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const copy = navCopy[locale];
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
    { name: copy.showroom, href: "/lp/showroom" },
    { name: "Maidinhk LP1", href: "/lp/wheelchair-transport-guide" },
    { name: "Maidinhk LP2", href: "/lp/baby-sun-protection" },
  ];

  const isLandingPageActive = isActive("/lp");

  return (
    <header className="headerNavigation sticky top-0 z-50 bg-black/70 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 py-4 sm:flex-nowrap sm:justify-end sm:gap-8 sm:px-6 sm:py-5">
        <Link href="/" aria-label="返回首页" className="mr-auto shrink-0">
          <Image
            src="/images/logo.png"
            alt="网站 Logo"
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
        </Link>
        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-4 sm:order-none sm:w-auto sm:flex-nowrap sm:gap-10">
          <Link
            href="/"
            className={`whitespace-nowrap text-[0.85rem] font-black uppercase tracking-[0.08em] sm:text-[0.95rem] sm:tracking-[0.14em] transition-all duration-300 ${
              isActive("/")
                ? "text-[#BD0858]"
                : "text-[#777] hover:text-[#ededed]"
            }`}
          >
            {copy.home}
          </Link>
          <Link
            href="/blogs"
            className={`whitespace-nowrap text-[0.85rem] font-black uppercase tracking-[0.08em] sm:text-[0.95rem] sm:tracking-[0.14em] transition-all duration-300 ${
              isActive("/blogs")
                ? "text-[#BD0858]"
                : "text-[#777] hover:text-[#ededed]"
            }`}
          >
            {copy.blog}
          </Link>
          <Link
            href="/data-master"
            className={`whitespace-nowrap text-[0.85rem] font-black uppercase tracking-[0.08em] sm:text-[0.95rem] sm:tracking-[0.14em] transition-all duration-300 ${
              isActive("/data-master")
                ? "text-[#BD0858]"
                : "text-[#777] hover:text-[#ededed]"
            }`}
          >
            {copy.dashboard}
          </Link>

          {/* 落地页展示 下拉菜单 */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              className={`flex items-center gap-1 whitespace-nowrap text-[0.85rem] font-black uppercase tracking-[0.08em] sm:text-[0.95rem] sm:tracking-[0.14em] transition-all duration-300 ${
                isLandingPageActive
                  ? "text-[#BD0858]"
                  : "text-[#777] hover:text-[#ededed]"
              }`}
            >
              {copy.landingPages}
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 下拉菜单 */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[#262626] bg-[#111] shadow-lg shadow-black/60">
                {landingPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={() => setIsDropdownOpen(false)}
                    className={`block px-4 py-2.5 text-[0.875rem] transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      isActive(page.href)
                        ? "bg-[#2c0818] text-[#BD0858] font-black"
                        : "text-[#999] hover:bg-[#1a1a1a] hover:text-[#ededed]"
                    }`}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <LanguageSwitcher />
      </div>
      <div className="mx-auto max-w-[860px] px-6">
        <div className="h-px bg-gradient-to-r from-[#333] via-[#262626] to-transparent" />
      </div>
    </header>
  );
}
