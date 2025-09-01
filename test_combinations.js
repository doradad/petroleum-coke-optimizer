// 测试三产品组合找到更便宜的解
const products = [
  { name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { name: '石油焦D', sulfur: 4, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { name: '石油焦E', sulfur: 2, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 10, ash: 2, volatile: 20, vanadium: 1000 };

function checkConstraints(products, ratios, constraints) {
  let sulfur = 0, ash = 0, volatile = 0, vanadium = 0, price = 0;
  let totalRatio = 0;
  
  for (let i = 0; i < products.length; i++) {
    const ratio = ratios[i];
    if (ratio > 0) {
      sulfur += products[i].sulfur * ratio;
      ash += products[i].ash * ratio;
      volatile += products[i].volatile * ratio;
      vanadium += products[i].vanadium * ratio;
      price += products[i].price * ratio;
      totalRatio += ratio;
    }
  }
  
  const feasible = Math.abs(totalRatio - 1) < 0.001 &&
                   sulfur <= constraints.sulfur + 0.001 &&
                   ash <= constraints.ash + 0.001 &&
                   volatile <= constraints.volatile + 0.001 &&
                   vanadium <= constraints.vanadium + 0.001;
  
  return {
    feasible,
    properties: { sulfur, ash, volatile, vanadium, price },
    totalRatio
  };
}

// 测试一些可能的三产品组合
const testCombinations = [
  // 尝试低硫+中等价格的组合
  { ratios: [0.4, 0.3, 0.3, 0, 0], desc: "A+B+C" },
  { ratios: [0.3, 0.4, 0, 0.3, 0], desc: "A+B+D" },
  { ratios: [0.3, 0, 0.4, 0.3, 0], desc: "A+C+D" },
  { ratios: [0, 0.4, 0.3, 0.3, 0], desc: "B+C+D" },
  { ratios: [0.2, 0.2, 0.2, 0.4, 0], desc: "A+B+C+D" },
  
  // 尝试更多比例的D（价格最低）
  { ratios: [0.2, 0.2, 0, 0.6, 0], desc: "A+B+D(60%)" },
  { ratios: [0.1, 0.1, 0, 0.8, 0], desc: "A+B+D(80%)" },
  { ratios: [0.3, 0, 0.2, 0.5, 0], desc: "A+C+D(50%)" },
  { ratios: [0, 0.3, 0.2, 0.5, 0], desc: "B+C+D(50%)" },
  
  // 包含E的组合
  { ratios: [0.3, 0.3, 0, 0, 0.4], desc: "A+B+E" },
  { ratios: [0.2, 0, 0.3, 0.5, 0], desc: "A+C+D" },
];

console.log('测试三产品组合:');
console.log('当前最佳单产品解: 石油焦D, 成本 2400');
console.log('');

let bestCost = 2400;
let bestCombination = null;

testCombinations.forEach(combo => {
  const result = checkConstraints(products, combo.ratios, constraints);
  if (result.feasible && result.properties.price < bestCost) {
    bestCost = result.properties.price;
    bestCombination = combo;
    console.log(`✓ 找到更优解! ${combo.desc}: 成本 ${result.properties.price.toFixed(0)}`);
    console.log(`  硫: ${result.properties.sulfur.toFixed(2)}, 灰: ${result.properties.ash.toFixed(2)}, 挥: ${result.properties.volatile.toFixed(2)}, 钒: ${result.properties.vanadium.toFixed(0)}`);
  } else if (result.feasible) {
    console.log(`○ ${combo.desc}: 成本 ${result.properties.price.toFixed(0)} (可行但非最优)`);
  } else {
    console.log(`✗ ${combo.desc}: 成本 ${result.properties.price.toFixed(0)} (不可行)`);
  }
});

if (bestCombination) {
  console.log(`\n最优解: ${bestCombination.desc}, 成本 ${bestCost.toFixed(0)}`);
} else {
  console.log('\n未找到比单产品更优的组合');
}