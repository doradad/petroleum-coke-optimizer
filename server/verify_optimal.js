// 验证真正的最优解比例
// 假设三个产品是：东营-万通(2350), 滨州-京博(2268), 潍坊-海化(3033)

const products = [
  { name: '东营-万通', price: 2350, sulfur: 3.0, ash: 0.5, volatile: 12, vanadium: 370 },
  { name: '滨州-京博', price: 2268, sulfur: 2.5, ash: 0.2, volatile: 9.5, vanadium: 600 },
  { name: '潍坊-海化', price: 3033, sulfur: 1.8, ash: 0.15, volatile: 8.2, vanadium: 200 }
];

const constraints = { sulfur: 3, ash: 0.4, volatile: 12, vanadium: 350 };

// 测试用户提供的最优比例
const optimalRatios = [0.59859, 0.20423, 0.19718];

console.log('验证用户提供的最优解:');
console.log('最优比例:', optimalRatios.map(r => (r*100).toFixed(3) + '%').join(', '));
console.log('比例总和:', optimalRatios.reduce((sum, r) => sum + r, 0).toFixed(6));

// 计算成本
const cost = products.reduce((sum, p, i) => sum + p.price * optimalRatios[i], 0);
console.log('最优成本:', cost.toFixed(2));

// 计算混合属性
const mixedSulfur = products.reduce((sum, p, i) => sum + p.sulfur * optimalRatios[i], 0);
const mixedAsh = products.reduce((sum, p, i) => sum + p.ash * optimalRatios[i], 0);
const mixedVolatile = products.reduce((sum, p, i) => sum + p.volatile * optimalRatios[i], 0);
const mixedVanadium = products.reduce((sum, p, i) => sum + p.vanadium * optimalRatios[i], 0);

console.log('混合属性:');
console.log(`  硫: ${mixedSulfur.toFixed(3)} (≤ ${constraints.sulfur}) ${mixedSulfur <= constraints.sulfur ? '✓' : '✗'}`);
console.log(`  灰: ${mixedAsh.toFixed(3)} (≤ ${constraints.ash}) ${mixedAsh <= constraints.ash ? '✓' : '✗'}`);
console.log(`  挥发: ${mixedVolatile.toFixed(3)} (≤ ${constraints.volatile}) ${mixedVolatile <= constraints.volatile ? '✓' : '✗'}`);
console.log(`  钒: ${mixedVanadium.toFixed(1)} (≤ ${constraints.vanadium}) ${mixedVanadium <= constraints.vanadium ? '✓' : '✗'}`);

// 比较当前算法的结果
const currentRatios = [0.597, 0.198, 0.205];
const currentCost = products.reduce((sum, p, i) => sum + p.price * currentRatios[i], 0);

console.log('\n当前算法结果:');
console.log('当前比例:', currentRatios.map(r => (r*100).toFixed(1) + '%').join(', '));
console.log('当前成本:', currentCost.toFixed(2));
console.log('成本差距:', (currentCost - cost).toFixed(2));

// 分析网格搜索为什么遗漏了最优解
console.log('\n网格搜索分析:');
console.log('最优解r1:', optimalRatios[0], '最近的0.01网格点:', Math.round(optimalRatios[0] / 0.01) * 0.01);
console.log('最优解r2:', optimalRatios[1], '最近的0.01网格点:', Math.round(optimalRatios[1] / 0.01) * 0.01);
console.log('最优解r3:', optimalRatios[2], '最近的0.01网格点:', Math.round(optimalRatios[2] / 0.01) * 0.01);

// 测试更精细的网格
console.log('\n需要的网格精度分析:');
const gridSizes = [0.01, 0.005, 0.001];
gridSizes.forEach(grid => {
  const r1_grid = Math.round(optimalRatios[0] / grid) * grid;
  const r2_grid = Math.round(optimalRatios[1] / grid) * grid;
  const r3_grid = 1 - r1_grid - r2_grid;
  const gridCost = products[0].price * r1_grid + products[1].price * r2_grid + products[2].price * r3_grid;
  console.log(`网格${grid}: 比例[${r1_grid.toFixed(4)}, ${r2_grid.toFixed(4)}, ${r3_grid.toFixed(4)}], 成本${gridCost.toFixed(2)}`);
});