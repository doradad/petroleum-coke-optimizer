import React, { useState } from 'react';
import { Form, InputNumber, Button, Row, Col, Divider, Alert, Progress } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Constraints } from '../types';

interface ConstraintFormProps {
  onOptimize: (constraints: Constraints) => void;
  loading: boolean;
  progress?: number;
  progressText?: string;
  elapsedTime?: number;
}

const ConstraintForm: React.FC<ConstraintFormProps> = ({ onOptimize, loading, progress = 0, progressText = '', elapsedTime = 0 }) => {
  const [form] = Form.useForm();
  const [constraints, setConstraints] = useState<Constraints>({
    sulfur: 3.0,
    ash: 0.4,
    volatile: 12.0,
    vanadium: 350
  });

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newConstraints: Constraints = {
        sulfur: values.sulfur,
        ash: values.ash,
        volatile: values.volatile,
        vanadium: values.vanadium
      };
      setConstraints(newConstraints);
      onOptimize(newConstraints);
    });
  };

  return (
    <div>
      <Alert
        message="设置质量约束条件"
        description="系统将在满足以下条件的前提下，寻找成本最低的掺配方案"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={constraints}
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sulfur"
              label="硫含量上限 (%)"
              rules={[
                { required: true, message: '请输入硫含量上限' },
                { type: 'number', min: 0.1, max: 10, message: '请输入0.1-10之间的数值' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={2}
                step={0.1}
                placeholder="如: 3.0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ash"
              label="灰分上限 (%)"
              rules={[
                { required: true, message: '请输入灰分上限' },
                { type: 'number', min: 0.1, max: 5, message: '请输入0.1-5之间的数值' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={2}
                step={0.1}
                placeholder="如: 0.4"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="volatile"
              label="挥发分上限 (%)"
              rules={[
                { required: true, message: '请输入挥发分上限' },
                { type: 'number', min: 1, max: 30, message: '请输入1-30之间的数值' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={1}
                step={0.5}
                placeholder="如: 12.0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="vanadium"
              label="钒含量上限 (ppm)"
              rules={[
                { required: true, message: '请输入钒含量上限' },
                { type: 'number', min: 50, max: 1000, message: '请输入50-1000之间的数值' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={0}
                step={10}
                placeholder="如: 350"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<ThunderboltOutlined />}
          size="large"
          className="optimization-button"
          style={{ width: '100%' }}
        >
          {loading ? '正在计算最优方案...' : '开始优化计算'}
        </Button>
        
        {loading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <Progress
                  percent={progress}
                  status="active"
                  strokeColor={{
                    '0%': '#667eea',
                    '100%': '#764ba2',
                  }}
                  format={() => progressText || '计算中...'}
                />
              </div>
              <div style={{ 
                minWidth: '60px', 
                fontSize: '12px', 
                color: '#666',
                textAlign: 'right'
              }}>
                {elapsedTime}s
              </div>
            </div>
          </div>
        )}
      </Form>

      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        <p><strong>算法说明：</strong></p>
        <p>• 采用单纯形法线性规划算法</p>
        <p>• 目标函数：最小化总成本</p>
        <p>• 约束条件：满足质量指标要求</p>
        <p>• 支持1-20种产品的任意组合</p>
      </div>
    </div>
  );
};

export default ConstraintForm;