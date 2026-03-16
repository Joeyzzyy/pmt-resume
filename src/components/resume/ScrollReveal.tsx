"use client";

import { useEffect, useRef } from "react";
import styles from "@/styles/resume.module.css";

interface ScrollRevealProps {
  children: React.ReactNode;
  stagger?: boolean;
  className?: string;
}

export default function ScrollReveal({
  children,
  stagger = false,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (stagger) {
              entry.target.classList.add(styles.staggerVisible);
            } else {
              entry.target.classList.add(styles.revealVisible);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger]);

  const baseClass = stagger ? styles.staggerChildren : styles.reveal;

  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}
