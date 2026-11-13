"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/sidenav.module.css";
import { useLanguage } from "@/components/layout/LanguageProvider";

interface SideNavSection {
  id: string;
  label: { zh: string; en: string };
}

const defaultSections: SideNavSection[] = [
  { id: "experience", label: { zh: "职业经历", en: "Experience" } },
  { id: "about", label: { zh: "SEO 实践之路", en: "SEO Journey" } },
  { id: "works", label: { zh: "沉淀与作品", en: "Works" } },
  { id: "toolbox", label: { zh: "工具与选型", en: "Toolbox" } },
];

export default function SideNav({ sections = defaultSections }: { sections?: SideNavSection[] }) {
  const { locale } = useLanguage();
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections
        .map(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return { id, top: el.getBoundingClientRect().top };
        })
        .filter(Boolean) as { id: string; top: number }[];

      if (offsets.length === 0) return;

      const current = offsets.reduce((closest, item) =>
        Math.abs(item.top - 100) < Math.abs(closest.top - 100)
          ? item
          : closest
      );

      if (current) setActive(current.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={styles.sideNav}
      aria-label={locale === "zh" ? "页面导航" : "Page navigation"}
    >
      <ul className={styles.navList}>
        {sections.map(({ id, label }) => (
          <li key={id}>
            <button
              className={`${styles.navItem} ${active === id ? styles.active : ""}`}
              onClick={() => scrollTo(id)}
              aria-current={active === id ? "true" : undefined}
            >
              <span className={styles.dot} />
              <span className={styles.label}>{label[locale]}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
