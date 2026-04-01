/**
 * Landing Page Component Library Showcase
 * 
 * Landing Page 組件庫展示頁面
 * 用於展示和選擇各種通用的 Landing Page 組件結構
 * 
 * 組件列表：
 * 1. Hero-居中標題型 - 適合放置主標題（20-30字）、副標題（50-80字）
 * 2. Feature-三列卡片 - 適合展示3個核心賣點，每張卡片標題（4-6字）、描述（30-50字）
 * 3. Steps-左圖右文 - 適合步驟說明，左側圖片 + 右側3個步驟，每步標題（4-6字）、描述（20-40字）
 * 4. Preview-右圖左文 - 適合產品預覽，左側文案 + 右側圖片，標題（10-15字）、描述（40-60字）
 * 5. SocialProof-評價展示 - 適合客戶評價 + 數據展示，評價內容（60-100字）
 * 6. CTA-居中轉化 - 適合最終轉化，標題（15-25字）、描述（30-50字）
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import YouMindNavigator from "@/components/landing/YouMindNavigator";

type ThemeColor = "black" | "blue" | "pink" | "yellow";

const themeColors: Record<ThemeColor, { bg: string; text: string; hover: string; light: string }> = {
  black: { bg: "bg-[#1a1a1a]", text: "text-[#1a1a1a]", hover: "hover:bg-[#333]", light: "bg-[#f5f5f5]" },
  blue: { bg: "bg-blue-600", text: "text-blue-600", hover: "hover:bg-blue-700", light: "bg-blue-50" },
  pink: { bg: "bg-pink-500", text: "text-pink-500", hover: "hover:bg-pink-600", light: "bg-pink-50" },
  yellow: { bg: "bg-amber-500", text: "text-amber-500", hover: "hover:bg-amber-600", light: "bg-amber-50" },
};

// SVG Icons
const Icons = {
  target: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  search: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  lightning: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  chart: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  tag: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  clipboard: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  star: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  user: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  users: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  file: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  clock: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

export default function LandingPageShowroom() {
  const [theme, setTheme] = useState<ThemeColor>("black");
  const colors = themeColors[theme];

  return (
    <main className="min-h-screen bg-white">
      <YouMindNavigator />

      {/* Theme Color Selector */}
      <div className="fixed right-4 top-4 z-50 rounded-lg border border-[#e5e5e5] bg-white p-3 shadow-lg">
        <p className="mb-2 text-[10px] font-medium text-[#999]">主題色</p>
        <div className="flex gap-2">
          {(["black", "blue", "pink", "yellow"] as ThemeColor[]).map((color) => (
            <button
              key={color}
              onClick={() => setTheme(color)}
              className={`h-6 w-6 rounded-full border-2 transition-all ${
                theme === color ? "border-[#1a1a1a] scale-110" : "border-transparent"
              } ${
                color === "black" ? "bg-[#1a1a1a]" :
                color === "blue" ? "bg-blue-600" :
                color === "pink" ? "bg-pink-500" :
                "bg-amber-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 1. Hero-居中標題型 */}
      <section id="hero" className="relative overflow-hidden bg-white px-4 pb-20 pt-28 md:px-6 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            className={`mb-6 inline-block rounded-full border border-[#e5e5e5] bg-white px-4 py-1.5 text-xs font-medium ${colors.text}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[10px]">✓</span>
            頂部標籤文字（建議8-12字）
          </motion.div>

          <motion.h1
            className="mb-6 font-serif text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a] md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          >
            主標題區域
            <br className="hidden md:block" />
            建議20-30個中文字
          </motion.h1>
          
          <motion.p
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-[#666] md:text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            副標題描述區域，建議50-80個中文字。
            <br className="hidden md:block" />
            可用於補充說明產品核心價值主張，支持換行顯示。
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="#">
              <motion.button
                className={`rounded-full ${colors.bg} px-8 py-4 text-base font-medium text-white transition-all hover:scale-105 hover:shadow-xl md:px-10 md:text-lg`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                主要CTA（建議6-8字）
              </motion.button>
            </Link>
            <motion.button
              className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 py-4 text-base text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('feature')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              次要CTA（建議4-6字）
            </motion.button>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 flex max-w-2xl justify-center gap-8 border-t border-[#eee] pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              { num: "數據1", label: "標籤（4字內）" },
              { num: "數據2", label: "標籤（4字內）" },
              { num: "數據3", label: "標籤（4字內）" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`font-serif text-2xl font-bold ${colors.text} md:text-3xl`}>{stat.num}</p>
                <p className="text-xs text-[#999]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. Feature-三列卡片 */}
      <section id="feature" className="bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
              小標題（建議4-6字）
            </span>
            <h2 className="mx-auto max-w-3xl font-serif text-2xl font-bold leading-snug text-[#1a1a1a] md:text-4xl">
              區塊主標題
              <br className="hidden md:block" />
              建議10-15個中文字
            </h2>
          </motion.div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { 
                icon: Icons.search, 
                title: "卡片標題1", 
                desc: "卡片描述文字，建議30-50個中文字。用於簡要說明該功能的特點和優勢。",
                highlight: "標籤（4字）"
              },
              { 
                icon: Icons.lightning, 
                title: "卡片標題2", 
                desc: "卡片描述文字，建議30-50個中文字。用於簡要說明該功能的特點和優勢。",
                highlight: "標籤（4字）"
              },
              { 
                icon: Icons.target, 
                title: "卡片標題3", 
                desc: "卡片描述文字，建議30-50個中文字。用於簡要說明該功能的特點和優勢。",
                highlight: "標籤（4字）"
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-[#eee] bg-white p-8 transition-all duration-300 hover:border-[#1a1a1a] hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className={`absolute right-4 top-4 rounded-full ${colors.light} px-3 py-1 text-[10px] font-medium ${colors.text}`}>
                  {item.highlight}
                </span>
                <div className={`mb-6 ${colors.text}`}>{item.icon}</div>
                <h3 className="mb-3 font-serif text-xl font-semibold text-[#1a1a1a]">
                  {item.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#666]">
                  {item.desc}
                </p>
                <motion.button
                  className={`text-sm font-medium ${colors.text} underline underline-offset-4 transition-all hover:no-underline`}
                  whileHover={{ x: 3 }}
                >
                  了解更多 →
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="#">
              <motion.button
                className={`rounded-full ${colors.bg} px-8 py-3 text-sm font-medium text-white transition-all ${colors.hover}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                底部CTA（建議6-10字）
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. Steps-左圖右文 */}
      <section id="how" className="bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
              小標題（建議4-6字）
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] md:text-4xl">
              區塊主標題（建議8-12字）
            </h2>
          </motion.div>

          {/* 左圖右文佈局 */}
          <motion.div
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* 左側：圖片 */}
            <div className="order-1">
              <div className="rounded-2xl bg-[#f5f5f5] p-4">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                  <img
                    src="https://assets.youmind.com/features/top-feature-pick.png"
                    alt="步驟示意圖"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 右側：三步驟內容 */}
            <div className="order-2">
              <div className="space-y-6">
                {[
                  { 
                    step: "01", 
                    title: "步驟一標題",
                    desc: "步驟描述文字，建議20-40個中文字。簡要說明該步驟的操作內容。",
                    icon: Icons.search,
                  },
                  { 
                    step: "02", 
                    title: "步驟二標題",
                    desc: "步驟描述文字，建議20-40個中文字。簡要說明該步驟的操作內容。",
                    icon: Icons.lightning,
                  },
                  { 
                    step: "03", 
                    title: "步驟三標題",
                    desc: "步驟描述文字，建議20-40個中文字。簡要說明該步驟的操作內容。",
                    icon: Icons.target,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    {/* 步驟編號圖標 */}
                    <div className="flex-shrink-0">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bg} text-white shadow-md`}>
                        {item.icon}
                      </div>
                      {/* 連接線 */}
                      {i < 2 && (
                        <div className="mx-auto mt-2 h-12 w-0.5 bg-gradient-to-b from-[#e5e5e5] to-transparent"></div>
                      )}
                    </div>
                    
                    {/* 內容 */}
                    <div className="flex-1 pb-2">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`text-xs font-bold ${colors.text}`}>Step {item.step}</span>
                      </div>
                      <h3 className="mb-2 font-serif text-lg font-bold text-[#1a1a1a]">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#666]">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link href="#">
                  <motion.button
                    className={`rounded-full ${colors.bg} px-8 py-3 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    底部CTA（建議6-10字）→
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Preview-右圖左文 */}
      <section id="preview" className="bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
                小標題（建議4-6字）
              </span>
              <h2 className="mb-6 font-serif text-2xl font-bold leading-snug text-[#1a1a1a] md:text-4xl">
                區塊主標題
                <br />
                建議10-15個中文字
              </h2>
              <p className="mb-8 text-base leading-relaxed text-[#666]">
                區塊描述文字，建議40-60個中文字。用於詳細說明產品特性或服務內容，可換行顯示。
              </p>

              <div className="mb-8 space-y-4">
                {[
                  { icon: Icons.chart, text: "列表項1 - 建議8-12字" },
                  { icon: Icons.tag, text: "列表項2 - 建議8-12字" },
                  { icon: Icons.clipboard, text: "列表項3 - 建議8-12字" },
                  { icon: Icons.star, text: "列表項4 - 建議8-12字" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className={`${colors.text}`}>{item.icon}</span>
                    <span className="text-sm text-[#666]">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  className={`rounded-lg ${colors.bg} px-6 py-3 text-sm font-medium text-white transition-all ${colors.hover}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  主CTA（建議6-8字）→
                </motion.button>
                <motion.button
                  className="rounded-lg border border-[#e5e5e5] px-6 py-3 text-sm text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  次CTA（建議4-6字）
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl bg-[#f5f5f5] p-4 shadow-xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                  <img
                    src="https://assets.youmind.com/features/top-feature-pick.png"
                    alt="產品預覽圖"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className={`absolute -bottom-4 -left-4 rounded-full ${colors.bg} px-4 py-2 text-xs font-medium text-white shadow-lg md:-left-8`}>
                ✓ 浮動標籤（4字內）
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. SocialProof-評價展示 */}
      <section id="trust" className="bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
              小標題（建議4-6字）
            </span>
            <h2 className="mb-8 font-serif text-2xl font-bold text-[#1a1a1a] md:text-4xl">
              區塊主標題（建議12-18字）
            </h2>
          </motion.div>

          <motion.div
            className="mx-auto max-w-3xl rounded-2xl border border-[#eee] bg-white p-8 shadow-sm md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-5 w-5 ${colors.text}`}>{Icons.star}</span>
                ))}
              </div>
            </div>
            <blockquote className="mb-8 text-center">
              <p className="font-serif text-lg leading-relaxed text-[#1a1a1a] md:text-xl">
                「用戶評價內容區域，建議60-100個中文字。可用於展示客戶使用產品後的真實反饋和感受。」
              </p>
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.light} ${colors.text}`}>
                {Icons.user}
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1a1a1a]">用戶姓名</p>
                <p className="text-sm text-[#999]">用戶身份/來源（建議6-10字）</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { num: "數據1", label: "標籤（4字內）", icon: Icons.users },
              { num: "數據2", label: "標籤（4字內）", icon: Icons.file },
              { num: "數據3", label: "標籤（4字內）", icon: Icons.target },
              { num: "數據4", label: "標籤（4字內）", icon: Icons.clock },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="rounded-xl border border-[#eee] bg-white p-6 text-center transition-shadow hover:shadow-md"
                whileHover={{ y: -3 }}
              >
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${colors.light} ${colors.text}`}>
                  {stat.icon}
                </div>
                <p className={`font-serif text-2xl font-bold ${colors.text} md:text-3xl`}>
                  {stat.num}
                </p>
                <p className="text-xs text-[#999] md:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="#">
              <motion.button
                className={`rounded-full ${colors.bg} px-8 py-3 text-sm font-medium text-white transition-all ${colors.hover}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                底部CTA（建議6-10字）→
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 6. CTA-居中轉化 */}
      <section id="cta" className="bg-white px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-serif text-2xl font-bold leading-snug text-[#1a1a1a] md:text-4xl">
              主標題區域
              <br className="hidden md:block" />
              建議15-25個中文字
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[#666]">
              描述文字區域，建議30-50個中文字。
              <br className="hidden md:block" />
              用於激勵用戶採取行動，支持換行顯示。
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <motion.button
                className={`rounded-full ${colors.bg} px-10 py-4 text-base font-medium text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl md:px-12 md:text-lg`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                主CTA（建議6-10字）→
              </motion.button>
              <motion.button
                className="rounded-full border border-[#e5e5e5] bg-white px-8 py-4 text-base text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                次CTA（建議4-6字）
              </motion.button>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#999]">
              <span className="flex items-center gap-1">
                <span className={`${colors.text}`}>{Icons.check}</span>
                輔助標籤1（4字內）
              </span>
              <span className="flex items-center gap-1">
                <span className={`${colors.text}`}>{Icons.check}</span>
                輔助標籤2（4字內）
              </span>
              <span className="flex items-center gap-1">
                <span className={`${colors.text}`}>{Icons.check}</span>
                輔助標籤3（4字內）
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eee] bg-white px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-[#999]">© 2026 您的公司名稱. 保留所有權利。</p>
            <div className="flex gap-6">
              <Link href="/" className="text-sm text-[#666] hover:text-[#1a1a1a]">返回首頁</Link>
              <Link href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">隱私政策</Link>
              <Link href="#" className="text-sm text-[#666] hover:text-[#1a1a1a]">服務條款</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
