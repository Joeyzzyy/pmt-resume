import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/styles/home.module.css";
import ScrollReveal from "@/components/resume/ScrollReveal";
import SideNav from "@/components/home/SideNav";
import LightboxImage from "@/components/home/LightboxImage";
import { getLatestPosts, getTotalPostCount, phases } from "@/data/posts";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: {
    absolute: "庞梦桐 — 内容运营 · SEO 增长 | 从特斯拉到独立站 SEO 实战",
  },
  description:
    "庞梦桐，前特斯拉新媒体运营，现专注独立站 SEO 增长。3 个月将 maidinhk.com 核心关键词推上 Google 首页，191 个关键词进入 Top 10。关键词调研、内容策略、技术 SEO、数据分析——完整的 SEO 能力闭环。",
  keywords: [
    "庞梦桐",
    "SEO",
    "内容运营",
    "SEO 增长",
    "独立站 SEO",
    "内容驱动增长",
    "Google SEO",
    "关键词调研",
    "内容策略",
    "技术 SEO",
  ],
  openGraph: {
    title: "庞梦桐 — 内容运营 · SEO 增长",
    description:
      "前特斯拉新媒体运营，3 个月从零将独立站核心关键词推上 Google 首页。用数据和内容驱动增长的 SEO 实战派。",
    url: "https://itspmt.com",
    siteName: "庞梦桐 | SEO 增长实战",
    locale: "zh_CN",
    type: "website",
  },
};

