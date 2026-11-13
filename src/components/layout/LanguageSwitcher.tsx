"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex shrink-0 items-center gap-1.5 text-[0.68rem] font-black tracking-[0.08em] sm:ml-2 sm:border-l sm:border-[#333] sm:pl-6 sm:text-[0.78rem]"
      role="group"
      aria-label="语言切换 / Language switcher"
    >
      <button
        type="button"
        onClick={() => setLocale("zh")}
        aria-pressed={locale === "zh"}
        aria-label="使用中文"
        className={`transition-colors duration-200 ${
          locale === "zh" ? "text-[#BD0858]" : "text-[#666] hover:text-[#ededed]"
        }`}
      >
        中
      </button>
      <span className="text-[#444]" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label="Switch to English"
        className={`transition-colors duration-200 ${
          locale === "en" ? "text-[#BD0858]" : "text-[#666] hover:text-[#ededed]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
