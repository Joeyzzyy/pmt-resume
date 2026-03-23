// =====================================================
// 技术成就描述模块
// 展示 SEO 技术优化成果
// =====================================================

const achievements = [
  {
    title: 'Sitemap 架构优化',
    icon: '🗺️',
    description:
      '手动构建三层级 Sitemap 体系，将 20+ 页面按内容集群逻辑分组提交，确保 Googlebot 优先抓取高转化页面。通过 GSC Index Coverage 监控，实现收录率从 45% 提升至 92%。',
    metrics: [
      { label: '收录率提升', value: '45% → 92%' },
      { label: 'Sitemap 分组', value: '3 层级' },
    ],
  },
  {
    title: '抓取预算管理',
    icon: '🕷️',
    description:
      '识别并清理低质量重复页面（如标签页、存档页），将抓取预算集中在 5 个支柱页面及其对应的长尾词内容。配合 noindex 标签和 canonical 规范，避免权重分散。',
    metrics: [
      { label: '清理页面', value: '15+' },
      { label: '聚焦支柱', value: '5 个' },
    ],
  },
  {
    title: '收录加速机制',
    icon: '⚡',
    description:
      '对新发布内容实施"即时推送"策略——上线当日手动提交至 GSC，配合内部链接矩阵（支柱页面 ↔ 集群内容的双向链接），使新内容平均收录周期从 14 天缩短至 3 天。',
    metrics: [
      { label: '收录周期', value: '14天 → 3天' },
      { label: '加速倍数', value: '4.7x' },
    ],
  },
  {
    title: '排名稳定性保障',
    icon: '📈',
    description:
      '建立日级 GSC 监控机制，对排名波动 >3 位的关键词启动诊断流程。通过持续优化 Title/Description 的 CTR 表现（从 1.8% 提升至 2.71%），反向强化排名稳定性，使平均排名长期维持在 8.4（首页前 10）。',
    metrics: [
      { label: '平均排名', value: '8.4' },
      { label: 'CTR 提升', value: '1.8% → 2.71%' },
    ],
  },
];

export default function TechnicalAchievements() {
  return (
    <div className="rounded-sm border border-[#eee] bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-[#1a1a1a]">
          技术 SEO 成就
        </h3>
        <p className="mt-1 text-sm text-[#888]">
          Technical Achievements · 手动优化驱动的排名增长
        </p>
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        {achievements.map((item, index) => (
          <div
            key={index}
            className="rounded-sm border border-[#eee] p-5 transition-all hover:border-[#ddd] hover:shadow-sm"
          >
            <div className="mb-3 flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h4 className="font-serif text-base font-semibold text-[#1a1a1a]">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-4 flex gap-4 border-t border-[#f0f0f0] pt-4">
              {item.metrics.map((metric, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-lg font-bold text-[#1a1a1a]">{metric.value}</p>
                  <p className="text-xs text-[#888]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-sm bg-[#1a1a1a] p-5 text-white">
        <h4 className="mb-2 font-serif text-base font-semibold">技术成果总结</h4>
        <p className="text-sm leading-relaxed text-gray-300">
          通过系统化的 Sitemap 管理、抓取预算优化和日级监控机制，将 maidinhk.com
          从新建站点优化至平均排名 8.4（首页前 10），CTR 高于行业均值 35%+，
          在外佣雇主垂直领域建立了稳定的搜索权威性。
        </p>
      </div>
    </div>
  );
}
