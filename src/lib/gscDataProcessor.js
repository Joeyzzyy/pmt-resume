/**
 * GSC Data Processor
 * 处理 Google Search Console 导出数据的核心脚本
 * 功能：排名分桶、意图识别、性能指标计算
 */

/**
 * 主处理函数 - 处理 GSC CSV 数据
 * @param {Array<Object>} csvData - 从 GSC 导出的 CSV 数据数组
 * @returns {Object} 适配 ECharts/Recharts 的图表数据
 */
function processGSCData(csvData) {
  // 输入验证
  if (!Array.isArray(csvData) || csvData.length === 0) {
    return getEmptyResult();
  }

  // 清洗和标准化数据
  const cleanData = csvData.map((row, index) => normalizeRow(row, index)).filter(Boolean);

  if (cleanData.length === 0) {
    return getEmptyResult();
  }

  // 1. 排名分桶统计
  const rankingBuckets = calculateRankingBuckets(cleanData);

  // 2. 意图识别与分类
  const intentData = classifyByIntent(cleanData);

  // 3. 计算性能指标
  const metrics = calculateMetrics(cleanData, intentData);

  // 4. 生成图表适配数据
  return {
    // 排名分桶数据 - 适配饼图/环形图
    rankingDistribution: {
      type: 'pie',
      data: [
        { name: '1-3 位 (首页顶部)', value: rankingBuckets['1-3'], itemStyle: { color: '#10b981' } },
        { name: '4-10 位 (首页中部)', value: rankingBuckets['4-10'], itemStyle: { color: '#3b82f6' } },
        { name: '11-30 位 (第2-3页)', value: rankingBuckets['11-30'], itemStyle: { color: '#f59e0b' } },
        { name: '31+ 位 (第4页后)', value: rankingBuckets['31+'], itemStyle: { color: '#ef4444' } }
      ],
      total: cleanData.length,
      summary: {
        homepageRate: ((rankingBuckets['1-3'] + rankingBuckets['4-10']) / cleanData.length * 100).toFixed(1),
        top3Count: rankingBuckets['1-3'],
        top10Count: rankingBuckets['1-3'] + rankingBuckets['4-10']
      }
    },

    // 意图分布数据 - 适配柱状图/条形图
    intentDistribution: {
      type: 'bar',
      categories: ['信息型', '商业型', '交易型', '导航型'],
      data: [
        {
          name: '信息型 (Informational)',
          value: intentData.Informational.length,
          clicks: metrics.Informational.totalClicks,
          ctr: metrics.Informational.avgCtr,
          avgPosition: metrics.Informational.avgPosition,
          itemStyle: { color: '#3b82f6' }
        },
        {
          name: '商业型 (Commercial)',
          value: intentData.Commercial.length,
          clicks: metrics.Commercial.totalClicks,
          ctr: metrics.Commercial.avgCtr,
          avgPosition: metrics.Commercial.avgPosition,
          itemStyle: { color: '#8b5cf6' }
        },
        {
          name: '交易型 (Transactional)',
          value: intentData.Transactional.length,
          clicks: metrics.Transactional.totalClicks,
          ctr: metrics.Transactional.avgCtr,
          avgPosition: metrics.Transactional.avgPosition,
          itemStyle: { color: '#10b981' }
        },
        {
          name: '导航型 (Navigational)',
          value: intentData.Navigational.length,
          clicks: metrics.Navigational.totalClicks,
          ctr: metrics.Navigational.avgCtr,
          avgPosition: metrics.Navigational.avgPosition,
          itemStyle: { color: '#f59e0b' }
        }
      ]
    },

    // 意图性能对比 - 适配雷达图
    intentPerformance: {
      type: 'radar',
      indicator: [
        { name: '点击量', max: getMaxValue(metrics, 'totalClicks') },
        { name: 'CTR', max: getMaxValue(metrics, 'avgCtr') },
        { name: '排名位置', max: 50 },
        { name: '关键词数', max: Math.max(
          intentData.Informational.length,
          intentData.Commercial.length,
          intentData.Transactional.length,
          intentData.Navigational.length
        )}
      ],
      series: [
        {
          name: '信息型',
          value: [
            metrics.Informational.totalClicks,
            metrics.Informational.avgCtr * 100,
            51 - metrics.Informational.avgPosition, // 反转排名（越小越好）
            intentData.Informational.length
          ]
        },
        {
          name: '商业型',
          value: [
            metrics.Commercial.totalClicks,
            metrics.Commercial.avgCtr * 100,
            51 - metrics.Commercial.avgPosition,
            intentData.Commercial.length
          ]
        },
        {
          name: '交易型',
          value: [
            metrics.Transactional.totalClicks,
            metrics.Transactional.avgCtr * 100,
            51 - metrics.Transactional.avgPosition,
            intentData.Transactional.length
          ]
        }
      ]
    },

    // 排名趋势数据 - 适配折线图
    rankingTrend: generateRankingTrend(cleanData),

    // 原始统计数据
    rawStats: {
      totalKeywords: cleanData.length,
      totalClicks: cleanData.reduce((sum, item) => sum + item.clicks, 0),
      totalImpressions: cleanData.reduce((sum, item) => sum + item.impressions, 0),
      avgCtr: (cleanData.reduce((sum, item) => sum + item.ctr, 0) / cleanData.length * 100).toFixed(2),
      avgPosition: (cleanData.reduce((sum, item) => sum + item.position, 0) / cleanData.length).toFixed(1),
      rankingBuckets,
      intentBreakdown: {
        Informational: {
          count: intentData.Informational.length,
          ...metrics.Informational
        },
        Commercial: {
          count: intentData.Commercial.length,
          ...metrics.Commercial
        },
        Transactional: {
          count: intentData.Transactional.length,
          ...metrics.Transactional
        },
        Navigational: {
          count: intentData.Navigational.length,
          ...metrics.Navigational
        }
      }
    },

    // 详细数据表
    details: cleanData.map(item => ({
      query: item.query,
      position: item.position,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: (item.ctr * 100).toFixed(2),
      intent: item.intent,
      intentLabel: getIntentLabel(item.intent)
    })).sort((a, b) => a.position - b.position)
  };
}

