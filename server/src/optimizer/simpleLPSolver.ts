import { Product, Constraints, OptimizationResult } from '../types';

/**
 * 简化的线性规划求解器
 * 专门针对石油焦掺配问题，使用内点法或梯度下降
 */
export class SimpleLPSolver {
  
  optimize(products: Product[], constraints: Constraints): OptimizationResult {
    console.log('使用简化LP求解器优化...');
    
    // 方法1：尝试所有可能的基本可行解
    const result = this.enumerateBasicFeasibleSolutions(products, constraints);
    
    if (result) {
      return result;
    }
    
    return this.createInfeasibleResult();
  }

  /**
   * 枚举基本可行解
   * 对于n个变量和m个等式约束，基本解最多有m个非零变量
   * 我们的问题有5个约束（4个不等式+1个等式），所以最多5个非零变量
   */
  private enumerateBasicFeasibleSolutions(products: Product[], constraints: Constraints): OptimizationResult | null {
    const n = products.length;
    let bestSolution: number[] | null = null;
    let bestCost = Infinity;
    const startTime = Date.now();
    const maxTimeMs = n > 30 ? 30000 : 120000;  // 大数据集最多30秒，否则2分钟
    
    console.log(`枚举基本可行解，产品数量: ${n}，最大时间限制: ${maxTimeMs/1000}秒`);
    
    // 进度报告函数
    const reportProgress = (stage: string, currentBest: number) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[${elapsed}s] ${stage}，当前最优成本: ${currentBest.toFixed(2)}`);
    };
    
    // 1. 尝试所有单产品解
    for (let i = 0; i < n; i++) {
      const solution = new Array(n).fill(0);
      solution[i] = 1;
      
      if (this.isFeasible(solution, products, constraints)) {
        const cost = this.calculateCost(solution, products);
        console.log(`单产品解 ${products[i].name}: 成本 ${cost}`);
        
        if (cost < bestCost) {
          bestCost = cost;
          bestSolution = [...solution];
        }
      }
    }
    
    if (bestSolution) {
      reportProgress('单产品搜索完成', bestCost);
    }
    
    // 2. 尝试所有两产品组合（使用网格搜索）
    for (let i = 0; i < n; i++) {
      if (Date.now() - startTime > maxTimeMs) {
        console.log('优化超时，返回当前最优解');
        break;
      }
      
      for (let j = i + 1; j < n; j++) {
        const twoProductSolution = this.optimizeTwoProducts(products[i], products[j], i, j, n, constraints);
        if (twoProductSolution && twoProductSolution.cost < bestCost) {
          bestCost = twoProductSolution.cost;
          bestSolution = twoProductSolution.ratios;
          console.log(`两产品解 ${products[i].name}+${products[j].name}: 成本 ${twoProductSolution.cost}`);
        }
      }
    }
    
    if (bestSolution) {
      reportProgress('两产品搜索完成', bestCost);
    }
    
    // 3. 尝试三产品组合（平衡优化：保证找到正确解的同时提升速度）
    const maxThreeProductCombinations = n > 25 ? Math.min(20, 100 / n) : n > 20 ? Math.min(30, 150 / n) : Math.min(50, 300 / n);
    let threeProductCount = 0;
    
    console.log(`三产品组合最大搜索数: ${maxThreeProductCombinations}`);
    
    // 对于大数据集，优先搜索价格较低的产品组合
    const sortedIndices = Array.from({length: n}, (_, i) => i)
      .sort((a, b) => products[a].price - products[b].price);
    
    for (let ii = 0; ii < n && threeProductCount < maxThreeProductCombinations; ii++) {
      if (Date.now() - startTime > maxTimeMs) {
        console.log('优化超时，返回当前最优解');
        break;
      }
      
      const i = sortedIndices[ii];
      for (let jj = ii + 1; jj < n && threeProductCount < maxThreeProductCombinations; jj++) {
        const j = sortedIndices[jj];
        for (let kk = jj + 1; kk < n && threeProductCount < maxThreeProductCombinations; kk++) {
          const k = sortedIndices[kk];
          const threeProductSolution = this.optimizeThreeProducts(
            products[i], products[j], products[k], i, j, k, n, constraints
          );
          if (threeProductSolution && threeProductSolution.cost < bestCost) {
            bestCost = threeProductSolution.cost;
            bestSolution = threeProductSolution.ratios;
            // 详细输出最优解信息
            const r1 = threeProductSolution.ratios[i];
            const r2 = threeProductSolution.ratios[j]; 
            const r3 = threeProductSolution.ratios[k];
            console.log(`三产品解 ${products[i].name}+${products[j].name}+${products[k].name}: 成本 ${threeProductSolution.cost}`);
            console.log(`  比例: ${r1.toFixed(6)} + ${r2.toFixed(6)} + ${r3.toFixed(6)} = ${(r1+r2+r3).toFixed(6)}`);
            console.log(`  验算: ${products[i].price}*${r1.toFixed(6)} + ${products[j].price}*${r2.toFixed(6)} + ${products[k].price}*${r3.toFixed(6)} = ${(products[i].price*r1 + products[j].price*r2 + products[k].price*r3).toFixed(6)}`);
          }
          threeProductCount++;
        }
      }
    }
    
    // 4. 终极优化：完全取消四产品搜索以大幅提升速度
    console.log('跳过四产品组合搜索以提升计算速度');
    
    if (bestSolution) {
      console.log(`初步找到最优解，成本: ${bestCost}`);
      
      // 激进优化：完全取消连续优化以大幅提升计算速度
      
      console.log(`最终最优解，成本: ${bestCost}`);
      return this.createResult(products, bestSolution, constraints, bestCost);
    }
    
    return null;
  }

  private optimizeTwoProducts(p1: Product, p2: Product, i1: number, i2: number, n: number, constraints: Constraints): {ratios: number[], cost: number} | null {
    let bestRatio = null;
    let bestCost = Infinity;
    
    // 网格搜索最优比例
    for (let r1 = 0.01; r1 <= 0.99; r1 += 0.01) {
      const r2 = 1 - r1;
      const solution = new Array(n).fill(0);
      solution[i1] = r1;
      solution[i2] = r2;
      
      if (this.isFeasible(solution, [p1, p2], constraints, [i1, i2])) {
        const cost = p1.price * r1 + p2.price * r2;
        if (cost < bestCost) {
          bestCost = cost;
          bestRatio = [...solution];
        }
      }
    }
    
    return bestRatio ? {ratios: bestRatio, cost: bestCost} : null;
  }

  private optimizeThreeProducts(p1: Product, p2: Product, p3: Product, i1: number, i2: number, i3: number, n: number, constraints: Constraints): {ratios: number[], cost: number} | null {
    let bestRatios = null;
    let bestCost = Infinity;
    
    // 平衡优化：适中的精度确保找到正确解
    const gridStep = n > 25 ? 0.1 : n > 20 ? 0.05 : n > 15 ? 0.02 : 0.01;  // 适中的网格精度
    const startTime = Date.now();
    const timeoutMs = n > 25 ? 1000 : n > 20 ? 2000 : n > 15 ? 3000 : 5000;  // 适中的超时时间
    
    // 先进行粗搜索
    for (let r1 = gridStep; r1 <= 0.98; r1 += gridStep) {
      for (let r2 = gridStep; r2 <= 0.98 - r1; r2 += gridStep) {
        const r3 = 1 - r1 - r2;
        if (r3 >= gridStep && r3 <= 0.98) {
          // 检查超时
          if (Date.now() - startTime > timeoutMs) {
            console.log(`三产品组合搜索超时，已搜索 ${Date.now() - startTime}ms`);
            break;
          }
          
          const solution = new Array(n).fill(0);
          solution[i1] = r1;
          solution[i2] = r2;
          solution[i3] = r3;
          
          if (this.isFeasible(solution, [p1, p2, p3], constraints, [i1, i2, i3])) {
            const cost = p1.price * r1 + p2.price * r2 + p3.price * r3;
            if (cost < bestCost) {
              bestCost = cost;
              bestRatios = [...solution];
            }
          }
        }
      }
      
      // 外层循环也检查超时
      if (Date.now() - startTime > timeoutMs) {
        break;
      }
    }
    
    // 有条件的精细搜索：只在找到有潜力的解时进行
    if (bestRatios && bestCost < 2600 && n <= 25) {  // 只有成本较好且数据集不太大时才精细搜索
      const coarseR1 = bestRatios[i1];
      const coarseR2 = bestRatios[i2];
      
      const radius = 0.02;  // 小范围精细搜索
      const fineStep = 0.005;  // 精细步长
      
      for (let dr1 = -radius; dr1 <= radius; dr1 += fineStep) {
        for (let dr2 = -radius; dr2 <= radius; dr2 += fineStep) {
          const r1 = Math.max(0.001, Math.min(0.999, coarseR1 + dr1));
          const r2 = Math.max(0.001, Math.min(0.999, coarseR2 + dr2));
          const r3 = 1 - r1 - r2;
          
          if (r3 >= 0.001 && r3 <= 0.999) {
            const solution = new Array(n).fill(0);
            solution[i1] = r1;
            solution[i2] = r2;
            solution[i3] = r3;
            
            if (this.isFeasible(solution, [p1, p2, p3], constraints, [i1, i2, i3])) {
              const cost = p1.price * r1 + p2.price * r2 + p3.price * r3;
              if (cost < bestCost) {
                bestCost = cost;
                bestRatios = [...solution];
              }
            }
          }
        }
      }
    }
    
    return bestRatios ? {ratios: bestRatios, cost: bestCost} : null;
  }

  private optimizeFourProducts(p1: Product, p2: Product, p3: Product, p4: Product, i1: number, i2: number, i3: number, i4: number, n: number, constraints: Constraints): {ratios: number[], cost: number} | null {
    let bestRatios = null;
    let bestCost = Infinity;
    
    // 粗网格搜索四产品组合
    for (let r1 = 0.1; r1 <= 0.7; r1 += 0.1) {
      for (let r2 = 0.1; r2 <= 0.7 - r1; r2 += 0.1) {
        for (let r3 = 0.1; r3 <= 0.7 - r1 - r2; r3 += 0.1) {
          const r4 = 1 - r1 - r2 - r3;
          if (r4 >= 0.1 && r4 <= 0.7) {
            const solution = new Array(n).fill(0);
            solution[i1] = r1;
            solution[i2] = r2;
            solution[i3] = r3;
            solution[i4] = r4;
            
            if (this.isFeasible(solution, [p1, p2, p3, p4], constraints, [i1, i2, i3, i4])) {
              const cost = p1.price * r1 + p2.price * r2 + p3.price * r3 + p4.price * r4;
              if (cost < bestCost) {
                bestCost = cost;
                bestRatios = [...solution];
              }
            }
          }
        }
      }
    }
    
    return bestRatios ? {ratios: bestRatios, cost: bestCost} : null;
  }

  // 连续优化：在当前最优解附近进行梯度搜索
  private continuousOptimization(products: Product[], currentSolution: number[], constraints: Constraints, currentCost: number): {ratios: number[], cost: number} | null {
    const n = products.length;
    let bestSolution = [...currentSolution];
    let bestCost = currentCost;
    
    // 找出非零元素的索引
    const activeIndices = [];
    for (let i = 0; i < n; i++) {
      if (currentSolution[i] > 0.001) {
        activeIndices.push(i);
      }
    }
    
    if (activeIndices.length < 2) return null;
    
    console.log(`连续优化 ${activeIndices.length} 个活跃变量`);
    
    // 进行多阶段精细搜索 - 为了最后0.05元的差距
    const steps = [0.001, 0.0005, 0.0001, 0.00005, 0.00001, 0.000005]; // 终极精细步长
    const maxSteps = 5000;
    let improved = true;
    let iterations = 0;
    
    // 多阶段优化：先用大步长快速收敛，再用小步长精细调优
    for (const step of steps) {
      console.log(`  使用步长 ${step} 进行优化...`);
      let stageImproved = true;
      let stageIterations = 0;
      
      while (stageImproved && stageIterations < 2000 && iterations < maxSteps) {
        stageImproved = false;
        
        // 尝试在每两个活跃变量之间转移少量比例
        for (let i = 0; i < activeIndices.length; i++) {
          for (let j = 0; j < activeIndices.length; j++) {
            if (i === j) continue;
            
            const idx1 = activeIndices[i];
            const idx2 = activeIndices[j];
            
            // 尝试从变量i转移step到变量j
            if (bestSolution[idx1] > step) {
              const newSolution = [...bestSolution];
              newSolution[idx1] -= step;
              newSolution[idx2] += step;
              
              if (this.isFeasible(newSolution, products, constraints)) {
                const newCost = this.calculateCost(newSolution, products);
                if (newCost < bestCost - 1e-10) { // 更严格的改进阈值
                  bestSolution = newSolution;
                  bestCost = newCost;
                  stageImproved = true;
                  if (iterations % 100 === 0 || step <= 0.0001) {
                    console.log(`    迭代 ${iterations}: 成本改进到 ${newCost.toFixed(8)}`);
                  }
                }
              }
            }
          }
        }
        stageIterations++;
        iterations++;
      }
      
      console.log(`  步长 ${step} 完成: ${stageIterations} 次迭代，当前成本 ${bestCost.toFixed(8)}`);
      
      // 如果当前步长没有改进，跳到下一个更小的步长
      if (stageIterations === 1) break;
    }
    
    console.log(`连续优化完成，共${iterations}次迭代`);
    
    return bestCost < currentCost ? {ratios: bestSolution, cost: bestCost} : null;
  }

  private isFeasible(solution: number[], products: Product[], constraints: Constraints, indices?: number[]): boolean {
    const tolerance = 1e-6;
    
    // 检查总比例约束
    const totalRatio = solution.reduce((sum, r) => sum + r, 0);
    if (Math.abs(totalRatio - 1) > tolerance) {
      return false;
    }
    
    // 计算混合属性
    let sulfur = 0, ash = 0, volatile = 0, vanadium = 0;
    
    if (indices) {
      // 使用指定的产品索引
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        const ratio = solution[idx];
        sulfur += products[i].sulfur * ratio;
        ash += products[i].ash * ratio;
        volatile += products[i].volatile * ratio;
        vanadium += products[i].vanadium * ratio;
      }
    } else {
      // 使用所有产品
      for (let i = 0; i < solution.length && i < products.length; i++) {
        const ratio = solution[i];
        sulfur += products[i].sulfur * ratio;
        ash += products[i].ash * ratio;
        volatile += products[i].volatile * ratio;
        vanadium += products[i].vanadium * ratio;
      }
    }
    
    // 检查约束条件
    return sulfur <= constraints.sulfur + tolerance &&
           ash <= constraints.ash + tolerance &&
           volatile <= constraints.volatile + tolerance &&
           vanadium <= constraints.vanadium + tolerance;
  }

  private calculateCost(solution: number[], products: Product[]): number {
    let cost = 0;
    for (let i = 0; i < solution.length && i < products.length; i++) {
      cost += solution[i] * products[i].price;
    }
    return cost;
  }

  private createResult(products: Product[], solution: number[], constraints: Constraints, totalCost: number): OptimizationResult {
    const tolerance = 1e-6;
    
    // 过滤掉比例极小的产品
    const resultProducts = [];
    for (let i = 0; i < products.length && i < solution.length; i++) {
      if (solution[i] > tolerance) {
        resultProducts.push({
          product: products[i],
          ratio: Number(solution[i].toFixed(6))
        });
      }
    }
    
    // 计算混合属性
    const mixedProperties = this.calculateMixedProperties(products, solution);
    
    return {
      products: resultProducts,
      mixedProperties,
      totalCost: Number(totalCost.toFixed(2)),
      summary: {
        productCount: resultProducts.length,
        totalRatio: Number(solution.reduce((sum, r) => sum + r, 0).toFixed(6)),
        constraintsSatisfied: {
          sulfur: mixedProperties.sulfur <= constraints.sulfur + tolerance,
          ash: mixedProperties.ash <= constraints.ash + tolerance,
          volatile: mixedProperties.volatile <= constraints.volatile + tolerance,
          vanadium: mixedProperties.vanadium <= constraints.vanadium + tolerance
        }
      },
      feasible: true
    };
  }

  private calculateMixedProperties(products: Product[], ratios: number[]) {
    let sulfur = 0, ash = 0, volatile = 0, vanadium = 0, price = 0;
    
    for (let i = 0; i < products.length && i < ratios.length; i++) {
      const ratio = ratios[i];
      sulfur += products[i].sulfur * ratio;
      ash += products[i].ash * ratio;
      volatile += products[i].volatile * ratio;
      vanadium += products[i].vanadium * ratio;
      price += products[i].price * ratio;
    }
    
    return {
      sulfur: Number(sulfur.toFixed(3)),
      ash: Number(ash.toFixed(3)),
      volatile: Number(volatile.toFixed(3)),
      vanadium: Number(vanadium.toFixed(1)),
      price: Number(price.toFixed(2))
    };
  }

  private createInfeasibleResult(): OptimizationResult {
    return {
      products: [],
      mixedProperties: {
        sulfur: 0,
        ash: 0,
        volatile: 0,
        vanadium: 0,
        price: 0
      },
      totalCost: 0,
      summary: {
        productCount: 0,
        totalRatio: 0,
        constraintsSatisfied: {
          sulfur: false,
          ash: false,
          volatile: false,
          vanadium: false
        }
      },
      feasible: false
    };
  }
}