export default function HomePage() {
  const latestPosts = getLatestPosts(3);

  return (
    <>
      <SideNav />
      {/* ===== HERO ===== */}
      <section id="hero" className={styles.hero}>
        <div className={styles.section}>
          <h1 className={styles.heroName}>庞梦桐</h1>
          <p className={styles.heroTagline}>
            内容运营 · SEO 增长 · 数据驱动
          </p>
          <p className={styles.heroSub}>
            从特斯拉新媒体运营到独立站 SEO 实践，用内容创造长期价值
          </p>
          <div className={styles.heroDivider} />
        </div>
      </section>

      {/* ===== ABOUT & SEO JOURNEY ===== */}
      <section id="about" className={styles.section} style={{ paddingBottom: 80 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>About</p>
          <h2 className={styles.sectionHeading}>
            用内容连接用户，用数据驱动增长
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <p className={styles.aboutText}>
            我叫庞梦桐，做了近四年新媒体运营。在<span className={styles.highlight}>特斯拉</span>期间，我统筹微博、抖音、小红书等百万级账号的内容矩阵与舆情监测；更早之前在声影动漫负责双微运营与短视频策划。这些经历让我积累了扎实的内容感觉和平台运营能力。
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className={styles.aboutText}>
            离开特斯拉后，我 gap 了一年。先是备战司考，虽然没有上岸，但这段经历锻炼了我的逻辑思维和信息检索能力。之后开始做职业探索，在 AI 浪潮下接触到了<span className={styles.highlight}>SaaS 产品出海</span>这个赛道——我坚信这是未来极具前景的方向。于是系统学习了出海 SaaS 的营销全套方法论，在 SEO、SEM、红人营销、社媒营销、社群营销几个方向中，最终选择<span className={styles.highlight}>SEO 和 Reddit 运营</span>作为主战场深入学习和实践。
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className={styles.aboutText}>
            为了把学到的 SEO 知识真正落地，我与香港的朋友合作了{" "}
            <a
              href="https://maidinhk.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              maidinhk.com
            </a>
            {" "}项目——一个面向香港外佣/家政服务的垂直信息站。没有任何域名权重、没有外链资源、没有付费推广，纯靠内容和策略。
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className={styles.aboutText}>
            第一步是<span className={styles.highlight}>主题规划</span>，用 Gemini 做深度主题集群分析，梳理出整个赛道的内容蓝图，确定哪些话题值得写、怎么组织成 Topic Cluster。然后进入<span className={styles.highlight}>关键词调研</span>，用 Semrush 分析搜索意图、筛选长尾词机会，建立完整的关键词矩阵。
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className={styles.aboutText}>
            内容创作环节，我用 <span className={styles.highlight}>Gemini 辅助大纲发散</span>，人工撰写正文，YouMind 生成配图。写完之后通过 <span className={styles.highlight}>Contentful</span> 管理和发布内容，同时引入 QuickCreator 审计每篇文章的 EEAT 与 TDK，用 Perplexity 溯源权威引用，确保内容质量经得起 Google 的检验。
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className={styles.aboutText}>
            上线后，我用 <span className={styles.highlight}>Google Search Console</span> 持续监控排名和点击率，基于数据不断优化标题、调整内容策略。整个过程遵循「规划 → 调研 → 创作 → 发布 → 监控 → 迭代」的闭环。<span className={styles.highlight}>3 个月后，核心关键词冲上了 Google 首页，页面收录率达 95%。</span>
          </p>
        </ScrollReveal>
      </section>
      <section id="key-results" className={styles.section} style={{ paddingBottom: 80 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>Key Results</p>
          <h2 className={styles.sectionHeading}>
            与其说我能做 SEO，不如直接看数据
          </h2>
          <p className={styles.aboutText}>
            以下 5 个维度，是我从零运营 maidinhk.com 3
            个月的真实成果。所有数据均来自 Google Search Console
            导出，可随时验证。
          </p>
        </ScrollReveal>

        {/* ===== 5 维度 SEO 数据展示 ===== */}
        <ScrollReveal>
          <div className={styles.dataShowcase}>
            {/* 01 流量增长爆发力 */}
            <div className={styles.dataCard}>
              <span className={styles.dataNum}>01</span>
              <h3 className={styles.dataTitle}>流量增长爆发力</h3>
              <p className={styles.dataHighlight}>
                月曝光增长 28,000+ &middot; 月点击增长 1,000+
              </p>
              <p className={styles.dataDesc}>
                在没有任何权重的新域上，3
                个月内实现从几乎为零到月均千次精准点击，体现了极强的内容爆发力和策略正确性。
              </p>
              <div className={styles.dataImages}>
                <LightboxImage
                  src="/images/seo-data/01-traffic-a.png"
                  alt="流量增长趋势图 - 曝光量"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
                <LightboxImage
                  src="/images/seo-data/01-traffic-b.png"
                  alt="流量增长趋势图 - 点击量"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
              </div>
            </div>

            {/* 02 关键词覆盖广度与深度 */}
            <div className={styles.dataCard}>
              <span className={styles.dataNum}>02</span>
              <h3 className={styles.dataTitle}>关键词覆盖广度与深度</h3>
              <p className={styles.dataHighlight}>
                18 个关键词 Top 3 &middot; 191 个关键词 Top 10
              </p>
              <p className={styles.dataDesc}>
                近 200
                个首页关键词意味着构建了完整的内容集群（Topic
                Clusters），精准覆盖外佣/家政服务垂直赛道的搜索意图。
              </p>
              <div className={styles.dataImages}>
                <LightboxImage
                  src="/images/seo-data/02-keywords-a.png"
                  alt="关键词排名分布"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
                <LightboxImage
                  src="/images/seo-data/02-keywords-b.png"
                  alt="关键词覆盖详情"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
              </div>
            </div>

            {/* 03 高质量内容点击率 */}
            <div className={styles.dataCard}>
              <span className={styles.dataNum}>03</span>
              <h3 className={styles.dataTitle}>高质量内容点击率（CTR）</h3>
              <p className={styles.dataHighlight}>
                核心文章 CTR 10.02% &middot; 高意向词 CTR 31.8%
              </p>
              <p className={styles.dataDesc}>
                行业平均搜索点击率 3%-5%，我的核心页面达到
                10%-30%，是 TDK
                优化极致的体现——不仅懂流量，还懂用户心理学。
              </p>
              <div className={styles.dataImages}>
                <LightboxImage
                  src="/images/seo-data/03-ctr-a.png"
                  alt="核心文章点击率数据"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
              </div>
            </div>

            {/* 04 高价值转化意图 */}
            <div className={styles.dataCard}>
              <span className={styles.dataNum}>04</span>
              <h3 className={styles.dataTitle}>高价值转化意图分析</h3>
              <p className={styles.dataHighlight}>
                工具/攻略类页面贡献 30%+ 核心流量
              </p>
              <p className={styles.dataDesc}>
                SEO
                不是盲目追求泛流量，而是业务导向。下载量和流程查询意味着高粘性和高转化潜力，体现了对商业价值的判断力。
              </p>
              <div className={styles.dataImages}>
                <LightboxImage
                  src="/images/seo-data/04-conversion-a.png"
                  alt="高价值页面流量分布"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
              </div>
            </div>

            {/* 05 跨区域市场渗透 */}
            <div className={styles.dataCard}>
              <span className={styles.dataNum}>05</span>
              <h3 className={styles.dataTitle}>跨区域市场渗透</h3>
              <p className={styles.dataHighlight}>
                香港主市场 90%+ &middot; 辐射台湾、澳门及海外华人
              </p>
              <p className={styles.dataDesc}>
                主攻香港的同时，具备多语言/多地区 SEO
                布局视野，通过内容分发触达全球长尾流量。
              </p>
              <div className={styles.dataImages}>
                <LightboxImage
                  src="/images/seo-data/05-region-a.png"
                  alt="跨区域流量分布"
                  width={480}
                  height={288}
                  className={styles.dataImg}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

      </section>

      {/* ===== TOOLBOX ===== */}
      <section id="toolbox" className={styles.section} style={{ paddingBottom: 80 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>Toolbox</p>
          <h2 className={styles.sectionHeading}>我的 SEO 工具栈</h2>
          <p className={styles.aboutText}>
            做 SEO 不缺工具，缺的是知道什么环节该用什么。以下是我在实践中筛选出的组合——每个工具解决一个明确的问题，没有冗余。
          </p>
        </ScrollReveal>

        {/* 调研与分析 */}
        <ScrollReveal>
          <div className={styles.toolCategory}>
            <div className={styles.toolCategoryHeader}>
              <span className={styles.toolCategoryNum}>01</span>
              <div>
                <h3 className={styles.toolCategoryTitle}>调研与分析</h3>
                <p className={styles.toolCategoryDesc}>选型逻辑：需要覆盖「发现机会 → 验证数据 → 持续监控」三个阶段，Semrush 负责前期调研，GSC 负责上线后的真实反馈。</p>
              </div>
            </div>
            <div className={styles.toolCategoryItems}>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>Semrush</div>
                <div className={styles.toolItemDesc}>分析搜索量与关键词难度，研究竞品排名策略，筛选长尾词机会并构建关键词矩阵</div>
              </div>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>Google Search Console</div>
                <div className={styles.toolItemDesc}>监控页面索引状态，追踪关键词排名变化与点击率，用真实搜索数据驱动内容迭代</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* AI 内容生产 */}
        <ScrollReveal>
          <div className={styles.toolCategory}>
            <div className={styles.toolCategoryHeader}>
              <span className={styles.toolCategoryNum}>02</span>
              <div>
                <h3 className={styles.toolCategoryTitle}>AI 内容生产</h3>
                <p className={styles.toolCategoryDesc}>选型逻辑：一个人做内容站，产能是瓶颈。用 Gemini 做思维发散，Perplexity 做事实核查，YouMind 做视觉资产——三者互补，人工把控终稿质量。</p>
              </div>
            </div>
            <div className={styles.toolCategoryItems}>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>Gemini</div>
                <div className={styles.toolItemDesc}>主题集群规划、文章大纲发散、搜索意图分析，大幅提升内容生产效率和覆盖广度</div>
              </div>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>Perplexity</div>
                <div className={styles.toolItemDesc}>溯源权威数据和行业报告，为文章提供可信引用，增强内容的 EEAT 权威性</div>
              </div>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>YouMind</div>
                <div className={styles.toolItemDesc}>为每篇文章创建原创配图和信息图，提升视觉吸引力和页面停留时间</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 发布与质检 */}
        <ScrollReveal>
          <div className={styles.toolCategory}>
            <div className={styles.toolCategoryHeader}>
              <span className={styles.toolCategoryNum}>03</span>
              <div>
                <h3 className={styles.toolCategoryTitle}>发布与质检</h3>
                <p className={styles.toolCategoryDesc}>选型逻辑：内容管理需要结构化，质量把控需要自动化。Contentful 管「存」和「发」，QuickCreator 管「查」和「审」。</p>
              </div>
            </div>
            <div className={styles.toolCategoryItems}>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>Contentful</div>
                <div className={styles.toolItemDesc}>Headless CMS，通过结构化内容模型管理文章与分类，API 驱动前端渲染，支撑多语言分发</div>
              </div>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>QuickCreator Extension</div>
                <div className={styles.toolItemDesc}>实时侦测页面关键词密度、审计 EEAT 信号、校验 TDK 标签，确保每篇内容发布前达标</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 工程与开发 */}
        <ScrollReveal>
          <div className={styles.toolCategory}>
            <div className={styles.toolCategoryHeader}>
              <span className={styles.toolCategoryNum}>04</span>
              <div>
                <h3 className={styles.toolCategoryTitle}>工程与开发</h3>
                <p className={styles.toolCategoryDesc}>选型逻辑：非工程背景，但技术 SEO 离不开代码，AI 时代更需要「会用工具的人」。我在学 SEO 的同时自学了 Claude Code，从零搭建了你正在浏览的这个网站。</p>
              </div>
            </div>
            <div className={styles.toolCategoryItems}>
              <div className={styles.toolItem}>
                <div className={styles.toolItemName}>Claude Code</div>
                <div className={styles.toolItemDesc}>AI 编程搭档。用它搭建本站（Next.js + Tailwind）、调试技术 SEO 问题。从 0 到 1 体现的是快速学习和跨领域整合能力</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== FEATURED POSTS ===== */}
      <section id="posts" className={styles.section} style={{ paddingBottom: 80 }}>
        <ScrollReveal>
          <p className={styles.sectionLabel}>Featured Posts</p>
          <h2 className={styles.sectionHeading}>SEO 实战笔记精选</h2>
          <p className={styles.aboutText}>
            我把每一步实践写成了文章——从理论到落地，完整记录一个 SEO
            新手的成长过程。
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.featuredGrid}>
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={styles.featuredCard}
              >
                <div className={styles.featuredMeta}>
                  <span className={styles.featuredCategory}>
                    {post.category}
                  </span>
                  {post.tools.length > 0 && (
                    <span className={styles.featuredTools}>
                      {post.tools.join(" · ")}
                    </span>
                  )}
                </div>
                <h3 className={styles.featuredTitle}>{post.title}</h3>
                <p className={styles.featuredExcerpt}>{post.excerpt}</p>
                <div className={styles.featuredBottom}>
                  <span className={styles.featuredDate}>
                    {(() => {
                      const d = new Date(post.publishDate);
                      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
                    })()}
                  </span>
                  <span className={styles.featuredPhase}>
                    Phase {String(post.phase).padStart(2, "0")} · {phases.find(p => p.id === post.phase)?.label}
                  </span>
                </div>
                <span className={styles.featuredLink}>阅读全文 →</span>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.viewAll}>
            <Link href="/blog" className={styles.viewAllLink}>
              查看全部 {getTotalPostCount()} 篇文章 →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== CTA ===== */}
      <ScrollReveal>
        <section className={styles.cta}>
          <h2 className={styles.ctaHeading}>
            我正在寻找 SEO / 内容运营相关的工作机会
          </h2>
          <p className={styles.ctaDesc}>
            如果你正在寻找一个懂内容、懂数据、有 SEO 实战经验的运营人，欢迎联系我
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/blog" className={styles.ctaButton}>
              阅读 SEO 实战笔记 →
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