/**
 * 标准化单行数据
 */
function normalizeRow(row, index) {
  try {
    // 处理可能的字段名变体
    const query = sanitizeString(row.Query || row.query || row['搜索查询'] || '');
    const position = parseFloat(row.Position || row.position || row['排名'] || 0);
    const clicks = parseInt(row.Clicks || row.clicks || row['点击次数'] || 0, 10);
    const impressions = parseInt(row.Impressions || row.impressions || row['展示次数'] || 0, 10);
    const ctr = parseFloat(row.CTR || row.ctr || row['点击率'] || 0);

    // 数据验证
    if (!query || isNaN(position) || position <= 0) {
      return null;
    }

    // CTR 校验：如果 CSV 中的 CTR 不合理，重新计算
    let normalizedCtr = ctr;
    if (ctr > 1) {
      // 可能是百分比格式 (2.5%)
      normalizedCtr = ctr / 100;
    } else if (impressions > 0 && clicks >= 0) {
      // 重新计算确保准确性
      normalizedCtr = clicks / impressions;
    }

    // 边界值处理
    normalizedCtr = Math.min(Math.max(normalizedCtr, 0), 1);

    return {
      id: index,
      query: query.substring(0, 100), // 限制长度
      position: Math.round(position * 10) / 10, // 保留1位小数
      clicks: Math.max(0, clicks),
      impressions: Math.max(0, impressions),
      ctr: normalizedCtr,
      intent: detectIntent(query)
    };
  } catch (error) {
    console.warn(`处理第 ${index + 1} 行数据时出错:`, error);
    return null;
  }
}

/**
 * 字符串清洗
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '') // 移除控制字符
    .replace(/^\s+|\s+$/g, '') //  trim
    .substring(0, 200); // 限制长度
}

/**
 * 意图检测
 */
function detectIntent(query) {
  const lowerQuery = query.toLowerCase();

  // 信息型关键词
  const informationalPatterns = [
    '流程', '点样', '指南', '手续', '如何', '怎样', '教程',
    '攻略', '方法', '步骤', '介绍', '解释', '是什么', '为什么',
    '怎么', '何如', '求', '問', '问题', 'FAQ', 'what', 'how to',
    'guide', 'tutorial', 'step', 'process', 'procedure'
  ];

  // 商业型关键词
  const commercialPatterns = [
    '中介', '比较', '边间好', '推荐', '评测', '对比', '哪个好',
    '最好', '排名', '排行榜', '前十', '评价', '口碑', 'vs',
    'versus', 'compare', 'best', 'top', 'review', 'recommend'
  ];

  // 交易型关键词
  const transactionalPatterns = [
    '预约', '价格', '收费', '地址', '电话', '联系', '购买',
    '订购', '报名', '申请', '下载', '免费', '优惠', 'discount',
    'price', 'cost', 'buy', 'purchase', 'order', 'book', 'download'
  ];

  // 导航型关键词（品牌词）
  const navigationalPatterns = [
    'maidinhk', 'maidin', '美迪', '官网', '首页', '网站',
    'official', 'homepage', 'login', 'sign in'
  ];

  // 优先级：Transactional > Commercial > Informational > Navigational
  if (transactionalPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) {
    return 'Transactional';
  }
  if (commercialPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) {
    return 'Commercial';
  }
  if (informationalPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) {
    return 'Informational';
  }
  if (navigationalPatterns.some(p => lowerQuery.includes(p.toLowerCase()))) {
    return 'Navigational';
  }

  // 默认分类为信息型（最常见）
  return 'Informational';
}

