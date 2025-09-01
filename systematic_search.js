// 系统搜索最优三产品组合
const products = [
  { name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { name: '石油焦D', sulfur: 4, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { name: '石油焦E', sulfur: 2, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 10, ash: 2, volatile: 20, vanadium: 1000 };

function checkFeasibility(products, ratios, constraints) {
  let sulfur = 0, ash = 0, volatile = 0, vanadium = 0, price = 0;
  let totalRatio = 0;
  
  for (let i = 0; i < products.length; i++) {
    const ratio = ratios[i];
    sulfur += products[i].sulfur * ratio;
    ash += products[i].ash * ratio;
    volatile += products[i].volatile * ratio;
    vanadium += products[i].vanadium * ratio;
    price += products[i].price * ratio;
    totalRatio += ratio;
  }
  
  const feasible = Math.abs(totalRatio - 1) < 0.001 &&
                   sulfur <= constraints.sulfur + 0.001 &&
                   ash <= constraints.ash + 0.001 &&
                   volatile <= constraints.volatile + 0.001 &&
                   vanadium <= constraints.vanadium + 0.001;
  
  return { feasible, price, properties: { sulfur, ash, volatile, vanadium } };
}

let bestSolution = { price: 2400, ratios: [0,0,0,1,0], desc: "单产品D" };
let feasibleCount = 0;

console.log('系统搜索三产品组合 (步长0.05):');
console.log('');

// 遍历所有三产品组合
for (let i = 0; i < 5; i++) {
  for (let j = i + 1; j < 5; j++) {
    for (let k = j + 1; k < 5; k++) {
      // 对于产品i,j,k进行网格搜索
      for (let r1 = 0.05; r1 <= 0.9; r1 += 0.05) {
        for (let r2 = 0.05; r2 <= 0.9 - r1; r2 += 0.05) {
          const r3 = 1 - r1 - r2;
          if (r3 >= 0.05 && r3 <= 0.9) {
            const ratios = [0, 0, 0, 0, 0];
            ratios[i] = r1;
            ratios[j] = r2;
            ratios[k] = r3;
            
            const result = checkFeasibility(products, ratios, constraints);
            if (result.feasible) {
              feasibleCount++;
              if (result.price < bestSolution.price) {
                bestSolution = {
                  price: result.price,
                  ratios: [...ratios],
                  desc: `${products[i].name}(${(r1*100).toFixed(0)}%) + ${products[j].name}(${(r2*100).toFixed(0)}%) + ${products[k].name}(${(r3*100).toFixed(0)}%)`,
                  properties: result.properties
                };
                console.log(`新最优解: ${bestSolution.desc}`);
                console.log(`  成本: ${result.price.toFixed(0)}, 硫: ${result.properties.sulfur.toFixed(2)}, 灰: ${result.properties.ash.toFixed(2)}, 挥: ${result.properties.volatile.toFixed(2)}, 钒: ${result.properties.vanadium.toFixed(0)}`);
              }
            }
          }
        }
      }
    }
  }
}

console.log(`\n搜索完成，找到 ${feasibleCount} 个可行的三产品组合`);
console.log(`最终最优解: ${bestSolution.desc}`);
console.log(`最低成本: ${bestSolution.price.toFixed(0)}`);

// 验证最优解
if (bestSolution.ratios.some(r => r > 0)) {
  const verification = checkFeasibility(products, bestSolution.ratios, constraints);
  console.log('\n最优解验证:');
  console.log(`可行: ${verification.feasible}`);
  console.log(`成本: ${verification.price.toFixed(0)}`);
  console.log(`比例: [${bestSolution.ratios.map(r => r.toFixed(3)).join(', ')}]`);
  console.log(`属性: 硫${verification.properties.sulfur.toFixed(2)} 灰${verification.properties.ash.toFixed(2)} 挥${verification.properties.volatile.toFixed(2)} 钒${verification.properties.vanadium.toFixed(0)}`);
}