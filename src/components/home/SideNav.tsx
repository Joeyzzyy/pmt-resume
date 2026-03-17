"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/sidenav.module.css";

const sections = [
  { id: "hero", label: "回到顶部" },
  { id: "about", label: "经历与项目" },
  { id: "key-results", label: "SEO 成果" },
  { id: "toolbox", label: "工具与选型" },
];

export default function SideNav() {
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
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={styles.sideNav}
      aria-label="页面导航"
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
              <span className={styles.label}>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}