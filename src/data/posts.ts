export interface StaticPost {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  category: string;
  tags: string[];
  tools: string[];
  content: string;
  phase: 1 | 2 | 3;
}

export interface Phase {
  id: 1 | 2 | 3;
  label: string;
  title: string;
  subtitle: string;
}

export const phases: Phase[] = [
  {
    id: 1,
    label: "第一个月",
    title: "从 0 到 1：打地基",
    subtitle: "搭建监控体系、学会用数据选词、建立内容规范与信任基线",
  },
  {
    id: 2,
    label: "第二个月",
    title: "从摸索到熟悉：精炼方法论",
    subtitle: "深挖用户意图、构建审计与发布 SOP、用数据驱动内容迭代",
  },
  {
    id: 3,
    label: "第三个月",
    title: "细节致胜：思维进化",
    subtitle: "从零散选词到系统化规划，用 Topic Cluster 封锁流量入口",
  },
];

export const categories = [
  "SEO 实战笔记",
  "工具与方法论",
  "复盘与思考",
] as const;

export function getAllPosts(): StaticPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function getPostBySlug(slug: string): StaticPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getLatestPosts(count: number): StaticPost[] {
  return getAllPosts().slice(0, count);
}

export function getTotalPostCount(): number {
  return posts.length;
}

export function getPostsByPhase(phase: number): StaticPost[] {
  return posts
    .filter((p) => p.phase === phase)
    .sort(
      (a, b) =>
        new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
    );
}

/* ================================================================
   SEO 实战 90 天全纪录：从小白到思维进化的成长白皮书
   ================================================================ */

