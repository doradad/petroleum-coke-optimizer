// 简单调试脚本
const products = [
  { name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { name: '石油焦D', sulfur: 4, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { name: '石油焦E', sulfur: 2, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 10, ash: 2, volatile: 20, vanadium: 1000 };

console.log('产品分析:');
products.forEach((p, i) => {
  const satisfies = p.sulfur <= constraints.sulfur && 
                   p.ash <= constraints.ash && 
                   p.volatile <= constraints.volatile && 
                   p.vanadium <= constraints.vanadium;
  console.log(`${i}: ${p.name} - 价格${p.price} - 约束满足: ${satisfies}`);
});

// 找到最便宜的满足约束的产品
const feasibleProducts = products.filter(p => 
  p.sulfur <= constraints.sulfur && 
  p.ash <= constraints.ash && 
  p.volatile <= constraints.volatile && 
  p.vanadium <= constraints.vanadium
);

const cheapest = feasibleProducts.reduce((min, p) => p.price < min.price ? p : min);
console.log('\n最优解应该是:', cheapest.name, '- 价格', cheapest.price);

// 构建线性规划问题
const c = products.map(p => p.price);
const A = [];
const b = [];

// 约束1a: -总比例 <= -1 (即总比例 >= 1)
A.push([-1, -1, -1, -1, -1]);
b.push(-1);

// 约束1b: 总比例 <= 1
A.push([1, 1, 1, 1, 1]);
b.push(1);

// 其他约束
A.push(products.map(p => p.sulfur));
b.push(constraints.sulfur);

A.push(products.map(p => p.ash));
b.push(constraints.ash);

A.push(products.map(p => p.volatile));
b.push(constraints.volatile);

A.push(products.map(p => p.vanadium));
b.push(constraints.vanadium);

console.log('\n线性规划问题:');
console.log('目标函数 c =', c);
console.log('约束矩阵 A =', A);
console.log('约束右端 b =', b);