/**
 * 计算排名分桶
 */
function calculateRankingBuckets(data) {
  const buckets = {
    '1-3': 0,
    '4-10': 0,
    '11-30': 0,
    '31+': 0
  };

  data.forEach(item => {
    const pos = item.position;
    if (pos >= 1 && pos <= 3) {
      buckets['1-3']++;
    } else if (pos >= 4 && pos <= 10) {
      buckets['4-10']++;
    } else if (pos >= 11 && pos <= 30) {
      buckets['11-30']++;
    } else {
      buckets['31+']++;
    }
  });

  return buckets;
}

/**
 * 按意图分类数据
 */
function classifyByIntent(data) {
  return {
    Informational: data.filter(item => item.intent === 'Informational'),
    Commercial: data.filter(item => item.intent === 'Commercial'),
    Transactional: data.filter(item => item.intent === 'Transactional'),
    Navigational: data.filter(item => item.intent === 'Navigational')
  };
}

/**
 * 计算各意图类别的性能指标
 */
function calculateMetrics(allData, intentData) {
  const calculateForCategory = (items) => {
    if (items.length === 0) {
      return {
        totalClicks: 0,
        totalImpressions: 0,
        avgCtr: 0,
        avgPosition: 0
      };
    }

    const totalClicks = items.reduce((sum, item) => sum + item.clicks, 0);
    const totalImpressions = items.reduce((sum, item) => sum + item.impressions, 0);
    const avgPosition = items.reduce((sum, item) => sum + item.position, 0) / items.length;

    // CTR 加权平均
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

    return {
      totalClicks,
      totalImpressions,
      avgCtr: parseFloat((avgCtr * 100).toFixed(2)), // 转为百分比
      avgPosition: parseFloat(avgPosition.toFixed(1))
    };
  };

  return {
    Informational: calculateForCategory(intentData.Informational),
    Commercial: calculateForCategory(intentData.Commercial),
    Transactional: calculateForCategory(intentData.Transactional),
    Navigational: calculateForCategory(intentData.Navigational)
  };
}

/**
 * 生成排名趋势数据（模拟时间序列）
 */
function generateRankingTrend(data) {
  // 按排名分组统计
  const positionGroups = {};
  data.forEach(item => {
    const group = Math.floor(item.position);
    positionGroups[group] = (positionGroups[group] || 0) + 1;
  });

  // 生成连续的位置分布
  const positions = [];
  const counts = [];
  const ctrs = [];

  for (let i = 1; i <= 50; i++) {
    positions.push(i);
    const count = positionGroups[i] || 0;
    counts.push(count);

    // 该位置的平均 CTR
    const itemsAtPos = data.filter(item => Math.floor(item.position) === i);
    const avgCtr = itemsAtPos.length > 0
      ? itemsAtPos.reduce((sum, item) => sum + item.ctr, 0) / itemsAtPos.length * 100
      : 0;
    ctrs.push(parseFloat(avgCtr.toFixed(2)));
  }

  return {
    type: 'line',
    xAxis: positions,
    series: [
      {
        name: '关键词数量',
        data: counts,
        type: 'bar',
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '平均 CTR (%)',
        data: ctrs,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        itemStyle: { color: '#10b981' }
      }
    ]
  };
}

/**
 * 获取意图中文标签
 */
function getIntentLabel(intent) {
  const labels = {
    'Informational': '信息型',
    'Commercial': '商业型',
    'Transactional': '交易型',
    'Navigational': '导航型'
  };
  return labels[intent] || '其他';
}

/**
 * 获取最大值（用于雷达图刻度）
 */
function getMaxValue(metrics, key) {
  const values = [
    metrics.Informational[key],
    metrics.Commercial[key],
    metrics.Transactional[key],
    metrics.Navigational[key]
  ];
  return Math.max(...values, 1); // 至少为1避免除零
}

/**
 * 空结果返回
 */
function getEmptyResult() {
  return {
    rankingDistribution: {
      type: 'pie',
      data: [],
      total: 0,
      summary: { homepageRate: '0.0', top3Count: 0, top10Count: 0 }
    },
    intentDistribution: { type: 'bar', categories: [], data: [] },
    intentPerformance: { type: 'radar', indicator: [], series: [] },
    rankingTrend: { type: 'line', xAxis: [], series: [] },
    rawStats: {
      totalKeywords: 0,
      totalClicks: 0,
      totalImpressions: 0,
      avgCtr: '0.00',
      avgPosition: '0.0',
      rankingBuckets: { '1-3': 0, '4-10': 0, '11-30': 0, '31+': 0 },
      intentBreakdown: {}
    },
    details: []
  };
}

// 导出函数（支持 ES Module 和 CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { processGSCData };
}
if (typeof exports !== 'undefined') {
  exports.processGSCData = processGSCData;
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.GSCDataProcessor = { processGSCData };
}

export { processGSCData };
export default processGSCData;
