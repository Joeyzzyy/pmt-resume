/**
 * Maidinhk AI Matching Landing Page
 * 
 * Maidinhk AI 匹配系統落地頁 - 固定藍色主題
 * 專為香港家庭提供專業的長者照護工人匹配服務
 * 
 * 圖片資源路徑：assets/wheelchair-transport-guide/
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// 固定藍色主題配置
const colors = {
  bg: "bg-blue-600",
  text: "text-blue-600",
  hover: "hover:bg-blue-700",
  light: "bg-blue-50"
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
  shield: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  heart: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  filter: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
};

export default function MaidinhkLandingPage() {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* Image Lightbox */}
      <AnimatePresence>
        {isImageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setIsImageOpen(false)}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              onClick={() => setIsImageOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            {/* Full Size Image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
              src="/assets/wheelchair-transport-guide/how-it-works.webp"
              alt="AI 匹配流程"
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* 1. Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-white px-4 pb-10 pt-14 md:px-6 md:pb-16 md:pt-18">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            className={`mb-6 inline-block rounded-full border border-[#e5e5e5] bg-white px-4 py-1.5 text-xs font-medium ${colors.text}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[10px]">✓</span>
            專為長者照護設計的 AI 匹配系統
          </motion.div>

          <motion.h1
            className="mb-6 font-serif text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a] md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          >
            告別盲選！用 AI 為長者匹配
            <br className="hidden md:block" />
            最懂「無障礙照護」的姐姐
          </motion.h1>
          
          <motion.p
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-[#666] md:text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            不再浪費時間翻閱數百份簡歷。Maidinhk AI 系統根據您的照護需求（如：<strong className="font-semibold">推輪椅</strong>技巧、無障礙照護經驗），
            <br className="hidden md:block" />
            秒速篩選具備專業 SOP 意識的優質工人。
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="https://maidinhk.com/auth" target="_blank" rel="noopener noreferrer">
              <motion.button
                className={`rounded-full ${colors.bg} px-8 py-4 text-base font-medium text-white transition-all hover:scale-105 hover:shadow-xl md:px-10 md:text-lg`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                立即免費體驗 AI 匹配
              </motion.button>
            </Link>
            <Link href="https://api.whatsapp.com/send?phone=68134733" target="_blank" rel="noopener noreferrer">
              <motion.button
                className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 py-4 text-base text-[#666] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                WhatsApp 諮詢
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 flex max-w-2xl justify-center gap-8 border-t border-[#eee] pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              { num: "3,000+", label: "工人簡歷" },
              { num: "95%", label: "匹配準確率" },
              { num: "90%", label: "節省時間" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`font-serif text-2xl font-bold ${colors.text} md:text-3xl`}>{stat.num}</p>
                <p className="text-xs text-[#999]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. Feature Section */}
      <section id="feature" className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
              核心優勢
            </span>
            <h2 className="mx-auto max-w-3xl font-serif text-2xl font-bold leading-snug text-[#1a1a1a] md:text-4xl">
              不再是大海撈針，AI 幫您鎖定
              <br className="hidden md:block" />
              具備真實照護背景的候選人
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[#666] md:text-base">
              深度檢索工人過往真實執業紀錄，精準識別「<strong className="font-semibold">推輪椅</strong>技巧」與「護理傷殘人士」核心標籤。自動過濾無效信息，節省 90% 閱讀時間。
            </p>
          </motion.div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { 
                icon: Icons.search, 
                title: "深度檢索", 
                desc: "檢索工人過往真實執業紀錄，識別「照顧長者」與「護理傷殘人士」核心標籤",
                highlight: "真實背景"
              },
              { 
                icon: Icons.lightning, 
                title: "秒速篩選", 
                desc: "自動過濾無效信息，AI 在數秒內完成傳統需要數小時的簡歷篩選工作",
                highlight: "節省 90% 時間"
              },
              { 
                icon: Icons.target, 
                title: "精準匹配", 
                desc: "根據長者具體狀況，智能推薦 95% 以上符合需求的優質候選人",
                highlight: "95% 準確率"
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
                <Link href="https://maidinhk.com/about" target="_blank" rel="noopener noreferrer">
                  <motion.button
                    className={`text-sm font-medium ${colors.text} underline underline-offset-4 transition-all hover:no-underline`}
                    whileHover={{ x: 3 }}
                  >
                    了解更多 →
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="https://maidinhk.com/auth" target="_blank" rel="noopener noreferrer">
              <motion.button
                className={`rounded-full ${colors.bg} px-8 py-3 text-sm font-medium text-white transition-all ${colors.hover}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                精準過濾，查看合格人選
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. How it Works - 左圖右文結構 */}
      <section id="how" className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
              使用流程
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] md:text-4xl">
              簡單三步，精準對接
            </h2>
          </motion.div>

          {/* 左圖右文佈局 */}
          <motion.div
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* 左側：圖片 - 完整顯示，點擊放大 */}
            <div className="order-1 flex items-center">
              <div className="w-full rounded-2xl bg-[#f8f8f8] p-6">
                <motion.div 
                  className="relative w-full cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setIsImageOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="/assets/wheelchair-transport-guide/how-it-works.webp"
                    alt="AI 匹配流程"
                    className="h-auto w-full object-contain"
                  />
                  {/* 點擊放大提示 */}
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/20"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg"
                    >
                      <svg className="h-6 w-6 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* 右側：三步驟內容 */}
            <div className="order-2 flex flex-col justify-center">
              <div className="space-y-5">
                {[
                  { 
                    step: "01", 
                    title: "输入需求",
                    desc: "勾選長者狀況與照護需求（如：推輪椅技巧），系統智能解析健康狀況、行動能力、特殊護理需求等具體要求。",
                    icon: Icons.clipboard,
                  },
                  { 
                    step: "02", 
                    title: "AI 运算",
                    desc: "AI 深度对比 3,000 名工人记录，从经验、技能、态度三个维度分析匹配度与专业适配性。",
                    icon: Icons.lightning,
                  },
                  { 
                    step: "03", 
                    title: "即时查看",
                    desc: "获取 95% 以上符合需求的精准简历列表，附详细匹配报告与工人背景、经验证明。",
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
                        <div className="mx-auto mt-2 h-10 w-0.5 bg-gradient-to-b from-[#e5e5e5] to-transparent"></div>
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

              {/* CTA 按鈕 */}
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link href="https://maidinhk.com/auth" target="_blank" rel="noopener noreferrer">
                  <motion.button
                    className={`rounded-full ${colors.bg} px-8 py-3 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    30秒開啟 AI 篩選
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Social Proof */}
      <section id="trust" className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-block text-xs font-medium uppercase tracking-wider text-[#999]">
              用戶評價
            </span>
            <h2 className="mb-8 font-serif text-2xl font-bold text-[#1a1a1a] md:text-4xl">
              1,000+ 香港家庭已通過 AI 找到滿意人選
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
                「我媽媽中風後需要坐輪椅，之前在其他平台請的姐姐，簡歷上寫會<strong className="font-semibold">推輪椅</strong>，結果上門才發現根本不會，過個門檻都手忙腳亂。在 Maidinhk 用 AI 匹配，系統幫我篩選出具備<strong className="font-semibold">照顧老人技能</strong>的姐姐，下午就約到了！姐姐一來就熟練地幫媽媽繫好安全帶，<strong className="font-semibold">推輪椅</strong>過斜坡、轉彎都很穩，簡歷和實際技能完全對得上。終於找到真正會照護的人，不用再試錯了！」
              </p>
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.light} ${colors.text}`}>
                {Icons.user}
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1a1a1a]">陳太</p>
                <p className="text-sm text-[#999]">太古城</p>
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
              { num: "1,000+", label: "滿意家庭", icon: Icons.users },
              { num: "3,000+", label: "工人簡歷", icon: Icons.file },
              { num: "95%", label: "匹配準確率", icon: Icons.target },
              { num: "24h", label: "平均匹配時長", icon: Icons.clock },
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
            <Link href="https://maidinhk.com/auth" target="_blank" rel="noopener noreferrer">
              <motion.button
                className={`rounded-full ${colors.bg} px-8 py-3 text-sm font-medium text-white transition-all ${colors.hover}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                查看更多家庭的成功案例 →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section id="cta" className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-serif text-2xl font-bold leading-snug text-[#1a1a1a] md:text-4xl">
              別讓照護壓力成為負擔，
              <br className="hidden md:block" />
              今天就開始智能匹配
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[#666]">
              現在註冊，即可享受 AI 精準匹配 3,000 份簡歷
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="https://maidinhk.com/auth" target="_blank" rel="noopener noreferrer">
                <motion.button
                  className={`rounded-full ${colors.bg} px-10 py-4 text-base font-medium text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl md:px-12 md:text-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  立即啟動 AI 匹配引擎 →
                </motion.button>
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#999]">
              <span className="flex items-center gap-1">
                <span className={`${colors.text}`}>{Icons.check}</span>
                無需信用卡
              </span>
              <span className="flex items-center gap-1">
                <span className={`${colors.text}`}>{Icons.check}</span>
                30 秒完成註冊
              </span>
              <span className="flex items-center gap-1">
                <span className={`${colors.text}`}>{Icons.check}</span>
                免費試用
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eee] bg-white px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-[#999]">© 2026 Maidinhk. 保留所有權利。</p>
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
