import { useState, useCallback } from 'react';
import { Layout, Card, Row, Col, message } from 'antd';
import { 
  CloudUploadOutlined, 
  SettingOutlined, 
  BarChartOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import UploadSection from './components/UploadSection';
import ConstraintForm from './components/ConstraintForm';
import ResultDisplay from './components/ResultDisplay';
import ProductTable from './components/ProductTable';
import { Product, Constraints, OptimizationResult } from './types';

const { Header, Content } = Layout;

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleProductsUploaded = useCallback((uploadedProducts: Product[]) => {
    setProducts(uploadedProducts);
    setResult(null); // 清除之前的结果
    message.success(`成功导入 ${uploadedProducts.length} 个产品`);
  }, []);

  const handleOptimize = useCallback(async (constraints: Constraints) => {
    if (products.length === 0) {
      message.error('请先上传产品清单');
      return;
    }

    setLoading(true);
    setProgress(0);
    setProgressText('初始化优化算法...');
    setElapsedTime(0);
    const startTime = Date.now();
    
    // 计时器更新
    const timeInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // 进度更新（更快的进度条）
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newProgress = Math.min(prev + Math.random() * 20, 90);
        
        if (elapsed < 5) {
          setProgressText('搜索单产品解...');
        } else if (elapsed < 10) {
          setProgressText('搜索两产品组合...');
        } else if (elapsed < 20) {
          setProgressText('搜索三产品组合...');
        } else {
          setProgressText('完成优化计算...');
        }
        return newProgress;
      });
    }, 500);  // 更快的更新频率

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ constraints }),
      });

      const data = await response.json();
      
      clearInterval(progressInterval);
      clearInterval(timeInterval);
      setProgress(100);
      setProgressText('计算完成！');

      if (data.success) {
        setResult(data.result);
        message.success('优化计算完成！');
      } else {
        message.error(data.error || '优化计算失败');
        if (data.violations) {
          data.violations.forEach((violation: string) => {
            message.warning(violation);
          });
        }
      }
    } catch (error) {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
      console.error('优化请求失败:', error);
      message.error('服务器连接失败，请检查网络');
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressText('');
      setElapsedTime(0);
    }
  }, [products]);

  return (
    <Layout className="main-container">
      <Header className="header">
        <h1>石油焦掺配优化系统</h1>
        <div className="subtitle">
          基于线性规划算法，实现成本最优的石油焦掺配方案
        </div>
      </Header>

      <Content>
        <Row gutter={[24, 24]}>
          {/* 上传区域 */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <span>
                  <CloudUploadOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  产品清单导入
                </span>
              }
              className="content-card"
              size="small"
            >
              <UploadSection onProductsUploaded={handleProductsUploaded} />
            </Card>
          </Col>

          {/* 约束条件 */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <span>
                  <SettingOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  目标约束条件
                </span>
              }
              className="content-card"
              size="small"
            >
              <ConstraintForm 
                onOptimize={handleOptimize} 
                loading={loading}
                progress={progress}
                progressText={progressText}
                elapsedTime={elapsedTime}
              />
            </Card>
          </Col>

          {/* 产品列表 */}
          {products.length > 0 && (
            <Col xs={24}>
              <Card 
                title={
                  <span>
                    <FileExcelOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                    产品清单 ({products.length} 个产品)
                  </span>
                }
                className="content-card"
                size="small"
              >
                <ProductTable products={products} />
              </Card>
            </Col>
          )}

          {/* 优化结果 */}
          {result && (
            <Col xs={24}>
              <Card 
                title={
                  <span>
                    <BarChartOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    优化结果
                  </span>
                }
                className="content-card"
                size="small"
              >
                <ResultDisplay result={result} />
              </Card>
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
}

export default App;