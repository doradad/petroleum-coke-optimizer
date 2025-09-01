// 验证各个产品的可行性
const products = [
  { id: '1', name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { id: '2', name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { id: '3', name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { id: '4', name: '石油焦D', sulfur: 4.0, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { id: '5', name: '石油焦E', sulfur: 2.0, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 3, ash: 0.4, volatile: 12, vanadium: 350 };

console.log('单产品可行性分析:');
console.log('约束条件: 硫≤3, 灰≤0.4, 挥发≤12, 钒≤350');
console.log('');

products.forEach(product => {
  const feasible = 
    product.sulfur <= constraints.sulfur &&
    product.ash <= constraints.ash &&
    product.volatile <= constraints.volatile &&
    product.vanadium <= constraints.vanadium;
    
  console.log(`${product.name}:`);
  console.log(`  硫: ${product.sulfur} ${product.sulfur <= constraints.sulfur ? '✓' : '✗'}`);
  console.log(`  灰: ${product.ash} ${product.ash <= constraints.ash ? '✓' : '✗'}`);
  console.log(`  挥发: ${product.volatile} ${product.volatile <= constraints.volatile ? '✓' : '✗'}`);
  console.log(`  钒: ${product.vanadium} ${product.vanadium <= constraints.vanadium ? '✓' : '✗'}`);
  console.log(`  价格: ${product.price}`);
  console.log(`  可行: ${feasible ? '是' : '否'}`);
  console.log('');
});

// 找出可行的单产品解中最便宜的
const feasibleProducts = products.filter(p => 
  p.sulfur <= constraints.sulfur &&
  p.ash <= constraints.ash &&
  p.volatile <= constraints.volatile &&
  p.vanadium <= constraints.vanadium
);

if (feasibleProducts.length > 0) {
  const cheapest = feasibleProducts.reduce((min, p) => p.price < min.price ? p : min);
  console.log(`最便宜的可行单产品解: ${cheapest.name}, 价格: ${cheapest.price}`);
} else {
  console.log('没有可行的单产品解，需要混合方案');
}