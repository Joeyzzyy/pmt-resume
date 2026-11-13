import type { Locale } from "@/components/layout/LanguageProvider";

type CopySegment = {
  text: string;
  emphasis?: boolean;
  href?: string;
};

type ToolCategory = {
  number: string;
  title: string;
  description: string;
  items: { name: string; description: string }[];
};

type WorksDoc = {
  title: string;
  desc: string;
  href?: string;
  icon?: string;
};

type WorksProduct = {
  name: string;
  desc: string;
  url: string;
  domain: string;
  image: string;
  tags: string[];
};

type HomeCopy = {
  name: string;
  avatarAlt: string;
  tagline: string;
  heroSub: string;
  experienceHeading: string;
  experienceSub: string;
  resumeCta: string;
  contactCta: string;
  aboutHeading: string;
  aboutParagraphs: CopySegment[][];
  capabilityTitle: string;
  capabilities: { from: string; to: string }[];
  worksHeading: string;
  worksSub: string;
  worksFeishuLabel: string;
  worksCasesLabel: string;
  worksBlogLabel: string;
  worksBlogDescription: string;
  worksWechatLabel: string;
  wechatAccount: { name: string; avatar: string };
  worksProductsLabel: string;
  worksPending: string;
  feishuDocs: WorksDoc[];
  caseDocs: WorksDoc[];
  wechatArticles: WorksProduct[];
  products: WorksProduct[];
  toolboxHeading: string;
  toolboxIntro: string;
  toolCategories: ToolCategory[];
  ctaHeading: string;
  ctaDescription: string;
  ctaLink: string;
};