const posts: StaticPost[] = [
  /* ================================================================
     第一个月：「从 0 到 1」打地基
     ================================================================ */

  /* ── 1-1 心态与工具 ── */
  {
    slug: "seo-beginner-first-week-gsc-setup",
    title: "告别盲目！SEO 小白入门的第一周：搭建我的监控塔",
    excerpt:
      "刚开始做 SEO 毫无头绪？分享我第一周搭建 GSC (Google Search Console) 与 GA4 的实战经历。带你避开「盲目发词」的坑，建立数据驱动的 Seed Keywords 意识。",
    publishDate: "2026-03-17",
    category: "SEO 实战笔记",
    tags: ["SEO入门", "Google Search Console", "GSC设置", "种子词研究"],
    tools: ["Google Search Console"],
    phase: 1,
    content: `## 从新媒体思维到 SEO 思维的切换

在特斯拉做新媒体的时候，我每天盯微博后台看的是「阅读量」和「转发数」。这些指标来得快、反馈即时——发一条微博，2 小时就知道它的命运了。

但 SEO 完全不同。**你写的内容，可能发布后两周都看不到任何反馈**。这种延迟让我第一周非常焦虑。

直到我搭好了 [Google Search Console](https://search.google.com/search-console/about)（GSC），我才找到了"安全感"——至少我知道 Google 有没有来看我。

## 第一步：注册 GSC 并验证所有权

这一步看起来简单，但我踩了一个坑：**域名验证方式**的选择。

GSC 提供了几种验证方式：HTML 文件上传、DNS 记录、Meta 标签等。我最终用的是 DNS 验证，因为 maidinhk.com 用的是 Cloudflare 管理 DNS，添加 TXT 记录几分钟就生效了。

验证完成后，我做的第一件事不是看数据（因为此时还没有数据），而是提交 Sitemap。

## 第二步：理解 Sitemap 的意义

Sitemap（站点地图）这个概念，在入门之前我完全没听说过。简单理解就是：**一份清单，告诉 Google 你网站有哪些页面**。

我用 Next.js 自动生成了 \`sitemap.xml\`，然后在 GSC 的「站点地图」功能中提交。提交后的状态显示「已读取」，但「发现的 URL 数量」是 0——别慌，这很正常，Google 需要时间处理。

## 第三步：建立「种子词」清单

在还没有学会用 Semrush 之前，我用了一个最笨但最有效的方法：**在 Google 搜索框里打字，看自动补全建议**。

比如我输入 "domestic helper hong kong"，Google 自动补全会给出：
- domestic helper hong kong salary
- domestic helper hong kong agency
- domestic helper hong kong visa

这些就是用户真实的搜索行为。我把它们全部记录下来，形成了第一份「种子词清单」——大约 20 个词。后来我学会了用 Semrush 做更系统的关键词调研，详见 [手把手教你用 Semrush 挖掘长尾关键词](/blog/semrush-beginner-long-tail-keywords)。

## 第四步：学会看 GSC 的「抓取」报告

大约在注册 GSC 3 天后，我第一次看到了「覆盖范围」报告中出现了数据。几个页面显示为「已发现 - 尚未编入索引」。

这个状态意味着：Google 知道这些页面存在了，但还没有正式收录。就像你投了简历，HR 收到了但还没看。

**关键收获**：在 SEO 中，"被发现"和"被收录"是两个完全不同的阶段。很多新手以为页面上线就等于被收录，其实中间隔着 Google 的审核流程。

## 第一周的心态调整

| 新媒体思维 | SEO 思维 |
|-----------|---------|
| 发布即反馈 | 发布后等待 7-14 天 |
| 靠直觉判断内容好坏 | 靠数据验证假设 |
| 追热点、追速度 | 追长尾、追复利 |
| 平台给流量 | 自己从搜索中赚流量 |

这个思维切换是痛苦的，但也是必要的。一旦接受了 SEO 的节奏，后面的焦虑就会少很多。

## 给同行的建议

如果你也是 SEO 新手，我的建议是：

1. **Day 1 就注册 GSC**：不要等内容做好了再注册，越早开始积累数据越好
2. **不要急着写内容**：先花一周理解 Google 的工作方式
3. **建立自己的种子词清单**：哪怕只用 Google 自动补全，也比拍脑袋想强一百倍
4. **接受"没有即时反馈"的现实**：SEO 是一场马拉松，不是百米冲刺

> **延伸阅读**：搭好 GSC 之后，下一步就是[主动提交 Sitemap 让 Google 收录你的页面](/blog/sitemap-gsc-indexing-proactive-submission)。当你开始看到数据后，可以参考[如何通过 GSC 数据做意图纠偏](/blog/gsc-data-review-intent-correction)。`,
  },

  /* ── 1-2 工具扫盲 ── */
  {
    slug: "semrush-beginner-long-tail-keywords",
    title: "从零开始查词：手把手教你用 Semrush 挖掘第一批长尾关键词",
    excerpt:
      "告别拍脑袋想标题！分享我作为 SEO 小白，第一次使用 Semrush 挖掘 Long-tail Keywords 的经历。带你读懂 KD 与 Volume，锁定第一批好排名的潜力词。",
    publishDate: "2026-03-17",
    category: "工具与方法论",
    tags: ["Semrush入门", "关键词查询", "长尾关键词", "KD值", "SEO工具"],
    tools: ["Semrush"],
    phase: 1,
    content: `## 为什么拍脑袋选词是新手最大的坑

在开始用 Semrush 之前，我选关键词的方式很「新媒体」——**凭感觉**。

我觉得 "hong kong maid" 一定是个好词，因为简短、直接。但当我真正在 Semrush 里查这个词的时候，数据告诉我一个完全不同的故事：

| 关键词 | 月搜索量 | KD（难度） |
|--------|---------|-----------|
| hong kong maid | 320 | 58 |
| domestic helper hong kong salary | 210 | 22 |
| how to hire a maid in hong kong | 170 | 18 |

KD 58 意味着什么？对于一个没有任何域名权重的新站来说，**几乎不可能在短期内排上去**。而 KD 18 的词，反而有机会在 1-2 个月内获得首页排名。

这就是数据和直觉的差距。

## 认识 Semrush 的关键指标

### Volume（搜索量）
每月有多少人搜这个词。一般来说，我会把 **月搜索量 > 100** 作为筛选门槛。太低的词，即使排上首页也没什么流量。

### KD（Keyword Difficulty，关键词难度）
Semrush 给出的 0-100 评分，代表这个词的竞争程度。作为新站，我的目标是 **KD < 30**。

### Search Intent（搜索意图）
这是我觉得最被低估的指标。Semrush 会把每个关键词标注为四种意图之一：

- **Informational**：用户想获取信息（如 "what is a domestic helper"）
- **Commercial**：用户在比较和评估（如 "best maid agency hong kong"）
- **Transactional**：用户准备行动（如 "hire maid hong kong"）
- **Navigational**：用户找特定品牌（如 "helper choice website"）

对于信息站来说，**Informational 和 Commercial 意图的词是最有价值的**——用户在找答案，我们的内容就是答案。

## 我的第一次 Keyword Magic Tool 实操

打开 [Semrush 的 Keyword Magic Tool](https://www.semrush.com/analytics/keywordmagic/start)，输入种子词 "domestic helper hong kong"，系统瞬间生成了 800+ 相关词。

面对这么多词，我的筛选 SOP 是：

1. **按 KD 升序排列**：先看最容易做的词
2. **过滤 Volume > 100**：确保有流量潜力
3. **只看 Informational / Commercial 意图**：匹配信息站定位
4. **手动排除品牌词和不相关词**

经过这轮筛选，我从 800 个词里挑出了 **25 个核心目标词**。

## 长尾词才是新站的救命稻草

一个关键认知转变：**不要追大词，要追长尾词**。

举个例子：
- "maid"：月搜索量 10,000+，KD 72 → 没戏
- "how much does a maid cost in hong kong per month"：月搜索量 90，KD 12 → 完全可以做

长尾词的优势：
1. 竞争低，新站有机会
2. 搜索意图更明确，转化率更高
3. 容易快速获得排名，给全站积累信任度

## 关键词矩阵的建立

我把筛选出的 25 个词按主题分组，形成了关键词矩阵：

- **雇佣流程类**：how to hire, requirements, process, steps
- **费用类**：cost, salary, agency fee, minimum wage
- **签证与法律类**：visa, contract, labor law, termination
- **生活类**：day off, accommodation, duties, food allowance

每个分组对应一个内容方向，后面的文章规划全部基于这张矩阵。到了第三个月，我把这套方法升级为更系统的[「母词拆解法」](/blog/semrush-mother-keyword-topic-cluster-planning)，一次性规划出半年的内容大纲。

## 总结

Semrush 给我的最大启示不是某个具体的词有多好，而是一个方法论：**让数据来告诉你该写什么，而不是自己猜**。这个思维方式的转变，是我第一个月最大的收获。

> **延伸阅读**：有了关键词之后，下一步是[在 Contentful 中把 SEO 细节做到位](/blog/contentful-alt-text-on-page-seo-details)。如果你想进一步了解搜索意图分析，请看[如何利用 Semrush 与 Gemini 锁定用户意图](/blog/search-intent-semrush-gemini-conversion)。`,
  },

  /* ── 1-3 内容规范 ── */
  {
    slug: "contentful-alt-text-on-page-seo-details",
    title: "别浪费图片的流量！Contentful 编辑中那些被忽视的 SEO 细节",
    excerpt:
      "你知道 Contentful 的图片 Title 会直接影响 Ranking 吗？分享我在内容编辑中的 On-Page SEO 细节：从文件名命名到 Alt Text 填充，及如何通过 H1-H6 建立严谨的逻辑树。",
    publishDate: "2026-03-17",
    category: "SEO 实战笔记",
    tags: ["Alt Text", "Contentful SEO", "图片SEO优化", "H标签规范", "内容优化"],
    tools: ["Contentful"],
    phase: 1,
    content: `## 一个让我损失了两周流量的细节

在用 [Contentful](https://www.contentful.com/) 发布了前三篇文章后，我通过 QuickCreator Extension 做了一次页面审计（关于审计工具的详细用法，可以看我后来写的[QuickCreator 审计实战](/blog/perplexity-quickcreator-eeat-audit)）。结果发现一个让我惊出冷汗的问题：**所有图片的 Alt Text 都是空的**。

在 Contentful 中，如果你在上传图片时没有填写 Title 字段，前端渲染出来的 \`<img>\` 标签的 \`alt\` 属性就是空的。这意味着 Google 的爬虫看到这些图片时，完全不知道它们是什么内容。

这不只是一个技术细节，而是直接影响排名的 On-Page SEO 要素。

## Alt Text 到底有多重要

很多人以为 Alt Text 只是给视障用户读屏幕用的。确实，这是它最初的目的，但在 SEO 语境下，Alt Text 的作用远不止于此：

1. **帮助 Google 理解图片内容**：搜索引擎不能"看"图片，它只能读 Alt Text
2. **增加关键词出现频率**：在 Alt Text 中自然地包含关键词，能强化页面主题信号
3. **图片搜索流量**：Google Images 的流量不可忽视，好的 Alt Text 能让你的图片出现在图片搜索结果中
4. **可访问性合规**：很多国家和地区对网页可访问性有法律要求

## 我的 Alt Text 写作规范

经过研究和实践，我总结了一套写法：

**好的 Alt Text：**
- "2024年香港外佣最低工资标准对比表" → 描述准确，包含关键词
- "香港雇主面试外佣时的注意事项清单" → 描述具体，有搜索价值

**差的 Alt Text：**
- "图片1" → 毫无信息量
- "domestic helper salary cost money wages hong kong best cheap" → 关键词堆砌，可能被惩罚
- "" （空白）→ 等于告诉 Google 这张图不重要

原则是：**用一句话自然地描述图片内容，同时包含 1-2 个核心关键词**。

## Contentful 的图片管理流程

在 Contentful 中，我建立了一套标准化的图片上传流程：

### 文件名规范
上传前先把文件名改成语义化的格式：
- \`hong-kong-maid-salary-comparison-2024.png\` （好）
- \`IMG_20240915.png\` （差）
- \`screenshot-1.jpg\` （差）

文件名虽然对 SEO 的影响不大，但它是一个好习惯——万一某天成为排名因素呢？

### Title 字段（即 Alt Text）
在 Contentful 的 Asset 编辑界面，\`Title\` 字段填写的内容会被用作前端的 \`alt\` 属性。每次上传图片，我都会强制自己填写这个字段。

### Description 字段
这个字段可以填写更详细的说明，通常作为图片的 \`<figcaption>\` 使用。不是必填，但对用户体验有帮助。

## H1-H6 标题标签的逻辑树

除了图片 SEO，另一个被低估的细节是**标题标签的层级结构**。

很多人写文章时，H2、H3 的使用很随意——哪里想分段就加一个。但 Google 会读取标题标签的层级关系来理解你的内容结构。

我的标题层级规范：

- **H1**：只用一次，就是文章标题。在 Contentful 中，H1 通常由模板自动生成
- **H2**：文章的主要章节。一般 4-6 个
- **H3**：H2 下的子章节。每个 H2 下面 2-3 个
- **H4 及以下**：很少使用。如果需要 H4，通常意味着文章结构太深，需要拆分

**关键规则：不能跳级。** 不能从 H2 直接跳到 H4，这会让搜索引擎困惑。

## Slug（URL 别名）的设计

在 Contentful 中，每篇文章都有一个 \`slug\` 字段，直接决定了 URL 的样子。

我的 slug 设计原则：
- **包含核心关键词**：\`/blog/domestic-helper-salary-hong-kong\`
- **简洁**：控制在 4-6 个单词
- **全小写**：用连字符分隔
- **不用日期**：避免内容看起来"过时"

## 修复后的效果

把所有图片的 Alt Text 补上后，大约一周内，我在 GSC 中开始看到来自 Google Images 的展示数据——虽然点击还很少，但这意味着 Google 已经开始理解我的图片内容了。

这次经历让我深刻理解了一句话：**SEO 的魔鬼在细节里**。关于 Google 图片 SEO 的最佳实践，可以参考 [Google 搜索中心的官方指南](https://developers.google.com/search/docs/appearance/google-images)。

> **延伸阅读**：图片 SEO 只是 On-Page 优化的一部分。要确保整篇内容符合 Google 的质量标准，还需要关注 [EEAT 与 YMYL 合规](/blog/ymyl-eeat-disclaimer-seo-trust)。发布环节的完整 SOP 见[Contentful 结构化发布与审计流程](/blog/contentful-quickcreator-agile-publishing-sop)。`,
  },

  /* ── 1-4 合规与安全 ── */
  {
    slug: "ymyl-eeat-disclaimer-seo-trust",
    title: "SEO 不止是排名：母婴类网站如何建立 Google 信任的 E-E-A-T",
    excerpt:
      "做母婴内容最怕被 Google 判定为不可靠。结合我的法律背景，聊聊如何通过 Disclaimer (免责声明) 提升网站的 E-E-A-T 权重，以及为什么这是小白第一个月最该补的一课。",
    publishDate: "2026-03-17",
    category: "复盘与思考",
    tags: ["EEAT准则", "YMYL网站优化", "SEO免责声明", "网站可靠性", "母婴SEO"],
    tools: [],
    phase: 1,
    content: `## 为什么你的网站没流量？可能不是内容不好

在做 maidinhk.com 的第一个月，我的核心精力都放在关键词和内容上。但当我读到 Google 的[《搜索质量评估指南》](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf)（Search Quality Evaluator Guidelines）时，一个概念让我瞬间紧张起来——**YMYL**。

YMYL 是 "Your Money or Your Life" 的缩写。Google 认为，任何涉及用户金钱、健康、安全、法律权益的内容，都属于 YMYL 范畴。对于这类内容，Google 的审核标准极其严苛。

maidinhk.com 涉及的内容——外佣合同、工资标准、签证流程、劳工法——全部落在 YMYL 范畴内。如果网站缺乏可信度信号，Google 可能永远不会给你好的排名。

## E-E-A-T 是什么

E-E-A-T 是 Google 评价网站质量的最高准则：

| 维度 | 含义 | 在 maidinhk.com 的体现 |
|------|------|---------------------|
| **Experience（经验）** | 内容创作者是否有亲身经历 | 我实际参与了香港外佣市场的调研 |
| **Expertise（专业性）** | 是否具备专业知识 | 引用劳工处官方数据和法规 |
| **Authoritativeness（权威性）** | 是否被行业认可 | 链接到 .gov.hk 等权威网站 |
| **Trustworthiness（可靠性）** | 网站是否值得信赖 | 有免责声明、隐私政策、作者信息 |

## 我做了哪些来提升 E-E-A-T

### 1. 添加免责声明（Disclaimer）

这是我利用法律背景做的第一件事。maidinhk.com 的每篇涉及法规的文章底部，我都添加了免责声明：

- 内容仅供参考，不构成法律建议
- 数据来源标注（如"根据香港劳工处 2024 年公告"）
- 建议读者咨询持牌律师或专业顾问

这些声明不仅是对用户负责，更是告诉 Google：**这个网站知道自己在做什么，而且很透明**。

### 2. 建立作者页面

Google 的质量评估师会查看内容的作者是谁。所以我在网站上创建了一个作者介绍页面，说明自己的背景和经历。这是一个简单但有效的信任信号。

### 3. 引用权威来源

每篇涉及法规或数据的文章，我都会链接到原始出处：
- [香港劳工处官网](https://www.labour.gov.hk/)（\`.gov.hk\`）
- [入境事务处](https://www.immd.gov.hk/)公告
- 行业协会报告

这些外链（outbound links）虽然把用户引向了其他网站，但它们告诉 Google：**我的信息是有根据的**。

### 4. 添加隐私政策和条款

很多人觉得这些是"走形式"，但对于 YMYL 网站来说，缺少隐私政策和使用条款会严重降低 Google 的信任评分。

## 备战司考的意外收获

之前备战司法考试的经历，在这个环节发挥了意想不到的作用。法律训练让我习惯了：

- **严谨表述**：不用"绝对"、"一定"这样的词，而是用"通常"、"根据现行法规"
- **信息溯源**：每一条数据都要有出处
- **风险提示**：在可能产生误解的地方主动提示

这些习惯，恰好是 Google EEAT 评估中最看重的品质。

## 一个反面案例

在调研竞品时，我发现某个做类似主题的网站，内容写得很详细，但：
- 没有作者信息
- 没有免责声明
- 引用的法规没有标注出处
- 没有隐私政策

这个网站的排名一直在第 3-4 页徘徊。而一些内容质量一般但信任信号齐全的网站，反而排在更前面。这让我确信：**对于 YMYL 主题，可靠性比内容深度更重要**。

## 给同类网站的建议

如果你也在做涉及用户权益的内容网站：

1. **Day 1 就加免责声明**，不要等流量来了才补
2. **每篇文章的数据都要标注来源**
3. **建立清晰的作者身份**，让读者和 Google 都知道"谁在写"
4. **定期更新法规信息**，过时的法律内容会严重损害可靠性
5. **不要害怕链接到权威外站**，这是提权而不是"送流量"

> **延伸阅读**：建立信任只是第一步，后面还需要用工具持续审计。我在第二个月引入了 [Perplexity 溯源 + QuickCreator 审计](/blog/perplexity-quickcreator-eeat-audit) 的组合拳来确保 YMYL 内容的合规性。关于如何系统化搭建 GSC 监控，可以回看[第一周搭建监控塔](/blog/seo-beginner-first-week-gsc-setup)。`,
  },

  /* ── 1-5 收录实战 ── */
  {
    slug: "sitemap-gsc-indexing-proactive-submission",
    title: "别等 Google 来找你！利用 Sitemap 和 GSC 让网站秒被收录",
    excerpt:
      "刚建好的网站搜不到？分享我第一次提交 Sitemap 的过程，并利用 GSC 检查网页是否被正常抓取。掌握最底层的收录规则，让 Google 快速看懂你的站。",
    publishDate: "2026-03-17",
    category: "SEO 实战笔记",
    tags: ["Sitemap提交", "网站收录", "GSC教程", "Google抓取", "SEO底层规则"],
    tools: ["Google Search Console"],
    phase: 1,
    content: `## 发布了内容，Google 却不来

maidinhk.com 上线第一周，我满怀期待地在 Google 搜索了自己的文章标题。

结果——什么都搜不到。

在新媒体世界，你发一条微博，几秒钟之内就能被搜索到。但在 SEO 的世界，**一个全新的网站可能需要几周时间才会被 Google 的爬虫发现**。

这个现实让我意识到：好内容是必要条件，但不是充分条件。你还得主动告诉 Google "我在这里"。

## Sitemap 是什么

Sitemap（站点地图）本质上就是一个 XML 文件，列出了你网站上所有想被 Google 收录的 URL。

我用 Next.js 构建网站，所以 sitemap.xml 是在构建时自动生成的。一个典型的 sitemap 条目长这样：

\`\`\`
<url>
  <loc>https://maidinhk.com/blog/domestic-helper-salary</loc>
  <lastmod>2024-09-15</lastmod>
  <priority>0.8</priority>
</url>
\`\`\`

关键字段解释：
- \`<loc>\`：页面的完整 URL
- \`<lastmod>\`：最后更新时间。Google 会参考这个决定是否重新抓取
- \`<priority>\`：页面优先级（0.0-1.0）。但说实话，Google 对这个字段的参考程度存疑

## 在 GSC 中提交 Sitemap

在 Google Search Console 的「站点地图」功能中，输入 \`sitemap.xml\` 的 URL 然后点击「提交」。

提交后会看到以下状态：
- **正在处理**：Google 还在读取
- **成功**：Google 已读取并发现了 URL
- **有错误**：格式有问题或部分 URL 不可访问

**我的经验：第一次提交后大约 24 小时，状态才变为「成功」**。不要反复提交，耐心等待。

## 网址检查工具：最强的单页推送

除了提交 Sitemap，GSC 还有一个「网址检查」工具。输入任何一个 URL，可以看到：

1. **该页面是否已被 Google 收录**
2. **如果没有收录，原因是什么**
3. **可以点击「请求编入索引」来主动推送**

我的使用策略：
- 每发布一篇新文章，就用这个工具主动推送
- **每天最多推送 2-3 个 URL**，不要贪多——过度提交会被限流
- 推送后不要反复查，Google 说了"同一个 URL 只需要提交一次"

## 从"被发现"到"被收录"的过程

通过观察 GSC 数据，我总结出了 Google 收录页面的典型流程：

1. **已发现 - 尚未编入索引**：Google 知道这个 URL 存在，但还没派爬虫来抓取
2. **已抓取 - 尚未编入索引**：Google 爬虫来过了，读取了内容，但还没决定是否收录
3. **已编入索引**：Google 认为这个页面有价值，正式纳入搜索数据库

第 2 步到第 3 步之间，Google 会评估内容质量。**如果你的内容是低质量、重复或不符合 [EEAT 标准](/blog/ymyl-eeat-disclaimer-seo-trust) 的，可能永远停留在第 2 步**。

## 我踩过的三个坑

### 坑一：robots.txt 配置错误
一开始我不知道 Next.js 默认会在开发环境生成 \`<meta name="robots" content="noindex">\` 标签。这导致我的几个页面上线后一直无法被收录。**上线前一定要检查生产环境的 meta robots 标签**。

### 坑二：一天提交太多页面
早期我一口气提交了 15 个 URL，结果 GSC 开始拒绝请求，显示"已提交太多请求"。后来改为每天 2-3 个，反而更顺畅。

### 坑三：忽视了 canonical 标签
有两个页面的内容相似度较高，我没有设置 canonical 标签，导致 Google 不确定哪个是"正版"，两个页面的收录都很慢。设置 canonical 后，主页面很快就被收录了。

## 收录效果时间线

| 时间 | 状态 | 收录数 |
|------|------|--------|
| 第 1 天 | 提交 Sitemap，推送首批 URL | 0 |
| 第 4 天 | 首批页面状态变为「已发现」 | 0 |
| 第 10 天 | 第一个页面正式被收录 | 1 |
| 第 14 天 | 累计收录 3 个页面 | 3 |
| 第 21 天 | 收录速度加快 | 5 |

**最大的感悟：Google 会随着对你网站信任度的提升而加快收录速度。** 前面的等待是在"交信任保证金"，一旦建立了信任，后面的文章收录会越来越快。关于 Google 官方对 Sitemap 的技术要求，可以参考 [Google 搜索中心 Sitemap 指南](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)。

> **延伸阅读**：页面收录后，真正的优化才开始。通过 [GSC 数据复盘做意图纠偏](/blog/gsc-data-review-intent-correction) 能发现内容与用户真实需求之间的偏差。同时，别忘了通过[内链策略](/blog/internal-link-strategy-content-island-detection)帮助新页面更快被爬虫发现。`,
  },

  /* ================================================================
     第二个月：从摸索到熟悉，精炼出适合自己的方法论
     ================================================================ */

  /* ── 2-1 意图洞察 ── */
  {
    slug: "search-intent-semrush-gemini-conversion",
    title: "拒绝盲目写文！如何利用 Semrush 与 Gemini 锁定高转化「用户意图」",
    excerpt:
      "流量不等于转化。分享我结合 Semrush 数据与 Gemini 意图分析的实战心得：如何针对香港外佣市场痛点，通过分析商业意图决定内容布局，让流量变现。",
    publishDate: "2026-03-17",
    category: "工具与方法论",
    tags: ["搜索意图分析", "Search Intent", "Semrush教程", "Gemini SEO", "转化率优化"],
    tools: ["Gemini", "Semrush"],
    phase: 2,
    content: `## 从"有流量"到"有用的流量"

第一个月结束时，maidinhk.com 已经开始有一些零星的展示和点击了。但我发现一个尴尬的现象：**有些文章展示数很高，但点击进来的用户，停留时间极短**。

这让我开始思考一个更深层的问题：我写的内容真的是用户想要的吗？

答案是：不一定。因为我之前选词的时候，只看了搜索量和难度，**忽略了最重要的维度——搜索意图**。

## 什么是搜索意图

用户搜 "domestic helper hong kong" 时，他/她到底想知道什么？

可能是：
- 想了解什么是 domestic helper（信息型）
- 想找一家中介（商业型）
- 想直接雇一个（交易型）
- 想找某个特定品牌的网站（导航型）

**同一个关键词，背后的意图可能完全不同**。如果你的内容和用户意图不匹配，即使排上了首页，用户也会秒退。

## Semrush + Gemini 联动分析法

我开发了一套两步走的意图分析方法：

### 第一步：Semrush 定量分析

在 Semrush 中，每个关键词都标注了意图类型。但更有价值的是看 SERP Analysis（搜索结果分析）——Google 对这个词排名前 10 的结果是什么类型的页面？

如果前 10 全是教程和指南型内容，说明 Google 认为这个词的意图是 Informational。如果前 10 全是产品页或服务页，说明意图是 Transactional。

**你的内容类型必须匹配 Google 已经"认定"的意图类型**，否则几乎不可能获得好的排名。

### 第二步：Gemini 定性发散

确定了意图类型后，我用 Gemini 来深挖用户的具体痛点。

我的提示词模板：
"一个在香港准备雇佣外佣的雇主，搜索了 [关键词]。请分析这个用户此刻最可能面临的问题、担忧和决策障碍。"

Gemini 通常会给出 5-8 个具体的痛点，比如：
- 担心中介费用不透明
- 不确定合同条款是否合理
- 害怕语言沟通障碍
- 纠结选菲佣还是印佣

这些痛点直接变成了我文章的子标题和段落主题。

## 内容布局从"罗列信息"到"解决问题"

意图分析的最大价值在于：**它改变了我写文章的思路**。

之前我写文章的逻辑是：这个主题有哪些知识点？→ 把它们全列出来。

现在变成了：用户搜这个词时，心里在想什么？→ 先解决最迫切的问题 → 再展开相关知识。

举一个具体例子。对于 "domestic helper agency fee hong kong" 这个词：

**旧写法（信息罗列型）：**
- 什么是中介费
- 中介费包含哪些项目
- 各家中介的费用

**新写法（意图驱动型）：**
- 雇一个外佣到底要花多少钱？（直接回答最迫切的问题）
- 中介费里哪些是必须的，哪些是"隐藏收费"？（解决信任焦虑）
- 如何判断一家中介是否合规？（提供决策工具）

## 效果验证

用意图驱动的写法重写了三篇文章后，数据变化明显：

| 指标 | 重写前 | 重写后（2周） |
|------|--------|-------------|
| 平均停留时间 | 45 秒 | 2 分 15 秒 |
| 跳出率 | 78% | 52% |
| CTR | 1.8% | 3.2% |

用户停留时间翻了 3 倍——说明内容终于在回答他们真正想问的问题了。

## 核心认知

做 SEO 内容不是在写百科全书，而是在做"精准问答"。**每一篇文章都应该解决一个具体场景下的具体问题**，这才是搜索引擎和用户都喜欢的内容。关于 Google 如何理解搜索意图，可以参考 [Google 搜索中心关于搜索工作原理的说明](https://www.google.com/search/howsearchworks/)。

> **延伸阅读**：意图分析做完后，还需要 [Perplexity 溯源来确保内容的事实准确性](/blog/perplexity-quickcreator-eeat-audit)。如果你发现已发布的文章意图不匹配，可以通过 [GSC 数据复盘来纠偏](/blog/gsc-data-review-intent-correction)。关于关键词调研的基础方法论，回顾[我的 Semrush 入门实战](/blog/semrush-beginner-long-tail-keywords)。`,
  },

  /* ── 2-2 权威背书 ── */
  {
    slug: "perplexity-quickcreator-eeat-audit",
    title: "拒绝 AI 幻觉：利用 Perplexity 溯源与 QuickCreator 审计构建 YMYL 防线",
    excerpt:
      "记录利用 Perplexity 垂直检索香港劳工处等官方源，并配合 QuickCreator 进行 EEAT 审计的实战。通过权威文献溯源与实时评分，确保母婴/家政内容专业合规。",
    publishDate: "2026-03-17",
    category: "工具与方法论",
    tags: ["EEAT审计", "Perplexity溯源", "YMYL优化", "官方外链", "内容权威性"],
    tools: ["Perplexity", "QuickCreator Extension"],
    phase: 2,
    content: `## AI 给了我一个错误的工资标准

这是一个让我后怕的教训。

第一个月写文章时，我让 Gemini 帮我查了"香港外佣最低工资"，它给出了一个数字。我没有验证就直接用了。两周后，一个读者在评论区指出：**这个数字是 2022 年的，早已过时**。

对于一个 YMYL 网站来说，这种错误是致命的。如果 Google 发现你的内容包含过时或错误的法规数据，它会严重降低对你网站的信任评分。

从那以后，我引入了 **Perplexity** 作为事实核查工具，配合 **QuickCreator Extension** 做发布前的 EEAT 审计。

## Perplexity：不只是搜索，是溯源

Perplexity 和普通搜索引擎最大的区别在于：**它会告诉你信息的来源**。

当我问 Perplexity "2024年香港外佣最低工资标准" 时，它不仅给出答案，还会附上来源链接——通常是香港劳工处官网（\`labour.gov.hk\`）或政府公报。

我用 Perplexity 的三种场景：

### 场景一：文献溯源
针对法规、政策类信息，直接定位到官方源文件。比如外佣的最低工资、假期安排、合同范本等，必须找到 .gov.hk 的原始链接。

### 场景二：垂直检索
在特定的专业领域进行深度挖掘。比如了解某个签证类别的最新要求，普通搜索引擎可能给出一堆中介广告，但 Perplexity 能直接定位到入境事务处的政策文件。

### 场景三：权威背书
找到高权重的官方网站链接，作为文章中的外部引用。链接到 [labour.gov.hk](https://www.labour.gov.hk/)、行业协会、[国际劳工组织](https://www.ilo.org/)等权威来源，能显著提升文章的可信度。

## QuickCreator Extension：发布前的最后一道防线

QuickCreator 是一个浏览器插件，我用它做三件事：

### 1. 关键词侦测
输入文章 URL，它会分析页面上关键词的分布情况：
- 核心关键词出现了几次？
- 是否在 H1、H2、Meta Description 中出现？
- 关键词密度是否在合理范围（1-3%）内？

我也用它来扫描竞品文章，看看排名靠前的页面用了哪些关键词组合——这往往能发现我遗漏的词。

### 2. EEAT 审计
QuickCreator 会基于 Google 的 E-E-A-T 标准对内容进行评分，并指出短板：
- 是否有作者信息？
- 是否引用了权威来源？
- 是否有免责声明？
- 内容的专业深度如何？

每篇文章发布前，我会确保 EEAT 评分达到 80 分以上。如果不够，就针对性地补强。

### 3. TDK 校验
检查标题（Title）、描述（Description）和关键词（Keywords）是否符合规范：
- Title 是否控制在 60 字符以内？
- Description 是否在 155 字符以内？
- 核心关键词是否出现在 Title 和 Description 中？

## 我的内容审计 SOP

每篇文章发布前的固定流程：

1. **Perplexity 事实核查**（15 分钟）：核实所有数据、法规、引用的准确性
2. **补充权威引用**（10 分钟）：为关键数据添加 .gov.hk 等权威来源链接
3. **QuickCreator 关键词检查**（5 分钟）：确认关键词分布合理
4. **QuickCreator EEAT 审计**（5 分钟）：确保评分达标
5. **QuickCreator TDK 校验**（3 分钟）：最后检查搜索预览效果

整个流程大约 40 分钟，但它能有效避免"AI 幻觉"导致的内容事故。

## 效果

引入这套审计流程后：
- 再也没有出现过数据错误
- 文章的平均停留时间提升了 30%（因为内容更准确，用户更信任）
- Google 对新文章的收录速度明显加快——可能是因为之前发布的高质量内容已经建立了信任基线

> **延伸阅读**：关于 EEAT 的基础概念和我的法律背景如何助力信任建设，参见[母婴类网站如何建立 E-E-A-T](/blog/ymyl-eeat-disclaimer-seo-trust)。审计完成后，通过[Contentful 结构化发布 SOP](/blog/contentful-quickcreator-agile-publishing-sop) 高效上线。`,
  },

  /* ── 2-3 高效落地 ── */
  {
    slug: "contentful-quickcreator-agile-publishing-sop",
    title: "爆发式产出 SOP：Contentful 结构化发布与 QuickCreator 自动化审计",
    excerpt:
      "揭秘我的内容工厂！利用 Contentful 无头架构实现快速上线，配合 QuickCreator 进行即时关键词侦测与 TDK 校验。让每一篇内容在发布前都符合 SEO 完美标准。",
    publishDate: "2026-03-17",
    category: "工具与方法论",
    tags: ["Contentful教程", "QuickCreator插件", "SEO审计", "内容发布流程", "自动化SEO"],
    tools: ["Contentful", "QuickCreator Extension"],
    phase: 2,
    content: `## 一个人做内容站，产能是最大的瓶颈

第二个月开始，我给自己定了一个目标：**每周发布 2 篇高质量文章**。

听起来不多？但算算每篇文章的工作量：关键词调研 1 小时、意图分析 30 分钟、大纲 30 分钟、撰写 3 小时、配图 30 分钟、SEO 审计 40 分钟、发布 15 分钟——一篇文章大约需要 **6 个半小时**。

一周两篇就是 13 个小时。在这之外我还要做数据分析、竞品研究、内链优化。所以，**把发布和审计环节的效率提到最高**，成了当务之急。

## Contentful 的结构化发布优势

选择 [Contentful](https://www.contentful.com/) 作为 CMS 的一个重要原因是它的 **Headless（无头）架构**——内容和前端完全分离（我在[第一个月就发现了 Contentful 中容易忽视的 SEO 细节](/blog/contentful-alt-text-on-page-seo-details)）。这意味着：

### 优势一：内容录入标准化
在 Contentful 中，我定义了一套严格的内容模型（Content Model）：

- **Title**：文章标题（必填）
- **Slug**：URL 别名（必填，自动生成但可编辑）
- **Excerpt**：摘要（必填，控制在 120 字以内）
- **Body**：正文（Rich Text 格式）
- **Cover Image**：封面图（必填）
- **Category**：分类（从预定义列表中选择）
- **Tags**：标签（多选）
- **Publish Date**：发布日期

每次写新文章，我只需要按照这个模板填空，不需要思考"要不要加这个字段"。**标准化消灭了纠结**。

### 优势二：发布零等待
在 Contentful 中点击 "Publish" 后，通过 Webhook 触发 Next.js 的 ISR（增量静态再生成），新内容几分钟内就会出现在前端。整个过程不需要重新部署网站。

### 优势三：敏捷迭代
当通过 GSC 发现某篇文章的 CTR 偏低时，我可以在 Contentful 后台瞬间修改标题和 Meta Description，然后重新发布。从发现问题到修复上线，**最快只要 5 分钟**。

## QuickCreator 审计嵌入发布流程

我把 QuickCreator 的审计嵌入到了发布前的最后一步，形成了一个"质检关卡"：

### 审计清单

**关键词维度：**
- 核心关键词是否出现在 H1 中？
- H2 中是否包含了 2-3 个相关长尾词？
- 正文中关键词密度是否在 1-3%？
- 是否有同义词和相关词的覆盖？

**TDK 维度：**
- Title 长度：是否在 50-60 字符之间？
- Description 长度：是否在 140-155 字符之间？
- 核心关键词是否在 Title 前半段出现？

**EEAT 维度：**
- 是否有作者署名？
- 是否引用了权威外部来源？
- 是否有免责声明（针对 YMYL 内容）？
- 内容深度评分是否 > 80？

任何一项不达标，就修改后再重新审计，直到全部通过。

## 我的完整发布 SOP

| 步骤 | 工具 | 耗时 | 核心动作 |
|------|------|------|---------|
| 1. 录入内容 | Contentful | 10 分钟 | 按模板填充所有字段 |
| 2. 预览检查 | Contentful Preview | 5 分钟 | 确认格式、图片、链接正确 |
| 3. SEO 审计 | QuickCreator | 8 分钟 | 关键词 + TDK + EEAT 三重检查 |
| 4. 修正优化 | Contentful | 5-15 分钟 | 根据审计结果修改 |
| 5. 正式发布 | Contentful | 1 分钟 | 点击 Publish |
| 6. 索引推送 | GSC | 2 分钟 | 用网址检查工具主动推送 |

全流程 **30-40 分钟**（不含正文撰写时间）。

## 效率的复利效应

有了这套 SOP 后，我第二个月的产出显著提升：

- 第一个月：5 篇文章
- 第二个月：8 篇文章（提升 60%）

更重要的是，**每篇文章的质量没有因为提速而下降**。因为审计环节是标准化的，不依赖于我当时的状态好不好——即使半夜 12 点发文，QuickCreator 也会帮我把关。

> **延伸阅读**：内容发布后的工作同样重要——通过 [YouMind 视觉优化提升 SERP 点击率](/blog/youmind-ai-visual-ctr-serp-optimization)，以及定期用 [GSC 数据复盘做内容迭代](/blog/gsc-data-review-intent-correction)。`,
  },

  /* ── 2-4 视觉增效 ── */
  {
    slug: "youmind-ai-visual-ctr-serp-optimization",
    title: "视觉点击率黑客：利用 AI 海报在 SERP 中瞬间脱颖而出",
    excerpt:
      "好的 TDK 决定排名，好的视觉决定点击。分享我利用 YouMind 创作吸引力海报的逻辑，探讨视觉增效对 CTR (点击率) 的直接拉动作用。",
    publishDate: "2026-03-17",
    category: "工具与方法论",
    tags: ["CTR优化", "AI绘图", "YouMind实战", "搜索结果视觉优化", "封面设计"],
    tools: ["YouMind"],
    phase: 2,
    content: `## 同样排在第 5 位，为什么别人的点击率是你的 3 倍？

在 GSC 中看数据时，我注意到一个现象：两篇排名位置相近的文章，CTR 差异巨大。

- 文章 A：平均排名 5.2，CTR 6.8%
- 文章 B：平均排名 4.8，CTR 2.1%

排名更好的 B 反而点击率更低。为什么？

我去 Google 搜索了这两个关键词，对比了搜索结果页的展示效果。答案很明显：**文章 A 的搜索结果带有一张醒目的缩略图，而文章 B 没有**。

在搜索结果页（SERP）中，如果你的结果包含一张吸引人的图片，视觉上的冲击力会显著提升点击率——即使标题和描述完全一样。

## 为什么用 YouMind 而不是 Midjourney

市面上 AI 绘图工具很多，我最终选择 YouMind 的原因：

1. **风格统一**：YouMind 生成的图片风格比较一致，适合做信息站的配图。Midjourney 虽然效果惊艳，但每次生成的风格差异太大，用在同一个网站上会显得凌乱
2. **迭代速度快**：每个 prompt 生成 4 个版本，快速选择、微调
3. **输出尺寸灵活**：可以直接生成适合搜索结果展示的 16:9 比例图片
4. **成本合理**：免费额度足够我每周 2 篇文章的配图需求

## 我的配图策略

每篇文章我会生成 2-3 种类型的图片：

### 1. 封面图（Hero Image）
这是文章的"门面"，也是最可能出现在搜索结果中的图片。

设计原则：
- **高对比度**：在搜索结果的白色背景中能一眼看到
- **包含文字元素**：用 2-3 个大字概括文章主题
- **品牌色统一**：maidinhk.com 的主色调是蓝色系，所有封面图都保持一致

### 2. 信息图（Infographic）
把文章中的关键数据或流程可视化。比如"雇佣外佣的 5 个步骤"，用流程图比纯文字更直观。

### 3. 数据图（Data Visualization）
把对比数据做成表格或饼状图。比如"不同国籍外佣的薪资对比"，图表比文字列表更容易理解。

## 图片 SEO 的细节

生成好看的图片只是第一步，**让 Google 理解并收录这些图片**才能带来流量：

- **文件名语义化**：\`hong-kong-maid-hiring-steps-2024.png\` 而不是 \`image-001.png\`
- **Alt Text 精准描述**：用一句话描述图片内容，自然包含关键词
- **文件体积控制**：通过压缩工具将图片控制在 100KB 以内，避免影响页面加载速度
- **懒加载**：首屏图片正常加载，滚动区域的图片使用懒加载

## CTR 实验数据

我选了 3 篇排名在 5-10 位的文章，为它们重新制作了高质量封面图。两周后的数据变化：

| 文章 | 旧 CTR | 新 CTR | 变化 |
|------|--------|--------|------|
| 外佣薪资指南 | 2.1% | 4.7% | +124% |
| 中介费用详解 | 1.8% | 3.9% | +117% |
| 签证流程攻略 | 3.2% | 5.1% | +59% |

平均 CTR 提升了约 **100%**。

当然，这其中有"新内容红利"的因素——Google 可能对更新过的页面短期内给予更多展示。但即便排除这个因素，视觉优化对 CTR 的提升也是显著的。

## 总结

在 SEO 优化的各个环节中，视觉优化是投入产出比最高的。一张好的封面图：
- 制作时间：15-20 分钟
- 潜在 CTR 提升：50-100%
- 对排名没有负面影响

**好的 TDK 让你有资格出现在搜索结果中，好的视觉让用户选择点击你。**

> **延伸阅读**：视觉只是 CTR 优化的一个维度。到了第三个月，我总结了更系统的 [TDK 极致调优方法论](/blog/gsc-tdk-optimization-ctr-doubling)，通过数据驱动把 CTR 平均提升了 112%。图片的 SEO 基础设置参见[Contentful 中的 Alt Text 细节](/blog/contentful-alt-text-on-page-seo-details)。`,
  },

  /* ── 2-5 数据复盘 ── */
  {
    slug: "gsc-data-review-intent-correction",
    title: "别被虚假繁荣欺骗：通过 GSC 真实数据进行内容意图纠偏",
    excerpt:
      "为什么排名好却没转化？记录我利用 GSC 进行流量监控与意图纠偏的过程。通过分析真实搜索词，利用 Contentful 瞬间完成老文章的二次调优。",
    publishDate: "2026-03-17",
    category: "复盘与思考",
    tags: ["Google Search Console复盘", "流量监控", "意图纠偏", "TDK调优", "排名优化"],
    tools: ["Google Search Console", "Contentful"],
    phase: 2,
    content: `## 展示量涨了，但我高兴得太早了

第二个月中旬，maidinhk.com 的 GSC 数据开始好看了：总展示量突破了 1,200 次，我一度觉得增长飞轮已经转起来了。

但当我仔细拆解数据时，发现了一个问题：**有些页面的展示量很高，但点击率低得可怜**。

具体来说，有一篇关于"外佣合同"的文章，两周内展示了 180 次，但只有 2 次点击。CTR 只有 1.1%。

这不是"虚假繁荣"是什么？

## 问题出在哪里：查询词分析

GSC 最有价值的功能之一是「查询」报告——它能告诉你，用户是搜索了什么词才看到你的页面的。

我点开那篇"外佣合同"文章的查询详情，发现了问题：

**我以为用户搜的是：**
- "domestic helper contract hong kong"
- "外佣合同模板"

**用户实际搜的是：**
- "how to terminate domestic helper contract"（怎么解除合同）
- "domestic helper contract early termination"（提前终止合同）

看出区别了吗？**我写的是"如何签合同"，但用户搜的是"如何解约"**。搜索意图完全不匹配——难怪他们看到我的标题后不愿意点进来。

## 意图纠偏的三步法

发现了意图偏差后，我用三步完成了修正：

### 第一步：分析真实查询词
在 GSC 的「效果」报告中，选择特定页面 → 查看关联的查询词 → 按展示量排序。

找出那些展示量高但 CTR 低的查询词——这些就是"意图偏差词"。

### 第二步：调优 TDK
针对"外佣合同"这篇文章，我做了以下修改：

**旧 Title：** A Complete Guide to Domestic Helper Contracts in Hong Kong
**新 Title：** Hong Kong Domestic Helper Contract: Termination, Renewal & Key Clauses

**旧 Description：** Everything you need to know about domestic helper contracts...
**新 Description：** Need to terminate or renew your helper's contract? Understand early termination rules, notice periods, and the key clauses that protect both employer and helper.

新的 TDK 直接回应了用户搜索的真实意图——"解约"和"续约"。

### 第三步：补充内容
在文章中新增了两个章节：
- "提前终止合同的流程与注意事项"
- "合同到期后的续约 vs 不续约"

并把这两个章节放在文章前半部分——因为搜这些词的用户最想先看到这些内容。

## 在 Contentful 中完成快速迭代

Contentful 的无头架构在这个场景下展现了极大优势：

1. 进入 Contentful 后台 → 找到这篇文章
2. 修改 Title 和 Description 字段
3. 在 Body 中增加新章节
4. 点击 "Publish"
5. 等待 ISR 更新（约 5 分钟）

**从发现问题到修复上线，总共花了 45 分钟。** 如果用传统 CMS，可能要走开发、测试、部署的流程，至少半天。

## 纠偏后的效果

两周后再次查看数据：

| 指标 | 纠偏前 | 纠偏后 |
|------|--------|--------|
| 展示次数 | 180 | 220 |
| 点击次数 | 2 | 18 |
| CTR | 1.1% | 8.2% |
| 平均排名 | 12 | 9 |

CTR 提升了 **7 倍**，排名也从第二页进入了首页。

## 建立定期复盘机制

这次经历让我建立了一套定期复盘机制：

**每周三下午，花 30 分钟做以下事情：**

1. 打开 GSC「效果」报告，看过去 7 天的数据
2. 筛选"高展示低点击"的页面（展示 > 50，CTR < 3%）
3. 分析这些页面的查询词，找出意图偏差
4. 如果发现偏差，立即在 Contentful 中修正 TDK
5. 对排名在 10-20 位的页面，补充内容深度

## 核心感悟

**SEO 不是一次性的工作，而是一个持续的反馈循环。** 数据告诉你用户的真实需求，你根据数据调整内容，新的内容再产生新的数据。

很多人写完文章就不管了，但最大的优化空间恰恰在"发布之后"。[GSC](https://search.google.com/search-console/about) 给了你一个窗口去窥视用户的真实想法——**不用它就是浪费**。

> **延伸阅读**：意图纠偏是"存量优化"的起点。更极致的做法是[通过 TDK 微调让 CTR 翻倍](/blog/gsc-tdk-optimization-ctr-doubling)。而要从源头避免意图偏差，关键在于[写文章之前就做好搜索意图分析](/blog/search-intent-semrush-gemini-conversion)。`,
  },

  /* ── 2-6 权重流动 ── */
  {
    slug: "internal-link-strategy-content-island-detection",
    title: "告别内容孤岛：利用 QuickCreator 与 Contentful 构建站内「神经网络」",
    excerpt:
      "拒绝让好文章变「孤岛」！分享我利用 QuickCreator 侦测关键词分布，并在 Contentful 中通过 Internal Link 构建权重流的实战。让老文章带新文章。",
    publishDate: "2026-03-17",
    category: "SEO 实战笔记",
    tags: ["内链优化", "Internal Link", "权重传递", "页面收录", "QuickCreator"],
    tools: ["QuickCreator Extension", "Contentful"],
    phase: 2,
    content: `## 好文章为什么没有排名？因为没人"介绍"它

第二个月中期，我写了一篇自认为质量很高的文章——关于香港外佣的签证流程。关键词选得准、意图匹配好、EEAT 评分也高。但发布两周后，它还停留在"已发现 - 尚未编入索引"状态。

为什么？排查后发现原因很简单：**这篇文章是一座"孤岛"——没有任何其他页面链接到它**。

Google 的爬虫在网上是"顺着链接走"的。如果一个页面没有被其他页面引用，爬虫可能根本找不到它，或者即使找到了，也会认为它不重要。

## 内链的 SEO 价值

内链（Internal Link）在 SEO 中的价值远超大多数人的认知：

1. **帮助爬虫发现新页面**：新发布的文章通过内链被爬虫找到
2. **传递页面权重（Link Juice）**：高权重页面通过内链把"信任票"传递给链接目标
3. **定义内容关系**：告诉 Google 哪些页面在讲同一个主题
4. **提升用户体验**：引导用户发现更多相关内容，降低跳出率

## 用 QuickCreator 侦测内容孤岛

QuickCreator Extension 有一个非常实用的功能：扫描页面的内链分布。

我用它做了一次全站扫描，结果吓了一跳：**18 篇已发布文章中，有 5 篇的入站内链为零**。

这 5 篇"孤岛文章"有一个共同特点：它们是后来新增的话题，写的时候没有刻意在旧文章中添加指向它们的链接。

## 我的内链策略

修复孤岛问题后，我建立了一套系统化的内链策略：

### 策略一：Topic Cluster 模型

把所有文章按主题分组，每个主题组有一个支柱页（Pillar Page）和若干集群文章（Cluster Content）：

- **支柱页**：综合性长文，覆盖主题全貌
- **集群文章**：深入探讨某个子话题

链接规则：
- 每篇集群文章 → 必须链接回支柱页
- 支柱页 → 链接到所有集群文章
- 同一集群内的文章 → 互相链接

### 策略二：关键词锚文本

内链的锚文本（就是可点击的那段文字）非常重要。它告诉 Google "目标页面是关于什么的"。

**好的锚文本：**
"了解更多关于[香港外佣最低工资标准](link)的信息"

**差的锚文本：**
"[点击这里](link)了解更多"

原则：**锚文本应该自然地包含目标页面的核心关键词**。

### 策略三：新文章上线即内链

每发布一篇新文章，我会：
1. 在新文章中添加 3-5 个指向旧文章的内链
2. 在 2-3 篇相关旧文章中添加指向新文章的内链
3. 如果有支柱页，更新支柱页的内容索引

这确保了每一篇新文章从发布的第一天起就不是"孤岛"。

## 在 Contentful 中管理内链

Contentful 的 Rich Text 编辑器支持直接插入超链接。但手动管理几十篇文章之间的内链关系很容易出错。

我的解决方案：**建立一个内链矩阵表格**。

横轴是所有文章的标题，纵轴也是。每个交叉格标注"是否有链接"。这张表能帮我快速发现：
- 哪些文章之间应该有链接但没有
- 哪些文章的入站内链太少

每两周更新一次这张表。

## 修复后的效果

修复了 5 个内容孤岛后的变化：

- 3 篇原本未被收录的文章在一周内被 Google 收录
- 全站平均页面停留时间提升 20%（用户通过内链浏览更多页面）
- 单个支柱页的排名从第 15 位提升到第 8 位

## 核心原则

**内链不是"做完文章顺手加几个"的事情，而是一个需要系统规划的工程。** 每一条内链都在告诉 Google 你的网站结构——如果这个结构混乱或缺失，再好的内容也发挥不出应有的排名潜力。Google 官方也在[搜索中心链接最佳实践](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)中强调了可抓取链接的重要性。

> **延伸阅读**：内链是 Topic Cluster 的"神经系统"。关于集群战略的完整论述，请看[Topic Cluster 如何通过权重传导封锁流量入口](/blog/topic-cluster-authority-traffic-domination)。内链的基础——让页面先被 Google 收录——参见[Sitemap 与 GSC 收录实战](/blog/sitemap-gsc-indexing-proactive-submission)。`,
  },

  /* ================================================================
     第三个月：细节致胜与 SEO 思维进化
     ================================================================ */

  /* ── 3-1 思维觉醒 ── */
  {
    slug: "seo-mindset-shift-data-driven-keyword-selection",
    title: "别再问 AI 要关键词！SEO 思维进化：从「盲目发散」到「精准筛选」",
    excerpt:
      "告别低效！记录我从依赖 AI 猜词到利用 Semrush 数据进行「真词筛选」的转变。分享如何利用真实搜索数据驱动内容决策，建立高效的 Keyword 建模逻辑。",
    publishDate: "2026-03-17",
    category: "复盘与思考",
    tags: ["SEO思维", "关键词筛选", "Semrush技巧", "搜索意图", "数据驱动SEO"],
    tools: ["Semrush"],
    phase: 3,
    content: `## 一个让我效率翻倍的认知转变

第三个月开始的时候，我做了一个回顾：前两个月我是怎么找关键词的？

**旧模式（低效）：**
1. 让 Gemini 发散一个主题的关键词
2. 从 AI 给出的 20 个词里挑几个"感觉不错的"
3. 去 Semrush 验证搜索量和难度
4. 发现大部分词不行，再让 AI 发散一轮
5. 循环 3-4 次，最终确定关键词

这个过程通常要花 **2-3 小时**，而且结果不够精准——因为 AI 并不实时掌握 Google 的搜索意图和竞争难度，给出的词往往"大而空"。

**新模式（高效）：**
1. 打开 Semrush 的 Keyword Magic Tool
2. 输入一个"母词"
3. 按 KD、Volume、Intent 三个维度筛选
4. 导出一张完整的关键词表
5. 直接从表中挑选目标词

这个过程只要 **30 分钟**，而且每一个词都有真实的搜索数据支撑。

## 为什么 AI 不是找关键词的好工具

这不是在否定 AI 的价值——Gemini 在大纲发散和意图分析上仍然非常好用。但在"找关键词"这件事上，AI 有天然的局限：

1. **AI 不知道实时搜索量**：它给的词可能根本没人搜
2. **AI 不知道竞争难度**：它推荐的词可能 KD 高到新站根本做不了
3. **AI 容易"发散过度"**：给出一堆看起来很有道理但实际上搜索量为零的词
4. **AI 无法做搜索意图分析**：它不知道 Google 对一个词的"排名偏好"是什么类型

Semrush 的数据直接来自 Google，每一个数字都是真实用户的搜索行为。**与其猜测用户可能搜什么，不如直接看用户在搜什么。**

## 新模式的核心逻辑

我把新的关键词工作流总结为三个字：**不猜，筛**。

### 第一步：确定母词
母词就是一个核心主题词，比如"婴儿"、"domestic helper"、"外佣"。不需要太具体，越宽泛越好——因为 Semrush 会帮你发散。

### 第二步：全量扫描
在 Keyword Magic Tool 中输入母词，系统会生成数千个相关词。我通常能得到 500-3000 个关键词。

### 第三步：三维筛选
- **Volume > 50**：确保有人搜
- **KD < 35**：确保新站有机会
- **Intent = Informational 或 Commercial**：确保匹配信息站定位

### 第四步：导出并分类
把筛选后的词导出为 Excel，按场景分类。比如"domestic helper"这个母词，可以衍生出：
- 雇佣流程类（hiring process, requirements）
- 费用类（salary, cost, agency fee）
- 法律类（contract, termination, visa）
- 生活类（day off, food, accommodation）

### 第五步：直接规划内容
每个分类对应一个内容方向，每个分类下最好的 3-5 个关键词各对应一篇文章。

**以前找 10 个词要问 AI 10 次；现在导出一张表，直接锁定了未来 3 个月的文章大纲。**

## 效率对比

| 维度 | 旧模式（AI 发散） | 新模式（Semrush 筛选） |
|------|-------------------|---------------------|
| 找 20 个目标词 | 2-3 小时 | 30 分钟 |
| 数据准确性 | 低（需要二次验证） | 高（直接基于真实搜索） |
| 覆盖完整性 | 低（AI 容易遗漏） | 高（全量扫描） |
| 可复制性 | 低（依赖 prompt 质量） | 高（SOP 标准化） |

## 思维升级的本质

这次转变的本质不是"换了一个工具"，而是**认知模式的转变**：

- 从"**求索者**"变成"**筛选者**"：不再苦苦思考"该写什么"，而是从海量真实数据中挑选最有价值的
- 从"**创意导向**"变成"**数据导向**"：直觉仍然有用，但决策权交给数据
- 从"**单点突破**"变成"**全局规划**"：一次性看到整个赛道的关键词全景图，而不是一次找一个词

这个转变让我后续的内容生产效率至少提升了 3 倍。

> **延伸阅读**：这个思维转变的下一步，是把筛选出的关键词用[「母词拆解法」](/blog/semrush-mother-keyword-topic-cluster-planning)进行系统化聚类。而 AI 虽然不适合找关键词，但在[意图分析和大纲发散](/blog/search-intent-semrush-gemini-conversion)上仍然是不可替代的搭档。关于 Semrush 的基础操作入门，可以回顾[第一个月的 Semrush 实战](/blog/semrush-beginner-long-tail-keywords)。`,
  },

  /* ── 3-2 实战降维 ── */
  {
    slug: "semrush-mother-keyword-topic-cluster-planning",
    title: "以点带面的降维打击：用「母词拆解法」锁定半年的内容大纲",
    excerpt:
      "拒绝零散写文！分享我利用 Semrush 全量扫描「母词」、进行逻辑聚类的实战过程。通过场景化拆解，一次性锁定数月内容排产。",
    publishDate: "2026-03-17",
    category: "SEO 实战笔记",
    tags: ["母词拆解", "关键词聚类", "内容规划", "Semrush实战", "场景化SEO"],
    tools: ["Semrush"],
    phase: 3,
    content: `## 从零散选词到系统化规划

前两个月，我写文章的方式是"一篇一选"——每次要写新文章了，才去找关键词。这种方式有一个严重问题：**文章之间缺乏系统性**。

第三个月，我学会了一个方法——我叫它"母词拆解法"。核心思路是：**从一个宽泛的"母词"出发，通过 Semrush 的全量扫描，一次性发现数百个子词，然后按逻辑归类，形成完整的内容规划**。

## 母词拆解法：三步走

### 第一步：确立"母词"

母词的选择标准：
- 宽泛但不跑偏（"domestic helper" 而不是 "helper"）
- 和网站主题强相关
- 月搜索量足够大（> 1000），说明这个领域有足够多的子话题

我选择的母词示例：
- "domestic helper"：月搜索量 12,000+
- "foreign maid hong kong"：月搜索量 2,400+
- "外佣"：月搜索量 5,800+

### 第二步：Semrush 全量扫描

以 "domestic helper" 为例，在 Keyword Magic Tool 中输入后，系统返回了 **2,300+ 个相关关键词**。

这些词自然地分成了若干组别：
- domestic helper **salary** / wages / minimum wage
- domestic helper **contract** / termination / renewal
- domestic helper **agency** / best / fee
- domestic helper **visa** / requirement / application
- domestic helper **insurance** / medical / compensation
- domestic helper **day off** / holiday / rest day

每一组都是一个潜在的内容方向。

### 第三步：逻辑聚类

我把 2,300 个词按场景归类，形成了 8 个核心主题集群：

| 集群名称 | 核心场景 | 关键词数量 | 潜力评估 |
|---------|---------|-----------|---------|
| 雇佣流程 | 找人、面试、签约 | 180+ | 高 |
| 费用与薪资 | 工资、中介费、隐藏成本 | 220+ | 极高 |
| 签证与合规 | 签证申请、续签、终止 | 150+ | 高 |
| 合同管理 | 签约、解约、续约 | 130+ | 中高 |
| 日常管理 | 假期、职责、沟通 | 200+ | 中 |
| 保险与保障 | 医疗保险、工伤赔偿 | 90+ | 中 |
| 国籍差异 | 菲佣、印佣、缅甸佣 | 160+ | 高 |
| 法律纠纷 | 投诉、仲裁、法律援助 | 80+ | 中 |

每个集群下面，我再选出 3-5 个 KD < 30 且 Volume > 100 的核心词，**直接变成了文章选题**。

8 个集群 × 每个集群 4 篇文章 = **32 篇文章的完整大纲**——足够写半年。

## 为什么聚类比零散选词好

### 1. 效率碾压
以前：每次写文章都要重新调研关键词，每次 1-2 小时。
现在：一次调研出半年的选题，后续只需要"按表写文"。

### 2. 内链天然成网
同一个集群内的文章天然可以互相链接。比如"外佣薪资指南"链接到"外佣中介费详解"，"合同签订"链接到"合同终止"——**内链策略自然而然就形成了**。

### 3. Google 看到的是一个"专家"
当你在一个集群内发布了 4-5 篇深度文章，并用内链把它们串联起来，Google 会认为你的网站在这个领域是有深度的。**这种认知会提升全站的排名潜力。**

## 实操中的注意事项

1. **不要一口气发布一个集群的所有文章**：应该交错发布不同集群的文章，保持主题多样性
2. **先写 KD 最低的词**：在集群中优先选择 KD 最低的关键词做突破口，拿到排名后再写竞争更大的词
3. **支柱页最后写**：先把集群文章铺好，积累了数据和链接后，再写一篇综合性的支柱页来串联

## 总结

母词拆解法的本质是**以点带面**——一个母词就是一个起点，从它出发可以辐射出整个赛道的内容蓝图。

这种方法让 SEO 内容生产从"游击战"变成了"阵地战"——不再一篇一篇零散地写，而是系统化地占领一个又一个主题高地。[Semrush 的 Keyword Magic Tool](https://www.semrush.com/analytics/keywordmagic/start) 是执行母词拆解的核心武器。

> **延伸阅读**：母词拆解产出的集群，需要通过[内链策略](/blog/internal-link-strategy-content-island-detection)串联起来才能发挥最大威力。关于集群效应的深入分析，请看[Topic Cluster 如何通过权重传导封锁流量入口](/blog/topic-cluster-authority-traffic-domination)。`,
  },

  /* ── 3-3 集群效应 ── */
  {
    slug: "topic-cluster-authority-traffic-domination",
    title: "构建网站的百科全书：Topic Cluster 如何通过权重传导封锁流量入口",
    excerpt:
      "单兵作战已死！记录我构建 Topic Cluster 的实战，探讨 Internal Link 如何在集群内传导权重，利用海量长尾词封锁搜索入口。",
    publishDate: "2026-03-17",
    category: "复盘与思考",
    tags: ["主题集群", "Topic Cluster", "权重传导", "内部链接", "主题权威度"],
    tools: [],
    phase: 3,
    content: `## 单篇文章的天花板

第二个月的一个观察让我确信了一件事：**单篇文章的排名潜力是有天花板的**。

有一篇关于"外佣薪资"的文章，排名一直卡在第 8-10 位。我优化了 TDK、补充了内容、增加了权威引用——排名就是不动了。

后来我意识到，问题不在这篇文章本身，而在于 maidinhk.com 在"外佣薪资"这个主题上**只有这一篇文章**。Google 不太可能把一个只写了一篇文章的网站，排在那些写了 10 篇相关文章的竞品前面。

这就是 Topic Cluster（主题集群）的逻辑起点。

## Topic Cluster 的核心结构

一个完整的 Topic Cluster 包含三个元素：

### 1. Pillar Page（支柱页）
一篇覆盖主题全貌的综合性长文。比如"香港外佣完全指南"。它不会在某个子话题上深入，但它把整个话题的框架说清楚了。

### 2. Cluster Content（集群文章）
围绕支柱页的多篇深度子话题文章。比如：
- 外佣薪资标准 2024
- 外佣中介费详解
- 如何选择外佣中介
- 外佣合同条款解读
- 外佣签证申请流程

### 3. Internal Links（内链网络）
集群内所有文章通过内链互相连接，形成一个紧密的网络：
- 每篇集群文章 → 链接回支柱页
- 支柱页 → 链接到每篇集群文章
- 集群文章之间 → 相关的互相链接

## 权重传导的原理

为什么 Topic Cluster 有效？核心原因是**权重传导（Link Juice Flow）**。

想象一下：当你的"外佣薪资"文章排上了 Google 首页，它会积累页面权重。通过内链，这个权重会"流向"它链接的其他文章——比如"外佣中介费"。"中介费"文章因此获得了额外的权重加成，更容易排名上升。

而"中介费"排名上升后，又会通过内链把权重传回给"外佣薪资"和其他集群文章。**这就形成了一个正向循环**——集群内的文章互相提携，集体上升。

这就是为什么"一篇文章排上去了，整个集群都跟着好起来"的现象。

## 封锁搜索入口

Topic Cluster 的另一个威力在于**封锁搜索入口**。

用户搜"外佣"这个词很模糊，但当他搜索更具体的：
- "外佣最低工资 2024" → 你有文章
- "外佣中介费多少" → 你有文章
- "外佣合同怎么签" → 你有文章
- "外佣签证怎么办" → 你有文章
- "菲佣和印佣的区别" → 你有文章

当一个用户在"外佣"相关的任何搜索路径上都能遇到你——**你就封锁了这个主题的流量入口**。

## 实战中的集群构建

以 maidinhk.com 的"雇佣流程"集群为例：

**支柱页**：How to Hire a Domestic Helper in Hong Kong: Complete Guide

**集群文章**（按发布顺序）：
1. Step-by-Step: Finding the Right Maid Agency（KD 15，先发布）
2. Domestic Helper Interview Questions to Ask（KD 18）
3. Understanding Your Helper's Employment Contract（KD 22）
4. Visa Application Process for Foreign Domestic Helpers（KD 25）
5. First Week with Your New Helper: What to Expect（KD 12，最易）

发布策略：先发 KD 最低的文章拿到排名，再逐步发布 KD 更高的文章。等集群内积累了足够的内链和权重后，最后发布支柱页，一次性把整个集群串联起来。

## Google 的信任升级

当 maidinhk.com 在"雇佣流程"这个集群内积累了 5 篇深度文章后，我观察到了一个显著变化：**不仅集群内的文章排名在上升，全站其他主题的文章排名也在改善**。

这说明 Google 已经不只是认为 maidinhk.com "在雇佣流程上有深度"，而是开始认为这个网站 **在整个外佣领域都有权威性**。

这就是 Topic Cluster 的终极效果——**从主题权威到领域权威的飞跃**。

## 核心感悟

SEO 不是写一篇好文章的游戏，而是**构建一个知识体系**的游戏。Google 不会因为你写了一篇神文就给你全站提权，但它会因为你在一个领域持续输出高质量、有关联的内容而给你"专家"标签。

Topic Cluster 就是把"写文章"这件事从"单兵作战"升级为"集团军作战"。关于 Topic Cluster 的理论依据，可以参考 [HubSpot 关于 Pillar Page 策略的经典指南](https://blog.hubspot.com/marketing/topic-clusters-seo)。

> **延伸阅读**：构建集群的前提是做好[「母词拆解法」](/blog/semrush-mother-keyword-topic-cluster-planning)的关键词规划。集群内的文章还需要通过[内链策略](/blog/internal-link-strategy-content-island-detection)来实现权重传导。而最终的效果验证，要靠 [GSC 数据做 TDK 精修](/blog/gsc-tdk-optimization-ctr-doubling)。`,
  },

  /* ── 3-4 细节致胜 ── */
  {
    slug: "gsc-tdk-optimization-ctr-doubling",
    title: "存量市场的掘金术：利用 GSC 数据进行 TDK 极致调优以提升 CTR",
    excerpt:
      "排名没变，流量也能翻倍？分享我通过 GSC 挖掘「高曝光、低点击」页面的过程。针对用户真实意图，精练「广告语+CTA」，实现存量文章的二次流量爆发。",
    publishDate: "2026-03-17",
    category: "SEO 实战笔记",
    tags: ["CTR优化", "GSC数据分析", "TDK调优", "搜索点击率", "存量优化"],
    tools: ["Google Search Console"],
    phase: 3,
    content: `## 排名没变，流量也能翻倍？

第三个月，maidinhk.com 已经有 8 个关键词排在 Google 首页了。但我注意到一个反直觉的现象：**有些排在第 3 位的文章，CTR 反而比排在第 7 位的文章还低**。

这意味着：排名不是唯一决定流量的因素——**在排名已经足够好的情况下，CTR 的提升空间可能比排名提升更大**。

举个数学题：
- 一篇文章月展示 1000 次，排名第 5，CTR 3% → 月点击 30 次
- 优化 TDK 后，CTR 提升到 6%，排名不变 → 月点击 60 次

**不需要任何排名提升，流量直接翻倍。**

## 如何找到"高曝光、低点击"的页面

在 GSC 的「效果」报告中，按"页面"维度查看数据，然后：

1. 按展示量降序排列
2. 找出展示量 > 100 但 CTR < 3% 的页面
3. 这些就是"CTR 洼地"——最值得优化的页面

我找到了 5 个这样的页面。接下来，逐一分析它们的查询词，找出 CTR 低的原因。

## TDK 优化的四个维度

经过反复测试，我总结了四个能有效提升 CTR 的 TDK 优化维度：

### 维度一：标题中加入"信号词"

信号词是那些能瞬间吸引注意力的词汇：

| 信号词类型 | 示例 | 心理效应 |
|-----------|------|---------|
| 时效性 | "2024" | 说明信息是最新的 |
| 完整性 | "Complete Guide" "完全指南" | 暗示一站式解决 |
| 数字 | "5 Steps" "7 个技巧" | 具象化，降低阅读门槛 |
| 评价类 | "Reviewed" "对比" | 暗示有独立观点 |

**实测案例：**
- 旧 Title: "Domestic Helper Salary in Hong Kong"
- 新 Title: "Hong Kong Domestic Helper Salary 2024: Minimum Wage & Real Cost"

加入了 "2024"（时效性）和 "Real Cost"（差异化角度）后，CTR 从 2.8% 提升到 5.2%。

### 维度二：Description 要"回答问题"

很多人的 Meta Description 像是文章摘要——概括内容。但在搜索结果中，Description 的作用更像是"广告语"——它需要**直接回应用户的搜索意图**。

**差的 Description：**
"This article covers everything about domestic helper salary in Hong Kong, including minimum wage, bonus, and allowances."

**好的 Description：**
"How much should you pay your domestic helper in 2024? Get the latest minimum wage (HK$4,870/mo), plus hidden costs most employers miss."

区别：后者**直接给出了数字**（满足好奇心），**暗示了"隐藏成本"**（制造继续阅读的动力）。

### 维度三：匹配查询词的语言

GSC 告诉你用户搜的是什么词。你的 Title 和 Description 应该尽量使用和查询词相同的措辞。

如果用户搜的是 "how much does a maid cost"，你的 Title 中最好也出现 "how much" 和 "cost"，而不是用 "salary" 或 "wage" 这些同义但不完全匹配的词。

**Google 会把搜索结果中和查询词匹配的文字加粗显示**——这种视觉突出会进一步提升 CTR。

### 维度四：A/B 测试思维

SEO 不像投广告那样可以做严格的 A/B 测试，但我们可以做"序列测试"：

1. 记录当前 CTR
2. 修改 TDK
3. 等待 2 周
4. 对比新 CTR
5. 如果提升了，保留；如果下降了，回滚

我会在 Excel 中记录每次修改的内容和对应的 CTR 变化，逐渐积累出"什么样的写法对我的目标受众最有效"的经验库。

## 5 篇文章的优化效果

| 页面 | 优化内容 | 旧 CTR | 新 CTR | 变化 |
|------|---------|--------|--------|------|
| 外佣薪资指南 | 标题加年份+真实数字 | 2.8% | 5.2% | +86% |
| 中介费用详解 | Description 加具体金额 | 1.9% | 4.1% | +116% |
| 签证流程 | 标题加"Step-by-Step" | 3.1% | 4.8% | +55% |
| 合同模板 | Description 回应"解约"意图 | 1.1% | 3.6% | +227% |
| 雇佣指南 | 标题加"2024 Updated" | 3.4% | 5.9% | +74% |

**平均 CTR 提升 112%**，而排名几乎没有变化。

## 核心心法

到了第三个月，我对 SEO 的理解已经从"让文章排上去"进化到了**"让排上去的文章发挥最大价值"**。

这就像开了一家店：
- 第一阶段：选址、装修、开业（对应 SEO 的关键词调研、内容创作、获得排名）
- 第二阶段：优化门面、调整陈列、改善服务（对应 TDK 优化、CTR 提升、用户体验优化）

很多人只做了第一阶段就觉得 SEO "做完了"。但真正的增长，来自于对细节的持续打磨。

**排名决定你能不能出现在用户面前，CTR 决定用户会不会选择你。** 两者都做好，才是完整的 SEO。关于 CTR 优化的更多技巧，[Backlinko 的 CTR 研究报告](https://backlinko.com/google-ctr-stats)提供了大量行业基准数据。

> **延伸阅读**：TDK 优化是这趟 90 天旅程的最后一环。如果你想从头开始了解整个方法论，建议从[第一周搭建 GSC 监控塔](/blog/seo-beginner-first-week-gsc-setup)读起。视觉层面的 CTR 优化可以参考[利用 AI 海报提升 SERP 点击率](/blog/youmind-ai-visual-ctr-serp-optimization)。思维层面的进化则看[从盲目发散到精准筛选](/blog/seo-mindset-shift-data-driven-keyword-selection)。`,
  },
];
