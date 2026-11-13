"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/home.module.css";
import ScrollReveal from "@/components/resume/ScrollReveal";
import SideNav from "@/components/home/SideNav";
import ExperienceTimeline from "@/components/home/ExperienceTimeline";
import ScrollToTop from "@/components/blog/ScrollToTop";
import WechatContact from "@/components/home/WechatContact";
import { useLanguage } from "@/components/layout/LanguageProvider";
import homeCopy from "@/data/homeCopy";

export default function HomeContent() {
  const { locale } = useLanguage();
  const copy = homeCopy[locale];

  return (
    <>
      <SideNav />
      {/* ===== HERO ===== */}
      <section id="hero" className={styles.hero}>
        <div className={styles.section}>
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 className={styles.heroName}>
                {copy.name}
                <span className={styles.heroMbti}>INFJ</span>
              </h1>
              <p className={styles.heroTagline}>{copy.tagline}</p>
              <p className={styles.heroSub}>{copy.heroSub}</p>
              <div className={styles.heroDivider} />
            </div>
            <div className={styles.avatarWrap}>
              <Image
                src="/images/avatar.jpg"
                alt={copy.avatarAlt}
                width={400}
                height={400}
                className={styles.avatar}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Contact CTAs ===== */}
      <div className={styles.section} style={{ marginBottom: 72 }}>
        <div className={styles.heroCtaGroup}>
          <a
            href="/files/pang-mengtong-seo-resume.pdf"
            download="庞梦桐-SEO.pdf"
            className={styles.resumeCta}
          >
            <span className={styles.resumeCtaLogo}>
              <Image
                src="/images/pdf-logo.svg"
                alt=""
                width={20}
                height={20}
              />
            </span>
            <span>{copy.resumeCta}</span>
          </a>
          <WechatContact label={copy.contactCta} />
        </div>
      </div>

      {/* ===== EXPERIENCE ===== */}
      <section id="experience" style={{ paddingBottom: 80 }}>
        <div className={styles.section}>
          <ScrollReveal>
            <p className={styles.sectionLabel}>Experience</p>
            <h2 className={styles.sectionHeading}>{copy.experienceHeading}</h2>
            <p className={styles.sectionSub}>{copy.experienceSub}</p>
          </ScrollReveal>
        </div>
        <ScrollReveal>
          <ExperienceTimeline />
        </ScrollReveal>
      </section>

      {/* ===== ABOUT & SEO JOURNEY ===== */}
      <section id="about" className={styles.section} style={{ paddingBottom: 80, maxWidth: 1100 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>About</p>
          <h2 className={styles.sectionHeading}>{copy.aboutHeading}</h2>
        </ScrollReveal>

        <div className={styles.aboutColumns}>
          <div className={styles.aboutTexts}>
            {copy.aboutParagraphs.map((paragraph, paragraphIndex) => (
              <ScrollReveal key={paragraphIndex}>
                <p className={styles.aboutText}>
                  {paragraph.map((segment, segmentIndex) => {
                    if (segment.href) {
                      return (
                        <a
                          key={segmentIndex}
                          href={segment.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.inlineLink}
                        >
                          {segment.text}
                        </a>
                      );
                    }
                    if (segment.emphasis) {
                      return (
                        <span key={segmentIndex} className={styles.highlight}>
                          {segment.text}
                        </span>
                      );
                    }
                    return <Fragment key={segmentIndex}>{segment.text}</Fragment>;
                  })}
                </p>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className={styles.capabilityPanel}>
            <h3 className={styles.capabilityTitle}>{copy.capabilityTitle}</h3>
            <div className={styles.capabilityGrid}>
              {copy.capabilities.map((capability) => (
                <div
                  className={styles.capabilityCard}
                  key={`${capability.from}-${capability.to}`}
                >
                  <p className={styles.capabilityFrom}>{capability.from}</p>
                  <span className={styles.capabilityArrow} aria-hidden="true">→</span>
                  <p className={styles.capabilityTo}>{capability.to}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
        </div>
      </section>

      {/* ===== WORKS ===== */}
      <section id="works" className={styles.section} style={{ paddingBottom: 80, maxWidth: 1100 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>Works</p>
          <h2 className={styles.sectionHeading}>{copy.worksHeading}</h2>
          <p className={styles.sectionSub}>{copy.worksSub}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.worksGrid}>
            <div className={styles.worksPanel}>
              <div className={styles.worksPanelHeader}>
                <h3 className={styles.worksPanelTitle}>{copy.worksFeishuLabel}</h3>
              </div>
              {copy.feishuDocs.map((doc) => (
                <a
                  key={doc.title}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.worksDoc}
                >
                  <span className={styles.worksDocTitle}>
                    <span className={styles.worksDocName}>
                      <span className={styles.worksDocIcon}>
                        <Image src={doc.icon || "/images/feishu-logo.png"} alt="" width={30} height={30} />
                      </span>
                      {doc.title}
                    </span>
                    <span className={styles.worksDocArrow} aria-hidden="true">↗</span>
                  </span>
                  <span className={styles.worksDocDesc}>{doc.desc}</span>
                </a>
              ))}
            </div>

            <div className={`${styles.worksPanel} ${styles.worksCasesPanel}`}>
              <div className={styles.worksPanelHeader}>
                <h3 className={styles.worksPanelTitle}>{copy.worksCasesLabel}</h3>
              </div>
              {copy.caseDocs.map((doc) => (
                <a
                  key={doc.title}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.worksDoc}
                >
                  <span className={styles.worksDocTitle}>
                    <span className={styles.worksDocName}>
                      <span className={styles.worksDocIcon}>
                        <Image src={doc.icon || "/images/feishu-logo.png"} alt="" width={30} height={30} />
                      </span>
                      {doc.title}
                    </span>
                    <span className={styles.worksDocArrow} aria-hidden="true">↗</span>
                  </span>
                  <span className={styles.worksDocDesc}>{doc.desc}</span>
                </a>
              ))}
              <div className={styles.worksBlogModule}>
                <div>
                  <h3 className={styles.worksBlogTitle}>{copy.worksBlogLabel}</h3>
                  <p className={styles.worksBlogDescription}>{copy.worksBlogDescription}</p>
                </div>
                <Link href="/blogs" className={styles.worksBlogCta}>
                  {copy.ctaLink}
                </Link>
              </div>
            </div>

          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.wechatLayout}>
            <h3 className={`${styles.worksGroupTitle} ${styles.wechatGroupTitle}`}>
              <span className={styles.wechatTitleIcon}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#07C160" aria-hidden="true">
                  <path d="M8.7 4C4.9 4 2 6.6 2 9.9c0 1.9 1 3.5 2.6 4.6l-.7 2.2 2.6-1.3c.7.2 1.4.3 2.2.3h.4A5.8 5.8 0 0 1 9 14.3C9 11 12 8.4 15.6 8.4h.5C15.5 5.9 12.4 4 8.7 4z" />
                  <path d="M15.7 9.5c-3.3 0-5.9 2.2-5.9 4.9s2.6 4.9 5.9 4.9c.6 0 1.2-.1 1.8-.2l2.2 1.1-.6-1.9c1.6-.9 2.6-2.4 2.6-4 0-2.7-2.7-4.8-6-4.8z" />
                </svg>
              </span>
              {copy.worksWechatLabel}
            </h3>
            <div className={styles.wechatAccountCard}>
              <span className={styles.wechatAccountAvatar}>
                <Image
                  src={copy.wechatAccount.avatar}
                  alt={copy.wechatAccount.name}
                  width={52}
                  height={52}
                />
              </span>
              <span className={styles.wechatAccountName}>{copy.wechatAccount.name}</span>
            </div>
          </div>
          <div className={`${styles.productGrid} ${styles.wechatArticleGrid}`}>
            {copy.wechatArticles.map((article) => (
              <ScrollReveal key={article.name}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.productWindow} ${styles.wechatArticleWindow}`}
                >
                  <span className={styles.productChrome}>
                    <span className={styles.productDot} />
                    <span className={styles.productDot} />
                    <span className={styles.productDot} />
                    <span className={styles.productDomain}>{article.domain}</span>
                  </span>
                  <span className={styles.productShot}>
                    <Image
                      src={article.image}
                      alt={article.name}
                      width={1274}
                      height={542}
                    />
                  </span>
                  <span className={styles.productInfo}>
                    <span className={styles.productName}>
                      {article.name}
                      <span className={styles.productArrow} aria-hidden="true">↗</span>
                    </span>
                    <span className={styles.productDesc}>{article.desc}</span>
                    <span className={styles.productTags}>
                      {article.tags.map((tag) => (
                        <span key={tag} className={styles.productTag}>{tag}</span>
                      ))}
                    </span>
                  </span>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h3 className={styles.worksGroupTitle}>{copy.worksProductsLabel}</h3>
        </ScrollReveal>
        <div className={`${styles.productGrid} ${styles.productGridThree}`}>
          {copy.products.map((product) => {
            const isExternal = product.url.startsWith("http");
            return (
              <ScrollReveal key={product.name}>
                <a
                  href={product.url}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={styles.productWindow}
                >
                  <span className={styles.productChrome}>
                    <span className={styles.productDot} />
                    <span className={styles.productDot} />
                    <span className={styles.productDot} />
                    <span className={styles.productDomain}>{product.domain}</span>
                  </span>
                  <span className={styles.productShot}>
                    <Image src={product.image} alt={product.name} width={1200} height={750} />
                  </span>
                  <span className={styles.productInfo}>
                    <span className={styles.productName}>
                      {product.name}
                      <span className={styles.productArrow} aria-hidden="true">↗</span>
                    </span>
                    <span className={styles.productDesc}>{product.desc}</span>
                    <span className={styles.productTags}>
                      {product.tags.map((tag) => (
                        <span key={tag} className={styles.productTag}>{tag}</span>
                      ))}
                    </span>
                  </span>
                </a>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ===== TOOLBOX ===== */}
      <section id="toolbox" className={styles.section} style={{ paddingBottom: 80, maxWidth: 1000 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>Toolbox</p>
          <h2 className={styles.sectionHeading}>{copy.toolboxHeading}</h2>
          <p className={styles.aboutText}>{copy.toolboxIntro}</p>
        </ScrollReveal>

        {copy.toolCategories.map((category) => (
          <ScrollReveal key={category.number}>
            <div className={styles.toolCategory}>
              <div className={styles.toolCategoryHeader}>
                <span className={styles.toolCategoryNum}>{category.number}</span>
                <div>
                  <h3 className={styles.toolCategoryTitle}>{category.title}</h3>
                  <p className={styles.toolCategoryDesc}>{category.description}</p>
                </div>
              </div>
              <div className={styles.toolCategoryItems}>
                {category.items.map((item) => (
                  <div className={styles.toolItem} key={item.name}>
                    <div className={styles.toolItemName}>{item.name}</div>
                    <div className={styles.toolItemDesc}>{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* ===== CTA ===== */}
      <ScrollReveal>
        <section className={styles.cta}>
          <h2 className={styles.ctaHeading}>{copy.ctaHeading}</h2>
          <p className={styles.ctaDesc}>{copy.ctaDescription}</p>
          <div className={styles.ctaButtons}>
            <WechatContact label={copy.contactCta} />
          </div>
        </section>
      </ScrollReveal>
      <ScrollToTop />
    </>
  );
}
