"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NavItem {
  id: string;
  label: string;
}

const navItems: NavItem[] = [
  { id: "hero", label: "Hero居中" },
  { id: "feature", label: "三列卡片" },
  { id: "how", label: "左圖右文" },
  { id: "preview", label: "右圖左文" },
  { id: "trust", label: "評價展示" },
  { id: "cta", label: "居中CTA" },
];

export default function YouMindNavigator() {
  const [activeId, setActiveId] = useState<string>("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      const sections = navItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      const scrollPosition = scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const offsetTop = section.element.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.aside
      className="fixed left-2 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        pointerEvents: "auto",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <nav className="w-20 rounded-lg border border-[#e5e5e5] bg-white/95 p-2 shadow-md backdrop-blur-md">
        <div className="mb-2 border-b border-[#f0f0f0] pb-1.5">
          <p className="text-[10px] font-semibold text-[#1a1a1a]">導覽</p>
        </div>

        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`group flex w-full items-center justify-center rounded px-1 py-1 text-center transition-all duration-200 ${
                  activeId === item.id
                    ? "bg-[#1a1a1a] text-white"
                    : "hover:bg-[#f5f5f5]"
                }`}
              >
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-2 border-t border-[#f0f0f0] pt-1.5">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex w-full items-center justify-center rounded py-1 text-[9px] text-[#999] transition-colors hover:bg-[#f5f5f5] hover:text-[#666]"
          >
            <svg className="mr-0.5 h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            頂部
          </button>
        </div>
      </nav>
    </motion.aside>
  );
}
