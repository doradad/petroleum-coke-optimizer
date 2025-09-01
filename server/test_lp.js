// 测试线性规划算法
const { LinearProgrammingOptimizer } = require('./dist/optimizer/linearProgrammingOptimizer');

const products = [
  { id: '1', name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { id: '2', name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { id: '3', name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { id: '4', name: '石油焦D', sulfur: 4.0, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { id: '5', name: '石油焦E', sulfur: 2.0, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 3, ash: 0.4, volatile: 12, vanadium: 350 };

console.log('测试线性规划算法:');
console.log('产品数据:', products);
console.log('约束条件:', constraints);

try {
  const optimizer = new LinearProgrammingOptimizer();
  const result = optimizer.optimize(products, constraints);
  
  console.log('\n优化结果:');
  console.log('可行解:', result.feasible);
  console.log('总成本:', result.totalCost);
  console.log('产品组合:', result.products.map(p => ({
    name: p.product.name,
    ratio: p.ratio,
    price: p.product.price
  })));
  console.log('混合属性:', result.mixedProperties);
} catch (error) {
  console.error('测试失败:', error);
}