const homeCopy: Record<Locale, HomeCopy> = {
  zh: {
    name: "庞梦桐",
    avatarAlt: "庞梦桐头像",
    tagline: "内容运营 · SEO 增长 · 数据驱动",
    heroSub: "从特斯拉新媒体运营到独立站 SEO 实践，用内容创造长期价值",
    experienceHeading: "四段经历，一条通往 SEO 的路",
    experienceSub: "从新媒体运营到独立站 SEO，每一步都算数。",
    resumeCta: "下载 PDF 简历",
    contactCta: "WeChat",
    aboutHeading: "从用户洞察到可验证的增长",
    aboutParagraphs: [
      [
        { text: "我在特斯拉做了近四年新媒体和用户洞察，监测 8+ 平台、跟进 2,000+ 用户反馈。过去研究" },
        { text: "「用户在说什么」", emphasis: true },
        { text: "，现在研究" },
        { text: "「用户在搜什么」", emphasis: true },
        { text: "——对我而言，转行 SEO 不是从零开始，而是把用户洞察迁移到搜索场景。" },
      ],
      [
        { text: "我的优势不只是找关键词，更能" },
        { text: "让方案落地", emphasis: true },
        { text: "。在特斯拉，我协调客服、产品、研发等 5+ 团队解决用户问题；现在，我把同样的协作能力用于推动内容、技术和产品优化。" },
      ],
      [
        { text: "在 " },
        { text: "maidinhk.com", href: "https://maidinhk.com" },
        { text: " 项目中，我从 0 搭建内容策略，在没有外链资源和付费推广的情况下，" },
        { text: "3 个月让核心关键词进入 Google 首页，页面收录率达 95%。", emphasis: true },
        { text: "我希望继续用内容、数据和执行力，为业务带来可验证的增长。" },
      ],
    ],
    capabilityTitle: "特斯拉经验 → SEO 核心能力",
    capabilities: [
      { from: "8+ 平台舆情 · 2,000+ 用户反馈", to: "搜索意图 · 关键词 · FAQ" },
      { from: "社媒内容运营与标题优化", to: "内容分发 · CTR 优化" },
      { from: "品牌舆情与全球化内容规范", to: "品牌搜索 · 内容质量" },
      { from: "跨 5+ 团队问题闭环", to: "技术 · 内容 · 产品落地" },
    ],
    worksHeading: "沉淀与作品",
    worksSub: "写过的文档与文章，做过的产品——研究与实战，皆可查证。",
    worksFeishuLabel: "自整理知识体系",
    worksCasesLabel: "竞品分析方案案例",
    worksBlogLabel: "SEO 实战笔记",
    worksBlogDescription: "记录独立站从 0 到 1 的完整实战：关键词调研、内容策略、技术 SEO 与数据复盘。",
    worksWechatLabel: "微信公众号",
    wechatAccount: { name: "出海狗歪肉", avatar: "/images/wechat-avatar.jpg" },
    worksProductsLabel: "Vibe Coding 自研成果",
    worksPending: "待补充",
    feishuDocs: [
      {
        title: "SEO系统知识手册",
        desc: "体系化的 SEO 方法论沉淀：关键词调研、内容策略、技术 SEO 与数据监控的完整闭环。",
        href: "https://my.feishu.cn/wiki/KiprwvrToiTPAYkYOhfcUycZnQf",
      },
      {
        title: "GEO系统知识手册",
        desc: "生成式引擎优化（GEO）方法论沉淀：AI 搜索时代的内容可见性策略。",
        href: "https://my.feishu.cn/wiki/O1pkw2K6BilfZGklsPxcGRzDnnf",
      },
      {
        title: "SEO竞品分析模板",
        desc: "拆解竞品的关键词布局与内容策略，寻找差异化突破机会。",
        href: "https://my.feishu.cn/wiki/KeQGw34eTiHPVrkKDKlc1IAfn7e",
      },
      {
        title: "Terminal 写代码 - GitHub 仓库对接 - Vercel 部署- DNS 验证域名",
        desc: "从零到上线的完整部署链路：Terminal 写代码、GitHub 仓库对接、Vercel 部署、DNS 域名验证。",
        href: "https://my.feishu.cn/wiki/NIOVwcamFiYXJ7kfmlAcF2Jrn4b",
      },
    ],
    caseDocs: [
      {
        title: "Atoms.dev 竞品分析",
        desc: "针对 Atoms.dev 的产品与市场竞争格局拆解。",
        href: "https://pcn90ikbvz2j.feishu.cn/wiki/RdqqwtrYZilRhNkx8Gkcaaymn0b",
      },
      {
        title: "Atoms.dev SEO 现状分析&执行方案",
        desc: "Atoms.dev 的 SEO 现状诊断与可落地的执行方案。",
        href: "https://pcn90ikbvz2j.feishu.cn/wiki/JMWQw8sHFigl6VkUGzocQvKVnJc",
      },
      {
        title: "MFW 入境游项目 SEO 增长策划书",
        desc: "入境游项目的 SEO 增长策划全案，在线演示版。",
        href: "https://mfw-seo.vercel.app/",
        icon: "/images/mfw-icon2.png",
      },
    ],
    wechatArticles: [
      {
        name: "全网最详细的 SEO & GEO 知识思维导图【可能是】",
        desc: "出海狗歪肉 · 微信公众号",
        url: "https://mp.weixin.qq.com/s/1deeCcNFGifrrVWDdV6H5Q",
        domain: "mp.weixin.qq.com",
        image: "/images/wechat-article-cover.jpg",
        tags: ["阅读 1267", "转发 156 次"],
      },
    ],
    products: [
      {
        name: "maidinhk 信息站",
        desc: "香港外佣垂直信息站。零外链、零付费推广，3 个月核心关键词冲上 Google 首页。",
        url: "https://maidinhk.com/blog",
        domain: "maidinhk.com/blog",
        image: "/images/products/maidinhk-blog.png",
        tags: ["独立站 SEO", "Topic Cluster", "Contentful"],
      },
      {
        name: "OnePlusEmployment 博客站",
        desc: "香港外佣资讯博客，围绕聘用流程、费用、法规与相处指南，为雇主提供实用内容。",
        url: "https://oneplusemployment.com/hub",
        domain: "oneplusemployment.com/hub",
        image: "/images/products/oneplusemployment-hub.png",
        tags: ["资讯博客", "内容策略", "SEO"],
      },
      {
        name: "SEO Health Checker",
        desc: "免费在线 SEO 深度检测工具，支持 Web 在线检测、Chrome 插件与 CLI 命令行三种形态。",
        url: "https://infinitegrowth.agency/seo-health-checker",
        domain: "infinitegrowth.agency",
        image: "/images/products/seo-health-checker.png",
        tags: ["SEO 工具", "Chrome 插件", "CLI"],
      },
    ],
    toolboxHeading: "我的 SEO 工具栈",
    toolboxIntro: "做 SEO 不缺工具，缺的是知道什么环节该用什么。以下是我在实践中筛选出的组合——每个工具解决一个明确的问题，没有冗余。",
    toolCategories: [
      {
        number: "01",
        title: "调研与分析",
        description: "选型逻辑：需要覆盖「发现机会 → 验证数据 → 持续监控」三个阶段，Semrush 与 Ahrefs 负责前期调研和竞品拆解，GSC 负责上线后的真实反馈。",
        items: [
          { name: "Semrush", description: "分析搜索量与关键词难度，研究竞品排名策略，筛选长尾词机会并构建关键词矩阵" },
          { name: "Ahrefs", description: "通过 Site Explorer 拆解竞品排名关键词、高流量页面与外链，用 Content Gap 挖掘本站缺失的内容机会" },
          { name: "Google Search Console", description: "监控页面索引状态，追踪关键词排名变化与点击率，用真实搜索数据驱动内容迭代" },
        ],
      },
      {
        number: "02",
        title: "AI 内容生产",
        description: "选型逻辑：一个人做内容站，产能是瓶颈。用 Gemini 做思维发散，Perplexity 做事实核查，YouMind 做视觉资产——三者互补，人工把控终稿质量。",
        items: [
          { name: "Gemini", description: "主题集群规划、文章大纲发散、搜索意图分析，大幅提升内容生产效率和覆盖广度" },
          { name: "Perplexity", description: "溯源权威数据和行业报告，为文章提供可信引用，增强内容的 EEAT 权威性" },
          { name: "YouMind", description: "为每篇文章创建原创配图和信息图，提升视觉吸引力和页面停留时间" },
        ],
      },
      {
        number: "03",
        title: "发布与质检",
        description: "选型逻辑：内容管理需要结构化，质量把控需要自动化。Contentful 管「存」和「发」，QuickCreator 管「查」和「审」。",
        items: [
          { name: "Contentful", description: "Headless CMS，通过结构化内容模型管理文章与分类，API 驱动前端渲染，支撑多语言分发" },
          { name: "QuickCreator Extension", description: "实时侦测页面关键词密度、审计 EEAT 信号、校验 TDK 标签，确保每篇内容发布前达标" },
          { name: "SEO Health Checker", description: "全站体检 + GSC 数据诊断，输出可执行的优化行动清单" },
        ],
      },
      {
        number: "04",
        title: "工程与开发",
        description: "选型逻辑：非工程背景，但技术 SEO 离不开代码，AI 时代更需要「会用工具的人」。我在学 SEO 的同时自学了 Claude Code，从零搭建了你正在浏览的这个网站。",
        items: [
          { name: "Claude Code", description: "AI 编程搭档。用它搭建本站（Next.js + Tailwind）、调试技术 SEO 问题。从 0 到 1 体现的是快速学习和跨领域整合能力" },
          { name: "Kimi", description: "与 Claude Code 类似的 AI 编程助手，用于代码生成、调试优化和网站功能迭代，提升开发效率" },
          { name: "GitHub", description: "代码与数据的存储中枢：仓库托管、版本管理，每次 push 自动触发 Vercel 部署" },
          { name: "Vercel", description: "部署托管平台：对接 GitHub 仓库，git push 后自动构建上线，自带全球 CDN 与 HTTPS" },
          { name: "Supabase", description: "结构化数据存储：存放 GSC 关键词与页面表现数据，支撑数据管理大师的实时监控与趋势分析" },
        ],
      },
    ],
    ctaHeading: "我正在寻找 SEO / 内容运营相关的工作机会",
    ctaDescription: "如果你正在寻找一个懂内容、懂数据、有 SEO 实战经验的运营人，欢迎联系我",
    ctaLink: "阅读 SEO 实战笔记 →",
  },
  en: {
    name: "Mengtong Pang",
    avatarAlt: "Portrait of Mengtong Pang",
    tagline: "Content Operations · SEO Growth · Data-Driven",
    heroSub: "From new media operations at Tesla to hands-on independent-site SEO, creating long-term value through content",
    experienceHeading: "Four chapters, one path into SEO",
    experienceSub: "From new media operations to independent-site SEO — every step counts.",
    resumeCta: "Download PDF Resume",
    contactCta: "WeChat",
    aboutHeading: "From User Insight to Measurable Growth",
    aboutParagraphs: [
      [
        { text: "I spent nearly four years at Tesla in new media and user insight, monitoring 8+ platforms and following up on 2,000+ user feedback items. I used to study " },
        { text: "what users say", emphasis: true },
        { text: "; now I study " },
        { text: "what they search for", emphasis: true },
        { text: ". Moving into SEO was not starting over—it was applying my user insight in a search context." },
      ],
      [
        { text: "My strength is not just finding keywords, but " },
        { text: "getting strategies implemented", emphasis: true },
        { text: ". At Tesla, I coordinated 5+ teams across customer service, product, and R&D to resolve user issues. Today, I use the same collaboration skills to drive content, technical, and product improvements." },
      ],
      [
        { text: "For " },
        { text: "maidinhk.com", href: "https://maidinhk.com" },
        { text: ", I built the content strategy from scratch. With no backlink resources or paid promotion, " },
        { text: "core keywords reached Google's first page within three months, and 95% of pages were indexed.", emphasis: true },
        { text: " I want to keep using content, data, and execution to deliver measurable business growth." },
      ],
    ],
    capabilityTitle: "Tesla Experience → Core SEO Strengths",
    capabilities: [
      { from: "8+ platforms · 2,000+ feedback items", to: "Search intent · Keywords · FAQs" },
      { from: "Social content & title optimization", to: "Content distribution · CTR" },
      { from: "Brand reputation & global content standards", to: "Branded search · Content quality" },
      { from: "Issue resolution across 5+ teams", to: "Technical · Content · Product execution" },
    ],
    worksHeading: "Research, Writing & Products",
    worksSub: "Documents, articles, and products—research and practice you can verify.",
    worksFeishuLabel: "Curated Knowledge Base",
    worksCasesLabel: "Competitive Analysis & Plans",
    worksBlogLabel: "SEO Field Notes",
    worksBlogDescription: "Hands-on notes from building an independent site from scratch: keyword research, content strategy, technical SEO, and data-driven reviews.",
    worksWechatLabel: "WeChat Official Account",
    wechatAccount: { name: "出海狗歪肉", avatar: "/images/wechat-avatar.jpg" },
    worksProductsLabel: "Vibe-Coded Products",
    worksPending: "Coming soon",
    feishuDocs: [
      {
        title: "SEO Knowledge Handbook",
        desc: "A systematic SEO methodology: keyword research, content strategy, technical SEO, and data monitoring in one closed loop.",
        href: "https://my.feishu.cn/wiki/KiprwvrToiTPAYkYOhfcUycZnQf",
      },
      {
        title: "GEO Knowledge Handbook",
        desc: "Generative Engine Optimization (GEO) methodology: content visibility strategies for the AI search era.",
        href: "https://my.feishu.cn/wiki/O1pkw2K6BilfZGklsPxcGRzDnnf",
      },
      {
        title: "SEO Competitive Analysis Template",
        desc: "Breaking down competitors' keyword layouts and content strategies to find differentiation opportunities.",
        href: "https://my.feishu.cn/wiki/KeQGw34eTiHPVrkKDKlc1IAfn7e",
      },
      {
        title: "Terminal to Production: GitHub, Vercel & DNS",
        desc: "The full path from writing code in the terminal to going live: GitHub integration, Vercel deployment, and DNS domain verification.",
        href: "https://my.feishu.cn/wiki/NIOVwcamFiYXJ7kfmlAcF2Jrn4b",
      },
    ],
    caseDocs: [
      {
        title: "Atoms.dev Competitive Analysis",
        desc: "A competitive teardown of Atoms.dev and its market landscape.",
        href: "https://pcn90ikbvz2j.feishu.cn/wiki/RdqqwtrYZilRhNkx8Gkcaaymn0b",
      },
      {
        title: "Atoms.dev SEO Audit & Execution Plan",
        desc: "An SEO audit of Atoms.dev with an actionable execution plan.",
        href: "https://pcn90ikbvz2j.feishu.cn/wiki/JMWQw8sHFigl6VkUGzocQvKVnJc",
      },
      {
        title: "MFW Inbound Tourism SEO Growth Plan",
        desc: "A full SEO growth proposal for an inbound tourism project (live deck).",
        href: "https://mfw-seo.vercel.app/",
        icon: "/images/mfw-icon2.png",
      },
    ],
    wechatArticles: [
      {
        name: "全网最详细的 SEO & GEO 知识思维导图【可能是】",
        desc: "出海狗歪肉 · WeChat Official Account",
        url: "https://mp.weixin.qq.com/s/1deeCcNFGifrrVWDdV6H5Q",
        domain: "mp.weixin.qq.com",
        image: "/images/wechat-article-cover.jpg",
        tags: ["1,267 reads", "156 shares"],
      },
    ],
    products: [
      {
        name: "maidinhk Info Hub",
        desc: "A vertical info site for Hong Kong domestic helpers. No backlinks or paid ads—core keywords reached Google's first page in 3 months.",
        url: "https://maidinhk.com/blog",
        domain: "maidinhk.com/blog",
        image: "/images/products/maidinhk-blog.png",
        tags: ["Indie SEO", "Topic Clusters", "Contentful"],
      },
      {
        name: "OnePlusEmployment Blog",
        desc: "A Hong Kong domestic helper blog with practical guidance on hiring, costs, regulations, and employer relationships.",
        url: "https://oneplusemployment.com/hub",
        domain: "oneplusemployment.com/hub",
        image: "/images/products/oneplusemployment-hub.png",
        tags: ["Blog", "Content Strategy", "SEO"],
      },
      {
        name: "SEO Health Checker",
        desc: "A free online SEO audit tool available as a web app, a Chrome extension, and a CLI.",
        url: "https://infinitegrowth.agency/seo-health-checker",
        domain: "infinitegrowth.agency",
        image: "/images/products/seo-health-checker.png",
        tags: ["SEO Tool", "Chrome Extension", "CLI"],
      },
    ],
    toolboxHeading: "My SEO Toolbox",
    toolboxIntro: "SEO is not about having more tools—it is about knowing which tool to use at each stage. This is the combination I have refined through hands-on work: every tool solves a specific problem, with no redundancy.",
    toolCategories: [
      {
        number: "01",
        title: "Research & Analysis",
        description: "Selection rationale: cover the full journey from discovering opportunities to validating data and ongoing monitoring. Semrush and Ahrefs power early research and competitor analysis, while GSC provides real-world feedback after launch.",
        items: [
          { name: "Semrush", description: "Analyze search volume and keyword difficulty, study competitor ranking strategies, identify long-tail opportunities, and build a keyword matrix" },
          { name: "Ahrefs", description: "Analyze competitors’ ranking keywords, top-traffic pages, and backlink profiles with Site Explorer, and use Content Gap to uncover missing content opportunities" },
          { name: "Google Search Console", description: "Monitor indexation, track keyword rankings and click-through rates, and use real search data to drive content iteration" },
        ],
      },
      {
        number: "02",
        title: "AI Content Production",
        description: "Selection rationale: production capacity is the bottleneck for a one-person content site. Gemini expands ideas, Perplexity verifies facts, and YouMind creates visual assets—three complementary tools with human oversight of final quality.",
        items: [
          { name: "Gemini", description: "Plan topic clusters, expand article outlines, and analyze search intent to improve content production efficiency and coverage" },
          { name: "Perplexity", description: "Trace authoritative data and industry reports to provide credible citations and strengthen E-E-A-T signals" },
          { name: "YouMind", description: "Create original images and infographics for articles to improve visual appeal and engagement" },
        ],
      },
      {
        number: "03",
        title: "Publishing & Quality Assurance",
        description: "Selection rationale: content management needs structure, and quality control needs automation. Contentful handles storage and publishing, while QuickCreator handles checks and audits.",
        items: [
          { name: "Contentful", description: "A headless CMS that manages articles and categories through structured content models, with API-driven rendering and multilingual distribution" },
          { name: "QuickCreator Extension", description: "Check keyword density, audit E-E-A-T signals, and validate TDK tags in real time before every article goes live" },
          { name: "SEO Health Checker", description: "Site-wide health audits + GSC data diagnosis, outputting an actionable optimization checklist" },
        ],
      },
      {
        number: "04",
        title: "Engineering & Development",
        description: "Selection rationale: I do not come from an engineering background, but technical SEO requires code, and the AI era rewards people who know how to use tools. While learning SEO, I taught myself Claude Code and built this website from scratch.",
        items: [
          { name: "Claude Code", description: "My AI programming partner for building this site with Next.js and Tailwind and debugging technical SEO issues—proof of my ability to learn quickly and integrate skills across disciplines" },
          { name: "Kimi", description: "An AI coding assistant similar to Claude Code, used for code generation, debugging, and website feature iteration to improve development efficiency" },
          { name: "GitHub", description: "The central hub for code and data: repository hosting, version control, and every push triggers automatic Vercel deployment" },
          { name: "Vercel", description: "Deployment platform connected to the GitHub repo—every git push auto-builds and ships, with global CDN and HTTPS out of the box" },
          { name: "Supabase", description: "Structured data storage for GSC keyword and page performance metrics, powering the Data Master dashboard's real-time monitoring and trend analysis" },
        ],
      },
    ],
    ctaHeading: "I'm looking for opportunities in SEO / Content Operations",
    ctaDescription: "If you need someone who understands content and data and has hands-on SEO experience, I'd love to hear from you",
    ctaLink: "Read My SEO Field Notes →",
  },
};

export default homeCopy;
