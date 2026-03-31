// =====================================================
// 内容集群架构模块 (Topic Clusters)
// 展示外佣雇主痛点的内容矩阵
// =====================================================

import { useState } from 'react';

const pillars = [
  {
    id: 'hiring',
    title: '雇佣指南',
    keyword: '如何聘请外佣',
    description: '新手雇主全流程入门',
    color: '#2563eb',
    clusters: [
      '首次聘请外佣准备清单',
      '中介 vs 直接聘请优缺点',
      '外佣面试要问什么问题',
      '外佣到港后第一周安排',
    ],
  },
  {
    id: 'contract',
    title: '合约法规',
    keyword: '外佣合约注意事项',
    description: '法律风险与权益保障',
    color: '#10b981',
    clusters: [
      '外佣标准雇佣合约条款解析',
      '外佣休息日法律规定',
      '外佣工资调整机制',
      '终止合约的正确流程',
    ],
  },
  {
    id: 'interview',
    title: '面试筛选',
    keyword: '外佣面试技巧',
    description: '筛选匹配度评估',
    color: '#f59e0b',
    clusters: [
      '印尼女佣 vs 菲律宾女佣区别',
      '外佣工作经验核查方法',
      '外佣语言能力测试',
      '外佣健康状况评估',
    ],
  },
  {
    id: 'management',
    title: '日常管理',
    keyword: '外佣管理方法',
    description: '沟通与期望设定',
    color: '#8b5cf6',
    clusters: [
      '外佣工作职责说明书模板',
      '外佣手机使用规定',
      '外佣与家人相处技巧',
      '外佣表现评估表',
    ],
  },
  {
    id: 'problems',
    title: '常见问题',
    keyword: '外佣问题处理',
    description: '冲突解决与续约',
    color: '#ef4444',
    clusters: [
      '外佣想换雇主怎么办',
      '外佣工作效率低如何处理',
      '外佣与老人相处问题',
      '外佣合约到期续约谈判',
    ],
  },
];

export default function TopicClusters() {
  const [activePillar, setActivePillar] = useState(pillars[0].id);

  const currentPillar = pillars.find((p) => p.id === activePillar);

  return (
    <div className="rounded-sm border border-[#eee] bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-[#1a1a1a]">
          内容集群架构
        </h3>
        <p className="mt-1 text-sm text-[#888]">
          Topic Clusters · 以&quot;外佣雇主痛点&quot;为核心的内容矩阵
        </p>
      </div>

      {/* Pillar Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {pillars.map((pillar) => (
          <button
            key={pillar.id}
            onClick={() => setActivePillar(pillar.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
              activePillar === pillar.id
                ? 'text-white shadow-sm'
                : 'bg-[#f5f5f5] text-[#666] hover:bg-[#eee]'
            }`}
            style={{
              backgroundColor: activePillar === pillar.id ? pillar.color : undefined,
            }}
          >
            {pillar.title}
          </button>
        ))}
      </div>

      {/* Active Pillar Detail */}
      {currentPillar && (
        <div className="rounded-sm border border-[#eee] bg-[#fafafa] p-5">
          {/* Pillar Header */}
          <div className="mb-4 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: currentPillar.color }}
            >
              P
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                {currentPillar.title}
              </h4>
              <p className="text-sm text-[#666]">{currentPillar.description}</p>
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: currentPillar.color }}
              >
                {currentPillar.keyword}
              </span>
            </div>
          </div>

          {/* Cluster Items */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {currentPillar.clusters.map((cluster, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-sm border border-[#e0e0e0] bg-white p-3 transition-all hover:border-[#ccc] hover:shadow-sm"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: currentPillar.color }}
                >
                  {index + 1}
                </span>
                <span className="text-sm text-[#1a1a1a]">{cluster}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#f0f0f0] pt-6 text-center">
        <div>
          <p className="text-2xl font-bold text-[#1a1a1a]">5</p>
          <p className="text-xs text-[#888]">支柱页面</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1a1a1a]">20</p>
          <p className="text-xs text-[#888]">集群内容</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1a1a1a]">100%</p>
          <p className="text-xs text-[#888]">痛点覆盖</p>
        </div>
      </div>
    </div>
  );
}
