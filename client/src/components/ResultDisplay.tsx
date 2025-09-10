import React from 'react';
import { Table, Statistic, Card, Alert, Tag, Collapse, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { OptimizationResult, Top5OptimizationResult } from '../types';
import { TrophyOutlined, CrownOutlined } from '@ant-design/icons';

interface ResultDisplayProps {
  result?: OptimizationResult | null;
  top5Results?: Top5OptimizationResult[];
  showTop5?: boolean;
}

const { Panel } = Collapse;

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, top5Results = [], showTop5 = false }) => {
  // 如果显示TOP5结果
  if (showTop5 && top5Results.length > 0) {
    return <Top5ResultsDisplay results={top5Results} />;
  }

  // 如果显示单一结果
  if (result) {
    return <SingleResultDisplay result={result} />;
  }

  return null;
};

// 单一结果显示组件
const SingleResultDisplay: React.FC<{ result: OptimizationResult }> = ({ result }) => {
  const { products, mixedProperties, totalCost, summary } = result;

  const resultColumns: ColumnsType<typeof products[0]> = [
    {
      title: '产品编号',
      dataIndex: ['product', 'name'],
      key: 'name',
      fixed: 'left',
      width: 150,
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>{name}</span>
      )
    },
    {
      title: '掺配比例',
      dataIndex: 'ratio',
      key: 'ratio',
      align: 'center',
      width: 120,
      render: (ratio: number) => (
        <span style={{ 
          fontWeight: 600, 
          fontSize: '14px',
          color: '#1890ff',
          backgroundColor: '#f0f8ff',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9'
        }}>
          {(ratio * 100).toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => b.ratio - a.ratio
    },
    {
      title: 'S(%)',
      dataIndex: ['product', 'sulfur'],
      key: 'sulfur',
      align: 'center',
      width: 80,
      render: (value: number) => value.toFixed(1)
    },
    {
      title: 'A(%)',
      dataIndex: ['product', 'ash'],
      key: 'ash',
      align: 'center',
      width: 80,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'V(%)',
      dataIndex: ['product', 'volatile'],
      key: 'volatile',
      align: 'center',
      width: 80,
      render: (value: number) => value.toFixed(1)
    },
    {
      title: '钒含量(ppm)',
      dataIndex: ['product', 'vanadium'],
      key: 'vanadium',
      align: 'center',
      width: 100,
      render: (value: number) => value.toFixed(0)
    },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      key: 'price',
      align: 'right',
      width: 100,
      render: (value: number) => `¥${value.toLocaleString()}`
    },
    {
      title: '成本贡献',
      key: 'contribution',
      align: 'right',
      width: 120,
      render: (_, record) => {
        const contribution = record.product.price * record.ratio;
        return (
          <span style={{ fontWeight: 600, color: '#fa8c16' }}>
            ¥{contribution.toFixed(2)}
          </span>
        );
      }
    }
  ];

  const allConstraintsSatisfied = Object.values(summary.constraintsSatisfied).every(Boolean);

  return (
    <div className="result-section">
      {/* 约束满足情况提示 */}
      <Alert
        message={allConstraintsSatisfied ? "✅ 所有约束条件均已满足" : "⚠️ 部分约束条件未满足"}
        type={allConstraintsSatisfied ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
        description={
          !allConstraintsSatisfied && (
            <div>
              约束检查：
              {Object.entries(summary.constraintsSatisfied).map(([key, satisfied]) => (
                <Tag key={key} color={satisfied ? 'success' : 'error'} style={{ margin: '0 4px 4px 0' }}>
                  {key}: {satisfied ? '✓' : '✗'}
                </Tag>
              ))}
            </div>
          )
        }
      />

      {/* 结果汇总 */}
      <div className="result-summary">
        <Card size="small" className="summary-card">
          <Statistic
            title="混合成本"
            value={totalCost}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#fff', fontSize: '20px' }}
          />
        </Card>
        <Card size="small" className="summary-card">
          <Statistic
            title="产品数量"
            value={summary.productCount}
            suffix="种"
            valueStyle={{ color: '#fff', fontSize: '20px' }}
          />
        </Card>
        <Card size="small" className="summary-card">
          <Statistic
            title="硫含量"
            value={mixedProperties.sulfur}
            precision={2}
            suffix="%"
            valueStyle={{ color: '#fff', fontSize: '20px' }}
          />
        </Card>
        <Card size="small" className="summary-card">
          <Statistic
            title="灰分"
            value={mixedProperties.ash}
            precision={3}
            suffix="%"
            valueStyle={{ color: '#fff', fontSize: '20px' }}
          />
        </Card>
        <Card size="small" className="summary-card">
          <Statistic
            title="挥发分"
            value={mixedProperties.volatile}
            precision={2}
            suffix="%"
            valueStyle={{ color: '#fff', fontSize: '20px' }}
          />
        </Card>
        <Card size="small" className="summary-card">
          <Statistic
            title="钒含量"
            value={mixedProperties.vanadium}
            precision={1}
            suffix="ppm"
            valueStyle={{ color: '#fff', fontSize: '20px' }}
          />
        </Card>
      </div>

      {/* 详细掺配方案 */}
      <Card 
        title="详细掺配方案" 
        size="small" 
        style={{ marginTop: 16 }}
        extra={
          <span style={{ color: '#666', fontSize: '12px' }}>
            总比例: {(summary.totalRatio * 100).toFixed(1)}%
          </span>
        }
      >
        <Table
          columns={resultColumns}
          dataSource={products}
          rowKey={record => record.product.id}
          size="small"
          pagination={false}
          scroll={{ x: 800 }}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                <Table.Summary.Cell index={0}>混合结果</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">100.0%</Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">{mixedProperties.sulfur}</Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">{mixedProperties.ash}</Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">{mixedProperties.volatile}</Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">{mixedProperties.vanadium}</Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">-</Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right">
                  <span style={{ color: '#fa8c16' }}>¥{totalCost.toFixed(2)}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

// TOP5结果显示组件
const Top5ResultsDisplay: React.FC<{ results: Top5OptimizationResult[] }> = ({ results }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#ffd700' }} />;
    if (rank <= 3) return <TrophyOutlined style={{ color: '#c0c0c0' }} />;
    return <Badge count={rank} />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#666';
  };

  return (
    <div className="top5-results">
      {/* 方案汇总卡片 */}
      <div style={{ marginBottom: 16 }}>
        <Alert
          message={`✨ 已生成 ${results.length} 个优化方案，按成本从低到高排序`}
          type="success"
          showIcon
          banner
        />
      </div>

      {/* TOP5方案折叠面板 */}
      <Collapse 
        defaultActiveKey={['1']} 
        size="small"
        style={{ background: 'transparent' }}
      >
        {results.map((item) => {
          const { rank, result } = item;
          const { products, mixedProperties, totalCost, summary } = result;
          const allConstraintsSatisfied = Object.values(summary.constraintsSatisfied).every(Boolean);

          return (
            <Panel
              key={rank}
              header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getRankIcon(rank)}
                    <span style={{ 
                      fontWeight: rank <= 3 ? 'bold' : 'normal',
                      color: getRankColor(rank),
                      fontSize: rank === 1 ? '16px' : '14px'
                    }}>
                      方案 {rank} {rank === 1 ? '(最优)' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '24px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#fa8c16',
                      fontSize: rank === 1 ? '16px' : '14px'
                    }}>
                      总成本: ¥{totalCost.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {summary.productCount} 种产品
                    </span>
                    <Tag color={allConstraintsSatisfied ? 'success' : 'warning'}>
                      {allConstraintsSatisfied ? '✓ 满足约束' : '⚠ 部分约束'}
                    </Tag>
                  </div>
                </div>
              }
              style={{
                marginBottom: '8px',
                border: rank === 1 ? '2px solid #ffd700' : rank <= 3 ? '1px solid #d9d9d9' : '1px solid #f0f0f0',
                borderRadius: '6px',
                background: rank === 1 ? '#fffbf0' : 'white'
              }}
            >
              <SingleResultContent 
                products={products}
                mixedProperties={mixedProperties}
                totalCost={totalCost}
                summary={summary}
                isTop5={true}
              />
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

// 提取的单一结果内容组件
const SingleResultContent: React.FC<{
  products: any[];
  mixedProperties: any;
  totalCost: number;
  summary: any;
  isTop5?: boolean;
}> = ({ products, mixedProperties, totalCost, summary, isTop5 = false }) => {
  const resultColumns: ColumnsType<typeof products[0]> = [
    {
      title: '产品编号',
      dataIndex: ['product', 'name'],
      key: 'name',
      fixed: 'left',
      width: 120,
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#1890ff', fontSize: '12px' }}>{name}</span>
      )
    },
    {
      title: '掺配比例',
      dataIndex: 'ratio',
      key: 'ratio',
      align: 'center',
      width: 100,
      render: (ratio: number) => (
        <span style={{ 
          fontWeight: 600, 
          fontSize: '12px',
          color: '#1890ff',
          backgroundColor: '#f0f8ff',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9'
        }}>
          {(ratio * 100).toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => b.ratio - a.ratio
    },
    {
      title: 'S(%)',
      dataIndex: ['product', 'sulfur'],
      key: 'sulfur',
      align: 'center',
      width: 60,
      render: (value: number) => <span style={{ fontSize: '12px' }}>{value.toFixed(1)}</span>
    },
    {
      title: 'A(%)',
      dataIndex: ['product', 'ash'],
      key: 'ash',
      align: 'center',
      width: 60,
      render: (value: number) => <span style={{ fontSize: '12px' }}>{value.toFixed(2)}</span>
    },
    {
      title: 'V(%)',
      dataIndex: ['product', 'volatile'],
      key: 'volatile',
      align: 'center',
      width: 60,
      render: (value: number) => <span style={{ fontSize: '12px' }}>{value.toFixed(1)}</span>
    },
    {
      title: '钒(ppm)',
      dataIndex: ['product', 'vanadium'],
      key: 'vanadium',
      align: 'center',
      width: 70,
      render: (value: number) => <span style={{ fontSize: '12px' }}>{value.toFixed(0)}</span>
    },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      key: 'price',
      align: 'right',
      width: 80,
      render: (value: number) => <span style={{ fontSize: '12px' }}>¥{value.toLocaleString()}</span>
    },
    {
      title: '成本贡献',
      key: 'contribution',
      align: 'right',
      width: 90,
      render: (_, record) => {
        const contribution = record.product.price * record.ratio;
        return (
          <span style={{ fontWeight: 600, color: '#fa8c16', fontSize: '12px' }}>
            ¥{contribution.toFixed(2)}
          </span>
        );
      }
    }
  ];

  const allConstraintsSatisfied = Object.values(summary.constraintsSatisfied).every(Boolean);

  return (
    <div>
      {/* 混合结果汇总 */}
      <div className="result-summary" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Card size="small" style={{ minWidth: '120px', background: '#f6f8fa' }}>
            <Statistic
              title="混合成本"
              value={totalCost}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fa8c16', fontSize: isTop5 ? '14px' : '16px' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '100px', background: '#f6f8fa' }}>
            <Statistic
              title="产品数量"
              value={summary.productCount}
              suffix="种"
              valueStyle={{ color: '#1890ff', fontSize: isTop5 ? '14px' : '16px' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '80px', background: '#f6f8fa' }}>
            <Statistic
              title="硫含量"
              value={mixedProperties.sulfur}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a', fontSize: isTop5 ? '12px' : '14px' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '80px', background: '#f6f8fa' }}>
            <Statistic
              title="灰分"
              value={mixedProperties.ash}
              precision={3}
              suffix="%"
              valueStyle={{ color: '#722ed1', fontSize: isTop5 ? '12px' : '14px' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '80px', background: '#f6f8fa' }}>
            <Statistic
              title="挥发分"
              value={mixedProperties.volatile}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#13c2c2', fontSize: isTop5 ? '12px' : '14px' }}
            />
          </Card>
          <Card size="small" style={{ minWidth: '80px', background: '#f6f8fa' }}>
            <Statistic
              title="钒含量"
              value={mixedProperties.vanadium}
              precision={1}
              suffix="ppm"
              valueStyle={{ color: '#eb2f96', fontSize: isTop5 ? '12px' : '14px' }}
            />
          </Card>
        </div>
      </div>

      {/* 约束满足情况 */}
      {!allConstraintsSatisfied && (
        <Alert
          message="⚠️ 部分约束条件未满足"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          description={
            <div>
              约束检查：
              {Object.entries(summary.constraintsSatisfied).map(([key, satisfied]) => (
                <Tag key={key} color={satisfied ? 'success' : 'error'} style={{ margin: '0 4px 4px 0' }}>
                  {key}: {satisfied ? '✓' : '✗'}
                </Tag>
              ))}
            </div>
          }
        />
      )}

      {/* 详细掺配表格 */}
      <Table
        columns={resultColumns}
        dataSource={products}
        rowKey={record => record.product.id}
        size="small"
        pagination={false}
        scroll={{ x: 600 }}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
              <Table.Summary.Cell index={0}><span style={{ fontSize: '12px' }}>混合结果</span></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="center"><span style={{ fontSize: '12px' }}>100.0%</span></Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="center"><span style={{ fontSize: '12px' }}>{mixedProperties.sulfur}</span></Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="center"><span style={{ fontSize: '12px' }}>{mixedProperties.ash}</span></Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="center"><span style={{ fontSize: '12px' }}>{mixedProperties.volatile}</span></Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="center"><span style={{ fontSize: '12px' }}>{mixedProperties.vanadium}</span></Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right"><span style={{ fontSize: '12px' }}>-</span></Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <span style={{ color: '#fa8c16', fontSize: '12px', fontWeight: 'bold' }}>¥{totalCost.toFixed(2)}</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
};

export default ResultDisplay;