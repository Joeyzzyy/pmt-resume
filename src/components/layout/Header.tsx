"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

const navCopy = {
  zh: {
    home: "首页",
    blog: "SEO 实战笔记",
    dashboard: "数据管理大师",
  },
  en: {
    home: "Home",
    blog: "SEO Notes",
    dashboard: "SEO Dashboard",
  },
};

export default function Header() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const copy = navCopy[locale];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

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
        </nav>
        <LanguageSwitcher />
      </div>
      <div className="mx-auto max-w-[860px] px-6">
        <div className="h-px bg-gradient-to-r from-[#333] via-[#262626] to-transparent" />
      </div>
    </header>
  );
}
