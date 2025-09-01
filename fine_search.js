// 精细搜索验证是否存在更优的三产品组合
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
  
  const feasible = Math.abs(totalRatio - 1) < 0.0001 &&
                   sulfur <= constraints.sulfur + 0.0001 &&
                   ash <= constraints.ash + 0.0001 &&
                   volatile <= constraints.volatile + 0.0001 &&
                   vanadium <= constraints.vanadium + 0.0001;
  
  return { feasible, price, properties: { sulfur, ash, volatile, vanadium, totalRatio } };
}

let bestSolution = { price: 2400, ratios: [0,0,0,1,0], desc: "单产品D" };
let improvedCount = 0;

console.log('精细搜索三产品组合 (步长0.01, 重点优化包含D的组合):');
console.log('');

// 重点搜索包含最便宜产品D的组合
const otherProducts = [0, 1, 2, 4]; // A, B, C, E的索引

for (let i = 0; i < otherProducts.length; i++) {
  for (let j = i + 1; j < otherProducts.length; j++) {
    const idx1 = otherProducts[i];
    const idx2 = otherProducts[j];
    const idx3 = 3; // D的索引
    
    const productNames = `${products[idx1].name}+${products[idx2].name}+${products[idx3].name}`;
    let localBest = 2400;
    let localBestRatios = null;
    
    // 精细网格搜索
    for (let r1 = 0.01; r1 <= 0.95; r1 += 0.01) {
      for (let r2 = 0.01; r2 <= 0.95 - r1; r2 += 0.01) {
        const r3 = 1 - r1 - r2;
        if (r3 >= 0.01 && r3 <= 0.95) {
          const ratios = [0, 0, 0, 0, 0];
          ratios[idx1] = r1;
          ratios[idx2] = r2;
          ratios[idx3] = r3;
          
          const result = checkFeasibility(products, ratios, constraints);
          if (result.feasible && result.price < localBest) {
            localBest = result.price;
            localBestRatios = [...ratios];
            
            if (result.price < bestSolution.price) {
              bestSolution = {
                price: result.price,
                ratios: [...ratios],
                desc: `${productNames}: ${products[idx1].name}(${(r1*100).toFixed(1)}%) + ${products[idx2].name}(${(r2*100).toFixed(1)}%) + ${products[idx3].name}(${(r3*100).toFixed(1)}%)`,
                properties: result.properties
              };
              improvedCount++;
              console.log(`★ 第${improvedCount}次改进: ${result.price.toFixed(2)}`);
              console.log(`  ${bestSolution.desc}`);
              console.log(`  硫: ${result.properties.sulfur.toFixed(3)}, 灰: ${result.properties.ash.toFixed(3)}, 挥: ${result.properties.volatile.toFixed(3)}, 钒: ${result.properties.vanadium.toFixed(1)}`);
              console.log('');
            }
          }
        }
      }
    }
    
    if (localBest < 2400) {
      console.log(`${productNames} 最优: ${localBest.toFixed(2)}`);
    }
  }
}

console.log(`\n最终结果:`);
console.log(`改进次数: ${improvedCount}`);
console.log(`最优解: ${bestSolution.desc}`);
console.log(`最低成本: ${bestSolution.price.toFixed(2)}`);

if (bestSolution.price < 2400) {
  console.log(`比单产品D节省: ${(2400 - bestSolution.price).toFixed(2)} 元`);
}