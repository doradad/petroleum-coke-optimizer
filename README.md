# 石油焦掺配优化系统

一个基于线性规划算法的石油焦掺配优化系统，帮助用户在满足质量约束的前提下找到成本最低的掺配方案。

## 🚀 功能特性

- **Excel数据导入**: 支持批量导入产品清单
- **智能优化算法**: 基于单纯形法线性规划算法
- **实时计算**: 快速计算最优掺配比例
- **可视化结果**: 直观展示优化结果和质量参数
- **约束检查**: 自动验证约束条件可行性
- **响应式设计**: 支持桌面和移动设备访问

## 📋 系统要求

- Node.js >= 16.0.0
- NPM >= 8.0.0

## 🛠️ 安装与启动

### 1. 克隆项目并安装依赖
```bash
cd petroleum-coke-optimizer
npm run install:all
```

### 2. 启动开发环境
```bash
npm run dev
```

系统将在以下地址启动：
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

### 3. 生产环境部署
```bash
npm run build
npm start
```

## 📊 使用方法

### 1. 准备数据
下载Excel模板并填入产品数据：
- 产品编号
- S(%) - 硫含量百分比
- A(%) - 灰分百分比  
- V(%) - 挥发分百分比
- 钒含量(ppm) - 钒含量ppm值
- 价格 - 产品价格

### 2. 导入数据
点击"下载Excel模板"获取标准格式，然后拖拽或点击上传Excel文件。

### 3. 设置约束条件
在约束条件面板设置质量指标上限：
- 硫含量上限 (%)
- 灰分上限 (%)
- 挥发分上限 (%)
- 钒含量上限 (ppm)

### 4. 执行优化
点击"开始优化计算"按钮，系统将自动计算最优掺配方案。

### 5. 查看结果
系统将展示：
- 最优掺配比例
- 混合后的质量参数
- 总成本
- 约束满足情况

## 🔬 算法原理

系统采用线性规划中的**单纯形法**求解优化问题：

### 目标函数
最小化总成本：`Min Z = Σ(pi × wi)`

### 约束条件
- 比例约束：`Σwi = 1`
- 硫含量约束：`Σ(Si × wi) ≤ S_max`
- 灰分约束：`Σ(Ai × wi) ≤ A_max`
- 挥发分约束：`Σ(Vi × wi) ≤ V_max`
- 钒含量约束：`Σ(Pi × wi) ≤ P_max`
- 非负约束：`wi ≥ 0`

其中：
- `wi` = 第i个产品的掺配比例
- `pi` = 第i个产品的价格
- `Si, Ai, Vi, Pi` = 第i个产品的质量指标

## 🏗️ 技术架构

### 前端技术栈
- **React 18**: 用户界面框架
- **TypeScript**: 类型安全的JavaScript
- **Ant Design**: UI组件库
- **Vite**: 构建工具

### 后端技术栈
- **Node.js + Express**: 服务端框架
- **TypeScript**: 服务端开发语言
- **SQLite**: 轻量级数据库
- **SheetJS**: Excel文件处理

### 算法实现
- **ml-matrix**: 矩阵运算库
- **自实现单纯形法**: 线性规划求解器

## 📁 项目结构

```
petroleum-coke-optimizer/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── types/         # TypeScript类型定义
│   │   └── App.tsx        # 主应用组件
│   └── package.json
├── server/                # 后端代码
│   ├── src/
│   │   ├── database/      # 数据库操作
│   │   ├── optimizer/     # 优化算法
│   │   ├── routes/        # API路由
│   │   └── types/         # 类型定义
│   └── package.json
└── package.json          # 项目根配置
```

## 🔧 API接口

### 上传产品清单
```http
POST /api/upload
Content-Type: multipart/form-data
```

### 下载Excel模板
```http
GET /api/template
```

### 执行优化计算
```http
POST /api/optimize
Content-Type: application/json

{
  "constraints": {
    "sulfur": 3.0,
    "ash": 0.4,
    "volatile": 12.0,
    "vanadium": 350
  }
}
```

### 获取产品列表
```http
GET /api/products
```

## 🎯 使用示例

假设有5种石油焦产品，约束条件为：
- S(%) < 3%
- A(%) < 0.4%
- V(%) < 12%
- 钒含量 < 350 ppm

系统将计算出满足约束且成本最低的掺配方案，例如：
- 产品A: 30%
- 产品C: 45%
- 产品E: 25%

## 📈 性能特点

- **快速计算**: 支持20+产品的实时优化
- **内存高效**: 使用SQLite内存数据库
- **算法稳定**: 经过测试验证的单纯形法实现
- **扩展性好**: 支持更多约束条件扩展

## 🤝 技术支持

如有问题或建议，请联系开发团队。

## 📄 许可证

本项目遵循 MIT 许可证。