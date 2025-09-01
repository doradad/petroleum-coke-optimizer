// 超精细搜索，专门针对最有希望的组合
const products = [
  { name: '石油焦A', sulfur: 2.5, ash: 0.3, volatile: 10, vanadium: 300, price: 2800 },
  { name: '石油焦B', sulfur: 3.2, ash: 0.5, volatile: 12.5, vanadium: 350, price: 2600 },
  { name: '石油焦C', sulfur: 1.8, ash: 0.2, volatile: 8.5, vanadium: 250, price: 3200 },
  { name: '石油焦D', sulfur: 4, ash: 0.6, volatile: 15, vanadium: 400, price: 2400 },
  { name: '石油焦E', sulfur: 2, ash: 0.25, volatile: 9, vanadium: 280, price: 3000 }
];

const constraints = { sulfur: 10, ash: 2, volatile: 20, vanadium: 1000 };

function checkFeasibility(ratios, products, constraints) {
  let sulfur = 0, ash = 0, volatile = 0, vanadium = 0, price = 0;
  let totalRatio = 0;
  
  for (let i = 0; i < ratios.length; i++) {
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
  
  const feasible = Math.abs(totalRatio - 1) < 0.0001 &&
                   sulfur <= constraints.sulfur + 0.0001 &&
                   ash <= constraints.ash + 0.0001 &&
                   volatile <= constraints.volatile + 0.0001 &&
                   vanadium <= constraints.vanadium + 0.0001;
  
  return { feasible, price, properties: { sulfur, ash, volatile, vanadium, totalRatio } };
}

console.log('验证理论最低价格是否可达:');
console.log('');

// 分析：如果要达到更低的价格，必须大量使用D（最便宜2400）
// 但D的约束最严格：硫4%, 灰0.6%, 挥发15%, 钒400ppm
// 必须用其他产品来"稀释"这些高含量

console.log('单产品约束检查:');
products.forEach((p, i) => {
  console.log(`${p.name}: 硫${p.sulfur} 灰${p.ash} 挥${p.volatile} 钒${p.vanadium} 价格${p.price}`);
  const singleOK = p.sulfur <= constraints.sulfur && p.ash <= constraints.ash && 
                   p.volatile <= constraints.volatile && p.vanadium <= constraints.vanadium;
  console.log(`  单独可行: ${singleOK}`);
});

console.log('\n约束上限: 硫10 灰2 挥发20 钒1000');
console.log('');

// 理论分析：要获得低于2400的价格，需要更便宜的产品
// 但没有产品比D更便宜，所以只能通过组合来获得"虚拟更便宜"的效果
// 这只有在某个产品在某些约束上比D宽松很多，可以让D的比例更高时才可能

console.log('理论最优组合分析:');
console.log('如果D占比x，其他产品占比(1-x)，价格 = 2400*x + 其他产品加权平均*(1-x)');
console.log('要使总价格 < 2400，需要：其他产品加权平均 < 2400');
console.log('但所有其他产品价格都 > 2400，这在数学上不可能!');
console.log('');

// 验证这个数学结论
const otherProducts = products.filter(p => p.price !== 2400);
const cheapestOther = Math.min(...otherProducts.map(p => p.price));
console.log(`除D外最便宜产品价格: ${cheapestOther}`);
console.log(`因此任何包含非D产品的组合价格必 >= 2400`);
console.log('');

console.log('结论验证:');
// 唯一的可能是存在某个组合使得约束更宽松，能用更高比例的D
// 但D已经在所有约束下都可行，比例为1时就是最优

// 让我们验证是否存在数学错误
console.log('验证D是否真的满足所有约束:');
const dResult = checkFeasibility([0, 0, 0, 1, 0], products, constraints);
console.log(`D单独使用: 可行=${dResult.feasible}, 价格=${dResult.price}`);
console.log(`D的属性: 硫${dResult.properties.sulfur} 灰${dResult.properties.ash} 挥${dResult.properties.volatile} 钒${dResult.properties.vanadium}`);
console.log('');

console.log('最终结论: 单产品D确实是数学最优解，成本2400元');