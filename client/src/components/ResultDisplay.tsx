import React from 'react';
import { Table, Statistic, Card, Alert, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { OptimizationResult } from '../types';

interface ResultDisplayProps {
  result: OptimizationResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
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

export default ResultDisplay;