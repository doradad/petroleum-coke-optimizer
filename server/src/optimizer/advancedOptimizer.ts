import { Product, Constraints, OptimizationResult } from '../types';
import { SimpleLPSolver } from './simpleLPSolver';
import { LinearProgrammingOptimizer } from './linearProgrammingOptimizer';
import { DirectSearchOptimizer } from './directSearchOptimizer';

export class AdvancedOptimizer {
  private simpleLPSolver = new SimpleLPSolver(); // 新的主要求解器
  private linearProgrammingOptimizer = new LinearProgrammingOptimizer(); // 备用
  private directSearchOptimizer = new DirectSearchOptimizer(); // 备用

  optimize(products: Product[], constraints: Constraints): OptimizationResult {
    if (products.length === 0) {
      throw new Error('没有产品数据');
    }

    console.log(`开始优化: ${products.length} 个产品`);
    console.log('约束条件:', constraints);
    
    try {
      // 首先使用简化LP求解器（最可靠的方法）
      console.log('使用简化LP求解器...');
      const simpleResult = this.simpleLPSolver.optimize(products, constraints);
      
      if (simpleResult.feasible) {
        console.log('简化LP求解成功:', {
          feasible: simpleResult.feasible,
          totalCost: simpleResult.totalCost,
          productCount: simpleResult.products.length
        });
        return simpleResult;
      }
      
      console.log('简化LP求解失败，尝试标准线性规划');
      // 如果简化LP失败，尝试标准线性规划
      const lpResult = this.linearProgrammingOptimizer.optimize(products, constraints);
      
      if (lpResult.feasible) {
        console.log('线性规划求解成功:', {
          feasible: lpResult.feasible,
          totalCost: lpResult.totalCost,
          productCount: lpResult.products.length
        });
        return lpResult;
      }
      
      console.log('所有LP方法失败，回退到直接搜索');
      // 最后回退到直接搜索
      const directResult = this.directSearchOptimizer.optimize(products, constraints);
      console.log('直接搜索完成:', {
        feasible: directResult.feasible,
        totalCost: directResult.totalCost,
        productCount: directResult.products.length
      });
      return directResult;
      
    } catch (error) {
      console.error('优化过程出错，使用直接搜索:', error);
      const directResult = this.directSearchOptimizer.optimize(products, constraints);
      console.log('直接搜索完成:', {
        feasible: directResult.feasible,
        totalCost: directResult.totalCost,
        productCount: directResult.products.length
      });
      return directResult;
    }
  }

  private buildLinearProgram(products: Product[], constraints: Constraints) {
    const n = products.length;
    
    // 目标函数：最小化成本
    const c = products.map(p => p.price);
    
    // 约束矩阵和右端向量
    const A: number[][] = [];
    const b: number[] = [];
    
    // 约束1: 总比例 = 1 (转换为两个不等式)
    // 1a: 总比例 >= 1 -> -总比例 <= -1
    A.push(products.map(() => -1));
    b.push(-1);
    
    // 1b: 总比例 <= 1
    A.push(products.map(() => 1));
    b.push(1);
    
    // 约束2: 硫含量 <= 上限
    A.push(products.map(p => p.sulfur));
    b.push(constraints.sulfur);
    
    // 约束3: 灰分 <= 上限
    A.push(products.map(p => p.ash));
    b.push(constraints.ash);
    
    // 约束4: 挥发分 <= 上限
    A.push(products.map(p => p.volatile));
    b.push(constraints.volatile);
    
    // 约束5: 钒含量 <= 上限
    A.push(products.map(p => p.vanadium));
    b.push(constraints.vanadium);
    
    return { c, A, b };
  }

