"use client";

import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="py-12">
      <div className="mx-auto max-w-[860px] px-6">
        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
        <div className="flex items-center justify-between">
          <p className="text-[0.7rem] font-medium tracking-[0.1em] text-[#666]">
            &copy; {new Date().getFullYear()} {locale === "zh" ? "庞梦桐" : "Mengtong Pang"}
          </p>
          <p className="text-[0.65rem] font-medium tracking-[0.08em] text-[#555]">
            Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
