"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedOptimizer = void 0;
const simpleLPSolver_1 = require("./simpleLPSolver");
const linearProgrammingOptimizer_1 = require("./linearProgrammingOptimizer");
const directSearchOptimizer_1 = require("./directSearchOptimizer");
class AdvancedOptimizer {
    constructor() {
        this.simpleLPSolver = new simpleLPSolver_1.SimpleLPSolver(); // 新的主要求解器
        this.linearProgrammingOptimizer = new linearProgrammingOptimizer_1.LinearProgrammingOptimizer(); // 备用
        this.directSearchOptimizer = new directSearchOptimizer_1.DirectSearchOptimizer(); // 备用
    }
    optimize(products, constraints) {
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
        }
        catch (error) {
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
    buildLinearProgram(products, constraints) {
        const n = products.length;
        // 目标函数：最小化成本
        const c = products.map(p => p.price);
        // 约束矩阵和右端向量
        const A = [];
        const b = [];
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
    calculateMixedProperties(products, ratios) {
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
    createInfeasibleResult() {
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
    validateConstraints(products, constraints) {
        return this.linearProgrammingOptimizer.validateConstraints(products, constraints);
    }
}
exports.AdvancedOptimizer = AdvancedOptimizer;
