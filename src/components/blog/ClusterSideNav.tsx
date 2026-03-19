"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/sidenav.module.css";

interface SiblingPost {
  slug: string;
  title: string;
  shortTitle?: string;
  cluster: string;
}

export default function ClusterSideNav({ posts }: { posts: SiblingPost[] }) {
  const pathname = usePathname();

  if (posts.length <= 1) return null;

  return (
    <nav className={styles.sideNav} aria-label="同主题文章导航">
      <ul className={styles.navList}>
        {posts.map((p) => {
          const href = `/${p.cluster}/${p.slug}`;
          const isActive = pathname === href;
          return (
            <li key={p.slug}>
              <Link
                href={href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.dot} />
                <span className={styles.label}>{p.shortTitle || p.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
