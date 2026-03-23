/**
 * GSC Data Processor 使用示例
 * 展示如何在 Next.js / React 项目中使用该处理器
 */

import { processGSCData } from './gscDataProcessor';

// ============================================
// 示例 1: 基础用法
// ============================================

// 模拟从 GSC 导出的 CSV 数据（经过解析后的数组）
const sampleCSVData = [
  {
    Query: '女傭中介流程',
    Position: '2.5',
    Clicks: '45',
    Impressions: '1200',
    CTR: '0.0375'
  },
  {
    Query: '印傭點樣請',
    Position: '4.2',
    Clicks: '32',
    Impressions: '890',
    CTR: '0.036'
  },
  {
    Query: '女傭中介邊間好',
    Position: '6.8',
    Clicks: '28',
    Impressions: '2100',
    CTR: '0.013'
  },
  {
    Query: '請工人姐姐價錢',
    Position: '3.1',
    Clicks: '67',
    Impressions: '1850',
    CTR: '0.036'
  },
  {
    Query: 'maidinhk 評價',
    Position: '1.2',
    Clicks: '89',
    Impressions: '2300',
    CTR: '0.039'
  },
  {
    Query: '外傭續約手續',
    Position: '8.5',
    Clicks: '15',
    Impressions: '560',
    CTR: '0.027'
  },
  {
    Query: '菲傭 vs 印傭 比較',
    Position: '5.3',
    Clicks: '41',
    Impressions: '1450',
    CTR: '0.028'
  },
  {
    Query: '預約女傭面試',
    Position: '12.4',
    Clicks: '8',
    Impressions: '320',
    CTR: '0.025'
  }
];

// 处理数据
const result = processGSCData(sampleCSVData);

console.log('处理结果:', result);

// ============================================
// 示例 2: 在 React 组件中使用（ECharts）
// ============================================

/*
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { processGSCData } from '@/lib/gscDataProcessor';

function GSCDashboard() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 从 API 获取 CSV 数据
    fetch('/api/gsc-data')
      .then(res => res.json())
      .then(data => {
        const processed = processGSCData(data);
        setChartData(processed);
      });
  }, []);

  if (!chartData) return <div>Loading...</div>;

  // 排名分布饼图配置
  const rankingPieOption = {
    title: { text: '关键词排名分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: true, formatter: '{b}\n{c}个 ({d}%)' },
      data: chartData.rankingDistribution.data
    }]
  };

  // 意图分布柱状图配置
  const intentBarOption = {
    title: { text: '搜索意图分布与性能', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: chartData.intentDistribution.categories },
    yAxis: [
      { type: 'value', name: '关键词数' },
      { type: 'value', name: 'CTR (%)', min: 0, max: 10 }
    ],
    series: [
      {
        name: '关键词数',
        type: 'bar',
        data: chartData.intentDistribution.data.map(d => d.value)
      },
      {
        name: '平均 CTR',
        type: 'line',
        yAxisIndex: 1,
        data: chartData.intentDistribution.data.map(d => d.ctr)
      }
    ]
  };

  return (
    <div>
      <ReactECharts option={rankingPieOption} style={{ height: 400 }} />
      <ReactECharts option={intentBarOption} style={{ height: 400 }} />
      
      {/* 数据表格 */}
      <table>
        <thead>
          <tr>
            <th>关键词</th>
            <th>排名</th>
            <th>点击</th>
            <th>CTR</th>
            <th>意图</th>
          </tr>
        </thead>
        <tbody>
          {chartData.details.map(row => (
            <tr key={row.query}>
              <td>{row.query}</td>
              <td>{row.position}</td>
              <td>{row.clicks}</td>
              <td>{row.ctr}%</td>
              <td>{row.intentLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/

// ============================================
// 示例 3: 在 React 组件中使用（Recharts）
// ============================================

/*
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function GSCRechartsDashboard({ csvData }) {
  const data = processGSCData(csvData);

  return (
    <div>
      {/* 排名分布饼图 */}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data.rankingDistribution.data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.rankingDistribution.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.itemStyle.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* 意图分布柱状图 */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.intentDistribution.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" name="关键词数">
            {data.intentDistribution.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.itemStyle.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
*/

// ============================================
// 示例 4: CSV 解析 + 数据处理组合使用
// ============================================

/*
import Papa from 'papaparse';
import { processGSCData } from '@/lib/gscDataProcessor';

// 处理上传的 CSV 文件
function handleCSVUpload(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = processGSCData(results.data);
          resolve(processed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

// 使用示例
const fileInput = document.getElementById('csv-upload');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const data = await handleCSVUpload(file);
  console.log('处理完成:', data);
});
*/

// ============================================
// 示例 5: API 路由中使用（Next.js）
// ============================================

/*
// app/api/gsc-analyze/route.js
import { NextResponse } from 'next/server';
import { processGSCData } from '@/lib/gscDataProcessor';

export async function POST(request) {
  try {
    const body = await request.json();
    const { csvData } = body;

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { error: '无效的 CSV 数据' },
        { status: 400 }
      );
    }

    const result = processGSCData(csvData);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
*/

// ============================================
// 输出示例数据结构
// ============================================

console.log('\n========== 输出数据结构示例 ==========\n');

console.log('1. 排名分布 (适合饼图):');
console.log(JSON.stringify(result.rankingDistribution, null, 2));

console.log('\n2. 意图分布 (适合柱状图):');
console.log(JSON.stringify(result.intentDistribution, null, 2));

console.log('\n3. 原始统计:');
console.log(JSON.stringify(result.rawStats, null, 2));

export { sampleCSVData, result };
