import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Product } from '../types';

interface ProductTableProps {
  products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 添加调试信息
  useEffect(() => {
    console.log(`当前页面大小: ${currentPageSize}, 当前页码: ${currentPage}`);
  }, [currentPageSize, currentPage]);

  // 强制修复分页控件交互问题
  useEffect(() => {
    const fixPagination = () => {
      // 移除所有可能阻止交互的CSS属性
      const resetStyle = (el: HTMLElement) => {
        el.style.pointerEvents = 'auto';
        el.style.userSelect = 'auto';
        el.style.touchAction = 'auto';
        el.style.zIndex = '9999';
        el.style.position = 'relative';
      };
      
      // 修复分页选择器
      const paginationSelects = document.querySelectorAll('.product-table-pagination .ant-select');
      paginationSelects.forEach(el => resetStyle(el as HTMLElement));
      
      // 修复选择器箭头
      const arrows = document.querySelectorAll('.product-table-pagination .ant-select-arrow');
      arrows.forEach(el => resetStyle(el as HTMLElement));
      
      // 专门修复"显示多条"的选择器
      const sizeChangers = document.querySelectorAll('.product-table-pagination .ant-pagination-options-size-changer');
      sizeChangers.forEach(sizeChanger => {
        const element = sizeChanger as HTMLElement;
        resetStyle(element);
        
        // 修复内部的选择器
        const select = sizeChanger.querySelector('.ant-select') as HTMLElement;
        if (select) {
          resetStyle(select);
          select.style.display = 'inline-block';
          select.style.cursor = 'pointer';
          
          // 修复选择器的各个部分
          const selector = select.querySelector('.ant-select-selector') as HTMLElement;
          if (selector) {
            resetStyle(selector);
            selector.style.cursor = 'pointer';
            selector.style.background = 'white';
            selector.style.border = '1px solid #d9d9d9';
            
            // 简化处理：只确保样式正确，让Ant Design自身机制工作
            console.log('页面大小选择器样式已修复');
          }
          
          // 修复箭头
          const arrow = select.querySelector('.ant-select-arrow') as HTMLElement;
          if (arrow) {
            resetStyle(arrow);
            arrow.style.cursor = 'pointer';
          }
        }
      });
      
      // 修复页码跳转输入框
      const inputs = document.querySelectorAll('.product-table-pagination .ant-pagination-options-quick-jumper input');
      inputs.forEach(el => {
        const element = el as HTMLElement;
        resetStyle(element);
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('页码输入框被点击');
        }, true);
      });
      
      // 修复下拉菜单
      const dropdowns = document.querySelectorAll('.ant-select-dropdown');
      dropdowns.forEach(el => {
        const element = el as HTMLElement;
        element.style.zIndex = '999999';
        element.style.position = 'fixed';
        element.style.pointerEvents = 'auto';
      });
    };
    
    // 多次执行修复，确保生效
    setTimeout(fixPagination, 100);
    setTimeout(fixPagination, 500);
    setTimeout(fixPagination, 1000);
    
    // 监听DOM变化持续修复
    const observer = new MutationObserver(() => {
      setTimeout(fixPagination, 50);
    });
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => observer.disconnect();
  }, [products]);

  const columns: ColumnsType<Product> = [
    {
      title: '产品编号',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150,
      render: (name: string) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>{name}</span>
      )
    },
    {
      title: 'S(%)',
      dataIndex: 'sulfur',
      key: 'sulfur',
      align: 'center',
      width: 80,
      render: (value: number) => (
        <Tag color={value > 3 ? 'red' : value > 2 ? 'orange' : 'green'}>
          {value.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.sulfur - b.sulfur
    },
    {
      title: 'A(%)',
      dataIndex: 'ash',
      key: 'ash',
      align: 'center',
      width: 80,
      render: (value: number) => (
        <Tag color={value > 0.5 ? 'red' : value > 0.3 ? 'orange' : 'green'}>
          {value.toFixed(2)}
        </Tag>
      ),
      sorter: (a, b) => a.ash - b.ash
    },
    {
      title: 'V(%)',
      dataIndex: 'volatile',
      key: 'volatile',
      align: 'center',
      width: 80,
      render: (value: number) => (
        <Tag color={value > 15 ? 'red' : value > 10 ? 'orange' : 'green'}>
          {value.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.volatile - b.volatile
    },
    {
      title: '钒含量(ppm)',
      dataIndex: 'vanadium',
      key: 'vanadium',
      align: 'center',
      width: 120,
      render: (value: number) => (
        <Tag color={value > 400 ? 'red' : value > 300 ? 'orange' : 'green'}>
          {value.toFixed(0)}
        </Tag>
      ),
      sorter: (a, b) => a.vanadium - b.vanadium
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 100,
      render: (value: number) => (
        <span style={{ fontWeight: 600, color: '#fa8c16' }}>
          ¥{value.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.price - b.price
    }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        size="small"
        pagination={{
          current: currentPage,
          pageSize: currentPageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个产品`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            console.log('分页变化:', page, pageSize);
            setCurrentPage(page);
            if (pageSize && pageSize !== currentPageSize) {
              setCurrentPageSize(pageSize);
              setCurrentPage(1); // 重置到第一页
            }
          },
          onShowSizeChange: (current, size) => {
            console.log('页面大小变化:', current, size);
            setCurrentPageSize(size);
            setCurrentPage(current);
          },
          className: 'product-table-pagination'
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default ProductTable;