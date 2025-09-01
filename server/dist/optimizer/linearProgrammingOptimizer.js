"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearProgrammingOptimizer = void 0;
const lpSolver_1 = require("./lpSolver");
/**
 * 标准线性规划优化器
 * 将石油焦掺配问题正确建模为线性规划问题并求解
 */
class LinearProgrammingOptimizer {
    constructor() {
        this.solver = new lpSolver_1.LinearProgrammingSolver();
    }
    optimize(products, constraints) {
        const n = products.length;
        if (n === 0) {
            throw new Error('没有产品数据');
        }
        console.log(`使用线性规划优化 ${n} 个产品...`);
        console.log('约束条件:', constraints);
        // 构建线性规划问题
        const { c, A, b } = this.buildLPProblem(products, constraints);
        // 求解线性规划
        const lpResult = this.solver.solve(c, A, b);
        console.log('LP求解结果:', {
            status: lpResult.status,
            objectiveValue: lpResult.objectiveValue,
            iterations: lpResult.iterations
        });
        if (lpResult.status === 'optimal') {
            return this.createOptimalResult(products, lpResult.solution, constraints);
        }
        else {
            return this.createInfeasibleResult();
        }
    }
    /**
     * 构建线性规划问题
     * 目标函数：Min Σ(Price_i × x_i)
     * 约束条件：
     * 1. Σ(S_i × x_i) ≤ S_max
     * 2. Σ(A_i × x_i) ≤ A_max
     * 3. Σ(V_i × x_i) ≤ V_max
     * 4. Σ(Vanadium_i × x_i) ≤ Vanadium_max
     * 5. Σ(x_i) = 1  (等式约束转换为两个不等式)
     * 6. x_i ≥ 0
     */
    buildLPProblem(products, constraints) {
        const n = products.length;
        // 目标函数系数：产品价格
        const c = products.map(p => p.price);
        // 约束矩阵和右端向量
        const A = [];
        const b = [];
        // 约束1: 硫含量 ≤ 上限
        A.push(products.map(p => p.sulfur));
        b.push(constraints.sulfur);
        // 约束2: 灰分 ≤ 上限
        A.push(products.map(p => p.ash));
        b.push(constraints.ash);
        // 约束3: 挥发分 ≤ 上限
        A.push(products.map(p => p.volatile));
        b.push(constraints.volatile);
        // 约束4: 钒含量 ≤ 上限
        A.push(products.map(p => p.vanadium));
        b.push(constraints.vanadium);
        // 约束5a: 总比例 ≤ 1
        A.push(products.map(() => 1));
        b.push(1);
        // 约束5b: 总比例 ≥ 1 -> -总比例 ≤ -1
        A.push(products.map(() => -1));
        b.push(-1);
        console.log('构建的LP问题:');
        console.log('变量数量:', n);
        console.log('约束数量:', A.length);
        console.log('目标函数c:', c);
        console.log('约束矩阵A:', A);
        console.log('约束右端b:', b);
        return { c, A, b };
    }
    createOptimalResult(products, solution, constraints) {
        const n = products.length;
        const tolerance = 1e-6;
        // 过滤掉比例极小的产品
        const resultProducts = [];
        for (let i = 0; i < n; i++) {
            if (solution[i] > tolerance) {
                resultProducts.push({
                    product: products[i],
                    ratio: Number(solution[i].toFixed(6))
                });
            }
        }
        // 计算混合属性
        const mixedProperties = this.calculateMixedProperties(products, solution);
        // 计算总成本
        const totalCost = products.reduce((sum, product, i) => sum + product.price * solution[i], 0);
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
        const violations = [];
        // 检查是否有产品能满足约束
        const minSulfur = Math.min(...products.map(p => p.sulfur));
        const minAsh = Math.min(...products.map(p => p.ash));
        const minVolatile = Math.min(...products.map(p => p.volatile));
        const minVanadium = Math.min(...products.map(p => p.vanadium));
        if (minSulfur > constraints.sulfur) {
            violations.push(`硫含量约束过严：最低硫含量${minSulfur}%超过约束${constraints.sulfur}%`);
        }
        if (minAsh > constraints.ash) {
            violations.push(`灰分约束过严：最低灰分${minAsh}%超过约束${constraints.ash}%`);
        }
        if (minVolatile > constraints.volatile) {
            violations.push(`挥发分约束过严：最低挥发分${minVolatile}%超过约束${constraints.volatile}%`);
        }
        if (minVanadium > constraints.vanadium) {
            violations.push(`钒含量约束过严：最低钒含量${minVanadium}ppm超过约束${constraints.vanadium}ppm`);
        }
        return {
            feasible: violations.length === 0,
            violations
        };
    }
}
exports.LinearProgrammingOptimizer = LinearProgrammingOptimizer;
