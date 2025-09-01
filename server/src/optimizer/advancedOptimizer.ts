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
}