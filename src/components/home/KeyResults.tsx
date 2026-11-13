import styles from "@/styles/home.module.css";
import ScrollReveal from "@/components/resume/ScrollReveal";
import LightboxImage from "@/components/home/LightboxImage";
import PopularContent from "@/components/home/PopularContent";
import PhaseTimeline from "@/components/home/PhaseTimeline";

export default function KeyResults() {
  return (
<section id="key-results" className={styles.section} style={{ paddingBottom: 80 }}>
  <ScrollReveal>
    <header>
      <p className={styles.sectionLabel}>
        <a
          href="https://maidinhk.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.trafficSiteLink}
        >
          maidinhk.com
        </a>
        {' · Full SEO Journey'}
      </p>
      <h1 className={styles.sectionHeading}>从快速增长，到诊断修复</h1>
      <p className={`${styles.aboutText} ${styles.trafficIntro}`}>
        <span className={styles.trafficIntroSentence}>
          独立负责 maidinhk.com 的 SEO 全链路，从关键词策略、内容规划到技术优化与数据复盘。
        </span>
        <span className={`${styles.trafficIntroSentence} ${styles.trafficIntroAccent}`}>
          香港外佣垂直内容站 · 零外链 · 零预算 · 纯内容 SEO
        </span>
        <span className={styles.trafficIntroSentence}>
          我既能通过内容策略推动新站从 0 到 1，也能在流量下滑后完成诊断、修复与增长反转。
        </span>
      </p>

      <dl className={styles.trafficStats} aria-label="全站累计成果">
        <div>
          <dt>累计点击</dt>
          <dd>37,557</dd>
        </div>
        <div>
          <dt>累计曝光</dt>
          <dd>1,020,397</dd>
        </div>
        <div>
          <dt>出词规模</dt>
          <dd>1,000+</dd>
        </div>
        <div>
          <dt>关键词 Top 10</dt>
          <dd>773</dd>
        </div>
      </dl>
      <p className={styles.trafficProofNote}>
        588 个独立页面中，391 个平均排名进入 Google 第一页；Top 10 文章贡献全站 44.6% 点击。
      </p>
      <p className={styles.trafficDataNote}>
        数据范围：2026.01.09–11.08 · Web 搜索。注：本报表受 GSC 网页版导出限制，仅含前 1,000 条 Query，未包含全部关键词；出词规模为下限，Top 排名数量仅为该导出样本统计，非全站精确总量。
      </p>
    </header>

    <figure className={styles.trafficFigure}>
      <div className={styles.trafficImageWrap}>
        <LightboxImage
          src="/images/seo-data/maidinhk-gsc.png"
          alt="maidinhk.com 自建站以来 Google Search Console 每日点击与曝光趋势图"
          width={2084}
          height={844}
          className={styles.trafficImg}
          sizes="(max-width: 900px) calc(100vw - 48px), 812px"
        />
      </div>
      <figcaption className={styles.trafficCaption}>
        maidinhk.com 自建站以来点击与曝光趋势 · 数据来源：Google Search Console · 点击图片可放大
      </figcaption>
    </figure>

    <ol className={styles.trafficPhases}>
      <li className={styles.trafficPhase}>
        <div className={styles.trafficPhaseMeta}>
          <span className={styles.trafficPhasePeriod}>1–5 月</span>
        </div>
        <h2 className={styles.trafficPhaseTitle}>快速起量</h2>
        <p className={styles.trafficPhaseMetric}>0 → 月点击 5,137 / 曝光 11.9 万</p>
        <p className={styles.trafficPhaseDesc}>
          平均排名从 11.6 提升至 6.3，新站 2–3 个月即进入 Google 第一页。
        </p>
      </li>
      <li className={styles.trafficPhase}>
        <div className={styles.trafficPhaseMeta}>
          <span className={styles.trafficPhasePeriod}>6–8 月</span>
        </div>
        <h2 className={styles.trafficPhaseTitle}>维护衰退</h2>
        <p className={styles.trafficPhaseMetric}>点击 -43% 至 2,950</p>
        <p className={styles.trafficPhaseDesc}>
          合作方业务调整、内容停更，排名均值跌至 11.8，跌出第一页。
        </p>
      </li>
      <li className={styles.trafficPhase}>
        <div className={styles.trafficPhaseMeta}>
          <span className={styles.trafficPhasePeriod}>9 月至今</span>
        </div>
        <h2 className={styles.trafficPhaseTitle}>重启复苏</h2>
        <p className={styles.trafficPhaseMetric}>9 月止跌 +54%，10 月双创历史新高</p>
        <p className={styles.trafficPhaseDesc}>
          10 月点击 6,064、曝光 19.5 万；11 月前 8 天日均点击 317，是 8 月低谷的 3.3 倍，全月 run-rate 约 9,500 点击 / 33 万曝光。
        </p>
      </li>
    </ol>
  </ScrollReveal>

  <ScrollReveal>
    <div className={styles.phaseSectionHeading} id="two-phases">
      <p className={styles.sectionLabel}>Proof by Phase</p>
      <h2 className={styles.phaseListHeading}>两个阶段，两组独立证据</h2>
      <p className={styles.phaseListIntro}>
        「前 3 个月」呈现从 0 到 1 的增长能力；「拯救」呈现下行后的诊断与修复能力。悬停或点击线段节点，按需查看。
      </p>
    </div>

    <PhaseTimeline
      early={
        <div className={styles.phaseContent}>
          <p className={styles.phaseIntro}>
            以下 5 个维度，是我从零运营 maidinhk.com 前 3 个月的真实成果。所有数据均来自 Google Search Console 导出，可随时验证。
          </p>
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
        </div>
      }
      rescue={
        <div className={styles.phaseContent}>
          <p className={styles.phaseIntro}>
            我把这次重启拆成诊断、修复、验证三步，先确认衰退原因，再用对应动作和后续数据验证效果。
          </p>

          <div className={styles.rescueFlow}>
            <section className={styles.rescueStage}>
              <header className={styles.rescueStageHeader}>
                <span className={styles.rescueStageLabel}>01 / 诊断</span>
                <div>
                  <h3>先拆解衰退，再决定动作</h3>
                  <p>点击与排名同步回落，不停留在「停更」这一表层原因。</p>
                </div>
              </header>
              <div className={styles.rescueStageBody}>
                <div className={styles.rescueDiagnosis}>
                  <div className={styles.rescueFactors}>
                    <span>内容停更</span>
                    <span>时效词衰减</span>
                    <span>竞对跟进</span>
                  </div>
                  <p>
                    5 月 → 8 月：点击 5,137 → 2,950（<strong>-42.6%</strong>）；曝光 -45.5%；平均排名 7.2 → 11.8。
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.rescueStage}>
              <header className={styles.rescueStageHeader}>
                <span className={styles.rescueStageLabel}>02 / 修复</span>
                <div>
                  <h3>恢复更新 + 存量优化</h3>
                  <p>9 月重启后，分别处理内容时效、搜索意图覆盖与 CTR 问题。</p>
                </div>
              </header>
              <div className={styles.rescueStageBody}>
                <div className={styles.rescueActions}>
                  <div className={styles.rescueAction}>
                    <h4>时效词刷新</h4>
                    <p>更新 2026 最低工资、长者日等时效内容，修复随时间衰减的页面。</p>
                  </div>
                  <div className={styles.rescueAction}>
                    <h4>长尾词簇补全</h4>
                    <p>围绕签证代办、预约、网上申请等下游搜索意图补齐内容。</p>
                  </div>
                  <div className={styles.rescueAction}>
                    <h4>内链重构 + CTR 优化</h4>
                    <p>重写高曝光、低 CTR 页面的 title / description，并重构存量内容内链。</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.rescueStage}>
              <header className={styles.rescueStageHeader}>
                <span className={styles.rescueStageLabel}>03 / 验证</span>
                <div>
                  <h3>1 个月止跌，2 个月创新高</h3>
                  <p>结果不是回到原点，而是超过此前峰值。</p>
                </div>
              </header>
              <div className={styles.rescueStageBody}>
                <div className={styles.rescueMetrics}>
                  <div className={styles.rescueCard}>
                    <span className={styles.rescuePeriod}>9 月 · 止跌</span>
                    <strong className={styles.rescueValue}>+54%</strong>
                    <p>当月点击回升至 4,544，流量曲线确认止跌。</p>
                  </div>
                  <div className={styles.rescueCard}>
                    <span className={styles.rescuePeriod}>10 月 · 新高</span>
                    <strong className={styles.rescueValue}>6,064</strong>
                    <p>月点击；曝光 19.5 万，双创历史新高，点击较 5 月峰值高 18%。</p>
                  </div>
                  <div className={styles.rescueCard}>
                    <span className={styles.rescuePeriod}>11 月 · 延续</span>
                    <strong className={styles.rescueValue}>317</strong>
                    <p>前 8 天日均点击，是 8 月低谷的 3.3 倍。</p>
                  </div>
                </div>

                <div className={styles.rescueRunRate}>
                  <span className={styles.rescueRunRateLabel}>11 月全月 run-rate（预估）</span>
                  <strong>约 9,500 点击 / 33 万曝光</strong>
                  <small>按 11 月前 8 天日均表现推算，属于趋势预估，非最终月度数据。</small>
                </div>
              </div>
            </section>
          </div>

          <p className={styles.rescueConclusion}>
            从衰退因子拆解，到动作验证，再到超过原峰值，形成可复用的<strong>诊断 → 修复 → 验证</strong>闭环。
          </p>
        </div>
      }
    />
  </ScrollReveal>

  <PopularContent />
</section>
  );
}
