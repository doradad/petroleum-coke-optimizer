// 调试约束设置问题
const products = [
  { name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { name: '石油焦D', sulfur: 4, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { name: '石油焦E', sulfur: 2, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 10, ash: 2, volatile: 20, vanadium: 1000 };

// 检查是否有单一产品可行解
console.log('单一产品可行性检查:');
products.forEach((p, i) => {
  const feasible = p.sulfur <= constraints.sulfur && 
                   p.ash <= constraints.ash && 
                   p.volatile <= constraints.volatile && 
                   p.vanadium <= constraints.vanadium;
  console.log(`${i}: ${p.name} - 可行: ${feasible}`);
});

// 构建约束矩阵
const A = [];
const b = [];
const n = products.length;

// 约束1a: -总比例 <= -1 (即总比例 >= 1)
A.push(products.map(() => -1));
b.push(-1);

// 约束1b: 总比例 <= 1
A.push(products.map(() => 1));
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

console.log('\n约束矩阵检查:');
console.log('A =', A);
console.log('b =', b);

// 检查石油焦D（价格2400）是否满足约束
const solution = [0, 0, 0, 1, 0]; // 100% 石油焦D
console.log('\n石油焦D解 [0,0,0,1,0] 检查:');
A.forEach((row, i) => {
  const lhs = row.reduce((sum, coeff, j) => sum + coeff * solution[j], 0);
  const satisfied = lhs <= b[i] + 1e-6;
  console.log(`约束${i}: ${lhs.toFixed(3)} <= ${b[i]} - ${satisfied ? '✓' : '✗'}`);
});