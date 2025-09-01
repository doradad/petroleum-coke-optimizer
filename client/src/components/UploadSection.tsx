import React, { useState } from 'react';
import { Upload, Button, message, Alert, Spin } from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { Product } from '../types';

const { Dragger } = Upload;

interface UploadSectionProps {
  onProductsUploaded: (products: Product[]) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onProductsUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // 获取完整的产品列表
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        
        if (productsData.success) {
          onProductsUploaded(productsData.products);
        }

        if (data.errors && data.errors.length > 0) {
          message.warning(`导入成功，但有${data.errors.length}个警告`);
          data.errors.slice(0, 3).forEach((error: string) => {
            message.warning(error, 3);
          });
        }
      } else {
        message.error(data.error || '文件上传失败');
        if (data.errors) {
          data.errors.slice(0, 3).forEach((error: string) => {
            message.error(error, 3);
          });
        }
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '石油焦产品清单模板.xlsx';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        message.success('模板下载成功');
      } else {
        const errorData = await response.json().catch(() => ({}));
        message.error(`模板下载失败: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('下载模板失败:', error);
      message.error('网络错误，请检查连接后重试');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file: File) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel';
      
      if (!isExcel) {
        message.error('只能上传Excel文件！');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('文件大小不能超过5MB！');
        return false;
      }

      handleUpload(file);
      return false; // 阻止自动上传
    },
  };

  return (
    <Spin spinning={uploading} tip="正在解析Excel文件...">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="dashed"
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          style={{ width: '100%', marginBottom: 16 }}
        >
          下载Excel模板
        </Button>
      </div>

      <Dragger {...uploadProps} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: '#1890ff', fontSize: 48 }} />
        </p>
        <p className="ant-upload-text">
          点击或拖拽Excel文件到此区域上传
        </p>
        <p className="ant-upload-hint">
          支持单个Excel文件上传，文件大小不超过5MB
        </p>
      </Dragger>

      <Alert
        message="Excel格式要求"
        description={
          <div>
            <p>请确保Excel包含以下列：</p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>产品编号</li>
              <li>S(%) - 硫含量百分比</li>
              <li>A(%) - 灰分百分比</li>
              <li>V(%) - 挥发分百分比</li>
              <li>钒含量(ppm) - 钒含量ppm值</li>
              <li>价格 - 产品价格</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Spin>
  );
};

export default UploadSection;