  private calculateMixedProperties(products: Product[], ratios: number[]) {
    let sulfur = 0, ash = 0, volatile = 0, vanadium = 0, price = 0;
    
    for (let i = 0; i < products.length; i++) {
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

  // 验证约束是否可行
  validateConstraints(products: Product[], constraints: Constraints): {
    feasible: boolean;
    violations: string[];
  } {
    return this.linearProgrammingOptimizer.validateConstraints(products, constraints);
  }

  // 生成TOP5优化方案
  optimizeTop5(products: Product[], constraints: Constraints): OptimizationResult[] {
    if (products.length === 0) {
      return [];
    }

    console.log(`开始生成TOP5方案: ${products.length} 个产品`);
    console.log('约束条件:', constraints);
    
    try {
      // 第一步：生成多种产品组合方案
      const combinations = this.generateProductCombinations(products);
      console.log(`生成了 ${combinations.length} 种产品组合`);

      // 第二步：为每种组合优化掺配比例
      const validResults: Array<OptimizationResult & { sortKey: number }> = [];

      for (let i = 0; i < combinations.length && validResults.length < 50; i++) {
        const combination = combinations[i];
        try {
          // 使用子集产品进行优化
          const result = this.optimizeCombination(combination, constraints);
          
          // 严格验证约束条件
          if (result.feasible && result.totalCost > 0 && this.validateSolutionConstraints(result, constraints)) {
            console.log(`找到可行方案: 成本=${result.totalCost}, 产品数=${result.products.length}`);
            console.log(`  约束验证: S=${result.mixedProperties.sulfur}≤${constraints.sulfur}, A=${result.mixedProperties.ash}≤${constraints.ash}, V=${result.mixedProperties.volatile}≤${constraints.volatile}, 钒=${result.mixedProperties.vanadium}≤${constraints.vanadium}`);
            
            validResults.push({
              ...result,
              sortKey: Number(result.totalCost.toFixed(2)) // 固定精度避免浮点误差
            });
          } else {
            if (result.feasible) {
              console.log(`跳过违反约束的方案: 成本=${result.totalCost}`);
              console.log(`  约束检查: S=${result.mixedProperties.sulfur}≤${constraints.sulfur}? A=${result.mixedProperties.ash}≤${constraints.ash}? V=${result.mixedProperties.volatile}≤${constraints.volatile}? 钒=${result.mixedProperties.vanadium}≤${constraints.vanadium}?`);
            }
          }
        } catch (error) {
          // 跳过失败的组合
          continue;
        }
      }

      console.log(`找到 ${validResults.length} 个有效方案`);

      // 第三步：按价格排序，取前5个，添加二级排序保证稳定性
      validResults.sort((a, b) => {
        const costDiff = a.sortKey - b.sortKey;
        if (Math.abs(costDiff) < 1e-10) {
          // 成本相同时按产品数量排序
          return a.products.length - b.products.length;
        }
        return costDiff;
      });
      
      // 过滤重复方案（成本相差很小的认为是重复）
      const uniqueResults = this.filterSimilarResults(validResults);
      
      console.log(`去重后有 ${uniqueResults.length} 个方案`);
      
      const top5Results = uniqueResults.slice(0, 5).map(r => {
        const { sortKey, ...result } = r;
        return result;
      });

      console.log(`返回TOP5方案，成本分别为: ${top5Results.map(r => r.totalCost.toFixed(2)).join(', ')}`);
      
      return top5Results;

    } catch (error) {
      console.error('生成TOP5方案失败:', error);
      // 回退到单一最优解
      const singleResult = this.optimize(products, constraints);
      return singleResult.feasible ? [singleResult] : [];
    }
  }

  // 生成不同的产品组合
  private generateProductCombinations(products: Product[]): Product[][] {
    const combinations: Product[][] = [];
    const n = products.length;
    
    // 添加全部产品组合
    combinations.push([...products]);
    
    // 如果产品数量较多，生成一些子集组合
    if (n > 3) {
      // 随机生成一些3-5个产品的组合
      const targetCombinations = Math.min(15, n * 2);
      
      for (let i = 0; i < targetCombinations; i++) {
        // 使用确定性方式生成组合大小
        const combSize = Math.min(n, Math.max(3, (i % 4) + 3));
        const combination = this.getRandomCombination(products, combSize, i);
        
        // 避免重复
        if (!this.isDuplicateCombination(combination, combinations)) {
          combinations.push(combination);
        }
      }
      
      // 添加一些基于价格的组合
      const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
      
      // 最便宜的N个
      for (let size = 3; size <= Math.min(6, n); size++) {
        combinations.push(sortedByPrice.slice(0, size));
      }
      
      // 中等价格的N个
      if (n >= 6) {
        const midStart = Math.floor((n - 4) / 2);
        combinations.push(sortedByPrice.slice(midStart, midStart + 4));
      }
    }
    
    return combinations;
  }

  // 优化特定产品组合
  private optimizeCombination(products: Product[], constraints: Constraints): OptimizationResult {
    // 首先尝试简化LP求解器
    try {
      const result = this.simpleLPSolver.optimize(products, constraints);
      if (result.feasible) {
        return result;
      }
    } catch (error) {
      // 继续尝试其他方法
    }

    // 尝试线性规划
    try {
      const result = this.linearProgrammingOptimizer.optimize(products, constraints);
      if (result.feasible) {
        return result;
      }
    } catch (error) {
      // 继续尝试其他方法
    }

    // 最后回退到直接搜索
    return this.directSearchOptimizer.optimize(products, constraints);
  }

  // 获取确定性产品组合（使用产品ID作为随机种子）
  private getRandomCombination(products: Product[], size: number, index: number = 0): Product[] {
    // 使用产品ID和索引的哈希值作为种子，确保相同输入产生相同输出
    const seed = this.generateSeedFromProducts(products) + '_' + index;
    const shuffled = [...products].sort((a, b) => {
      const hashA = this.simpleHash(a.id + seed);
      const hashB = this.simpleHash(b.id + seed);
      return hashA - hashB;
    });
    return shuffled.slice(0, size);
  }

  // 简单哈希函数，用于生成确定性随机数
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  // 从产品列表生成种子
  private generateSeedFromProducts(products: Product[]): string {
    return products.map(p => p.id).sort().join('_');
  }

  // 检查是否为重复组合
  private isDuplicateCombination(combination: Product[], existing: Product[][]): boolean {
    const ids = combination.map(p => p.id).sort();
    
    return existing.some(existingComb => {
      const existingIds = existingComb.map(p => p.id).sort();
      return ids.length === existingIds.length && 
             ids.every((id, index) => id === existingIds[index]);
    });
  }

  // 严格验证解是否满足所有约束条件
  private validateSolutionConstraints(result: OptimizationResult, constraints: Constraints): boolean {
    const props = result.mixedProperties;
    
    // 检查每个约束条件
    const sulfurValid = props.sulfur <= constraints.sulfur + 1e-6; // 添加小的容差
    const ashValid = props.ash <= constraints.ash + 1e-6;
    const volatileValid = props.volatile <= constraints.volatile + 1e-6;
    const vanadiumValid = props.vanadium <= constraints.vanadium + 1e-6;
    
    // 检查总比例是否接近1
    const totalRatio = result.products.reduce((sum, p) => sum + p.ratio, 0);
    const ratioValid = Math.abs(totalRatio - 1.0) < 1e-6;
    
    const isValid = sulfurValid && ashValid && volatileValid && vanadiumValid && ratioValid;
    
    if (!isValid) {
      console.log(`约束验证失败:`, {
        sulfur: `${props.sulfur} > ${constraints.sulfur}? ${!sulfurValid}`,
        ash: `${props.ash} > ${constraints.ash}? ${!ashValid}`,
        volatile: `${props.volatile} > ${constraints.volatile}? ${!volatileValid}`,
        vanadium: `${props.vanadium} > ${constraints.vanadium}? ${!vanadiumValid}`,
        totalRatio: `${totalRatio} != 1.0? ${!ratioValid}`
      });
    }
    
    return isValid;
  }

  // 过滤相似的结果（成本差异小于1%的认为相似）
  private filterSimilarResults(results: Array<OptimizationResult & { sortKey: number }>): Array<OptimizationResult & { sortKey: number }> {
    const filtered: Array<OptimizationResult & { sortKey: number }> = [];
    const threshold = 0.01; // 1%差异阈值
    
    for (const result of results) {
      const isSimilar = filtered.some(existing => {
        // 使用固定精度的成本进行比较
        const resultCost = Number(result.sortKey.toFixed(2));
        const existingCost = Number(existing.sortKey.toFixed(2));
        const diff = Math.abs(resultCost - existingCost) / existingCost;
        return diff < threshold;
      });
      
      if (!isSimilar) {
        filtered.push(result);
      }
    }
    
    return filtered;
  }
}