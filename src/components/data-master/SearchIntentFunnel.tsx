// =====================================================
// 搜索意图转化漏斗模块
// 展示点击数据按搜索意图的拆解
// =====================================================

import { useState } from 'react';

interface IntentData {
  type: string;
  label: string;
  percentage: number;
  clicks: number;
  color: string;
  keywords: string[];
  tactics: string[];
}

const intentData: IntentData[] = [
  {
    type: 'informational',
    label: '信息类',
    percentage: 45,
    clicks: 829,
    color: '#3b82f6',
    keywords: ['如何...', '什么是...', '指南', '教程'],
    tactics: [
      '创作 2,000+ 字深度指南，覆盖外佣雇佣全流程',
      '添加 FAQ Schema，争取 Google 精选摘要位',
      '使用目录锚点导航，降低跳出率',
    ],
  },
  {
    type: 'commercial',
    label: '商业类',
    percentage: 30,
    clicks: 553,
    color: '#10b981',
    keywords: ['最好...', '推荐...', 'vs', '对比'],
    tactics: [
      '制作"菲律宾 vs 印尼女佣对比表"决策工具',
      '添加雇主真实评价和案例',
      '植入"免费咨询"等高转化 CTA',
    ],
  },
  {
    type: 'navigational',
    label: '导航类',
    percentage: 15,
    clicks: 276,
    color: '#f59e0b',
    keywords: ['品牌词', '登录', '下载', '官网'],
    tactics: [
      '确保品牌词搜索首位无竞品广告',
      '优化站内搜索功能',
      '建立清晰的网站导航层级',
    ],
  },
  {
    type: 'transactional',
    label: '交易类',
    percentage: 10,
    clicks: 185,
    color: '#ef4444',
    keywords: ['聘请', '申请', '价格', '预约'],
    tactics: [
      '落地页加载速度 < 2s',
      '添加信任徽章（安全认证、用户评价）',
      'A/B 测试表单字段，降低填写阻力',
    ],
  },
];

export default function SearchIntentFunnel() {
  const [activeIntent, setActiveIntent] = useState<string>(intentData[0].type);

  const currentIntent = intentData.find((i) => i.type === activeIntent);
  const totalClicks = intentData.reduce((sum, i) => sum + i.clicks, 0);

  return (
    <div className="rounded-sm border border-[#eee] bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-[#1a1a1a]">
          搜索意图转化漏斗
        </h3>
        <p className="mt-1 text-sm text-[#888]">
          Search Intent Funnel · 基于 {totalClicks.toLocaleString()} 次点击的意图拆解
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="mb-6 space-y-3">
        {intentData.map((intent) => (
          <div
            key={intent.type}
            onClick={() => setActiveIntent(intent.type)}
            className={`cursor-pointer rounded-sm border p-4 transition-all ${
              activeIntent === intent.type
                ? 'border-[#ccc] bg-[#fafafa]'
                : 'border-[#eee] hover:border-[#ddd]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: intent.color }}
                >
                  {intent.percentage}%
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a]">{intent.label}</p>
                  <p className="text-xs text-[#888]">
                    约 {intent.clicks.toLocaleString()} 次点击
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#999]">特征词</p>
                <p className="max-w-[150px] truncate text-xs text-[#666]">
                  {intent.keywords.join(' · ')}
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-[#f0f0f0]">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${intent.percentage}%`,
                  backgroundColor: intent.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Active Intent Tactics */}
      {currentIntent && (
        <div
          className="rounded-sm border-l-4 bg-[#fafafa] p-5"
          style={{ borderLeftColor: currentIntent.color }}
        >
          <h4 className="mb-3 font-medium text-[#1a1a1a]">
            {currentIntent.label}优化策略
          </h4>
          <ul className="space-y-2">
            {currentIntent.tactics.map((tactic, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-[#666]">
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: currentIntent.color }}
                />
                {tactic}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conversion Tip */}
      <div className="mt-6 rounded-sm bg-gradient-to-r from-[#f0f9ff] to-[#f0fdf4] p-4">
        <p className="text-sm text-[#666]">
          <span className="font-medium text-[#1a1a1a]">💡 转化洞察：</span>
          信息类流量占比 45%，通过深度内容建立信任后，引导至商业类页面，可提升整体转化率
          30%+。
        </p>
      </div>
    </div>
  );
}
