// 用实际的20产品数据测试
const { LinearProgrammingOptimizer } = require('./dist/optimizer/linearProgrammingOptimizer');

// 模拟20个产品数据（基于之前看到的产品名称）
const products = [
  { id: '1', name: '滨州-京博', sulfur: 2.5, ash: 0.2, volatile: 9.5, vanadium: 600, price: 2268 },
  { id: '2', name: '东营-万通', sulfur: 3.0, ash: 0.5, volatile: 12, vanadium: 370, price: 2350 },
  { id: '3', name: '东营-联合', sulfur: 1.99, ash: 0.2, volatile: 9, vanadium: 210, price: 2973 },
  { id: '4', name: '产品D', sulfur: 2.8, ash: 0.35, volatile: 11, vanadium: 320, price: 2500 },
  { id: '5', name: '产品E', sulfur: 2.2, ash: 0.3, volatile: 10.5, vanadium: 280, price: 2600 },
  { id: '6', name: '产品F', sulfur: 3.1, ash: 0.4, volatile: 11.8, vanadium: 340, price: 2400 },
  { id: '7', name: '产品G', sulfur: 1.8, ash: 0.25, volatile: 9.2, vanadium: 250, price: 2700 },
  { id: '8', name: '产品H', sulfur: 2.6, ash: 0.32, volatile: 10.8, vanadium: 300, price: 2550 },
  { id: '9', name: '产品I', sulfur: 2.9, ash: 0.38, volatile: 11.5, vanadium: 330, price: 2450 },
  { id: '10', name: '产品J', sulfur: 2.1, ash: 0.28, volatile: 9.8, vanadium: 270, price: 2800 },
  { id: '11', name: '产品K', sulfur: 3.2, ash: 0.42, volatile: 12.2, vanadium: 360, price: 2300 }, // 很便宜但约束紧
  { id: '12', name: '产品L', sulfur: 1.7, ash: 0.18, volatile: 8.8, vanadium: 230, price: 2900 },
  { id: '13', name: '产品M', sulfur: 2.4, ash: 0.31, volatile: 10.2, vanadium: 290, price: 2650 },
  { id: '14', name: '产品N', sulfur: 2.7, ash: 0.36, volatile: 11.2, vanadium: 310, price: 2480 },
  { id: '15', name: '产品O', sulfur: 1.9, ash: 0.22, volatile: 9.4, vanadium: 240, price: 2750 },
  { id: '16', name: '产品P', sulfur: 3.0, ash: 0.39, volatile: 11.9, vanadium: 350, price: 2420 },
  { id: '17', name: '产品Q', sulfur: 2.3, ash: 0.29, volatile: 10.1, vanadium: 280, price: 2580 },
  { id: '18', name: '产品R', sulfur: 2.8, ash: 0.34, volatile: 11.3, vanadium: 320, price: 2520 },
  { id: '19', name: '产品S', sulfur: 2.0, ash: 0.24, volatile: 9.6, vanadium: 260, price: 2680 },
  { id: '20', name: '产品T', sulfur: 2.9, ash: 0.37, volatile: 11.7, vanadium: 340, price: 2460 }
];

const constraints = { sulfur: 3, ash: 0.4, volatile: 12, vanadium: 350 };

console.log('使用模拟的20产品数据测试线性规划:');
console.log('约束条件:', constraints);
console.log('');

// 先检查可行的单产品解
console.log('单产品可行性检查:');
const feasibleSingle = [];
products.forEach(p => {
  const feasible = p.sulfur <= constraints.sulfur && p.ash <= constraints.ash && 
                   p.volatile <= constraints.volatile && p.vanadium <= constraints.vanadium;
  if (feasible) {
    feasibleSingle.push({name: p.name, price: p.price});
  }
});

feasibleSingle.sort((a, b) => a.price - b.price);
console.log('可行的单产品解（按价格排序）:');
feasibleSingle.forEach(p => console.log(`  ${p.name}: ${p.price}`));
console.log('');

try {
  const optimizer = new LinearProgrammingOptimizer();
  const result = optimizer.optimize(products, constraints);
  
  console.log('线性规划结果:');
  console.log('可行解:', result.feasible);
  console.log('总成本:', result.totalCost);
  console.log('产品组合数量:', result.products.length);
  console.log('产品组合:', result.products.map(p => ({
    name: p.product.name,
    ratio: p.ratio.toFixed(4),
    price: p.product.price
  })));
  console.log('混合属性:', result.mixedProperties);
  
  if (result.totalCost > 2473.32) {
    console.log('');
    console.log('❌ 未达到目标成本2473.32，当前成本:', result.totalCost);
    console.log('差距:', (result.totalCost - 2473.32).toFixed(2));
  } else {
    console.log('');
    console.log('✅ 达到或超越目标成本2473.32');
  }
  
} catch (error) {
  console.error('测试失败:', error.message);
}