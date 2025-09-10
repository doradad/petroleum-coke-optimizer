import { Product, Constraints, OptimizationResult } from '../types';
import { AdvancedOptimizer } from './advancedOptimizer';

export class PetroleumCokeOptimizer {
  private advancedOptimizer = new AdvancedOptimizer();

  optimize(products: Product[], constraints: Constraints): OptimizationResult {
    try {
      return this.advancedOptimizer.optimize(products, constraints);
    } catch (error) {
      console.error('优化求解失败:', error);
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

  // 生成TOP5优化方案
  optimizeTop5(products: Product[], constraints: Constraints): OptimizationResult[] {
    try {
      return this.advancedOptimizer.optimizeTop5(products, constraints);
    } catch (error) {
      console.error('TOP5优化求解失败:', error);
      return [];
    }
  }

  // 暴露约束验证功能
  validateConstraints(products: Product[], constraints: Constraints) {
    return this.advancedOptimizer.validateConstraints(products, constraints);
  }
}

export default new PetroleumCokeOptimizer();