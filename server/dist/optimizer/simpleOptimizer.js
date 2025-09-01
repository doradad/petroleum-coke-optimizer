"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleOptimizer = void 0;
class SimpleOptimizer {
    optimize(products, constraints) {
        const n = products.length;
        if (n === 0) {
            throw new Error('没有产品数据');
        }
        // 枚举所有可能的单一产品解
        const singleProductSolutions = [];
        for (let i = 0; i < n; i++) {
            const product = products[i];
            // 检查单一产品是否满足约束
            if (product.sulfur <= constraints.sulfur &&
                product.ash <= constraints.ash &&
                product.volatile <= constraints.volatile &&
                product.vanadium <= constraints.vanadium) {
                const solution = {
                    products: [{
                            product,
                            ratio: 1.0
                        }],
                    mixedProperties: {
                        sulfur: product.sulfur,
                        ash: product.ash,
                        volatile: product.volatile,
                        vanadium: product.vanadium,
                        price: product.price
                    },
                    totalCost: product.price,
                    summary: {
                        productCount: 1,
                        totalRatio: 1,
                        constraintsSatisfied: {
                            sulfur: true,
                            ash: true,
                            volatile: true,
                            vanadium: true
                        }
                    },
                    feasible: true
                };
                singleProductSolutions.push(solution);
            }
        }
        // 如果没有单一产品可行解，尝试简单的两产品组合
        let bestSolution = null;
        let bestCost = Infinity;
        // 先检查单一产品解
        for (const solution of singleProductSolutions) {
            if (solution.totalCost < bestCost) {
                bestCost = solution.totalCost;
                bestSolution = solution;
            }
        }
        // 如果找到了单一产品解，并且约束不是很严格，返回最便宜的单一产品
        if (bestSolution && singleProductSolutions.length > 1) {
            return bestSolution;
        }
        // 尝试两产品组合
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const result = this.tryTwoProductMix(products[i], products[j], constraints);
                if (result && result.totalCost < bestCost) {
                    bestCost = result.totalCost;
                    bestSolution = result;
                }
            }
        }
        if (bestSolution) {
            return bestSolution;
        }
        // 如果都找不到解，返回不可行
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
    tryTwoProductMix(p1, p2, constraints) {
        // 对于两产品混合，我们需要找到最优比例
        // 设p1的比例为r，p2的比例为(1-r)，其中0 <= r <= 1
        let bestRatio = -1;
        let bestCost = Infinity;
        // 简单网格搜索
        for (let r = 0; r <= 1; r += 0.01) {
            const r1 = r;
            const r2 = 1 - r;
            // 计算混合属性
            const sulfur = p1.sulfur * r1 + p2.sulfur * r2;
            const ash = p1.ash * r1 + p2.ash * r2;
            const volatile = p1.volatile * r1 + p2.volatile * r2;
            const vanadium = p1.vanadium * r1 + p2.vanadium * r2;
            const cost = p1.price * r1 + p2.price * r2;
            // 检查约束
            if (sulfur <= constraints.sulfur &&
                ash <= constraints.ash &&
                volatile <= constraints.volatile &&
                vanadium <= constraints.vanadium) {
                if (cost < bestCost) {
                    bestCost = cost;
                    bestRatio = r;
                }
            }
        }
        if (bestRatio >= 0) {
            const r1 = bestRatio;
            const r2 = 1 - bestRatio;
            const mixedProperties = {
                sulfur: Number((p1.sulfur * r1 + p2.sulfur * r2).toFixed(3)),
                ash: Number((p1.ash * r1 + p2.ash * r2).toFixed(3)),
                volatile: Number((p1.volatile * r1 + p2.volatile * r2).toFixed(3)),
                vanadium: Number((p1.vanadium * r1 + p2.vanadium * r2).toFixed(1)),
                price: Number(bestCost.toFixed(2))
            };
            const productsInSolution = [];
            if (r1 > 0.001)
                productsInSolution.push({ product: p1, ratio: r1 });
            if (r2 > 0.001)
                productsInSolution.push({ product: p2, ratio: r2 });
            return {
                products: productsInSolution,
                mixedProperties,
                totalCost: bestCost,
                summary: {
                    productCount: productsInSolution.length,
                    totalRatio: r1 + r2,
                    constraintsSatisfied: {
                        sulfur: mixedProperties.sulfur <= constraints.sulfur,
                        ash: mixedProperties.ash <= constraints.ash,
                        volatile: mixedProperties.volatile <= constraints.volatile,
                        vanadium: mixedProperties.vanadium <= constraints.vanadium
                    }
                },
                feasible: true
            };
        }
        return null;
    }
}
exports.SimpleOptimizer = SimpleOptimizer;
