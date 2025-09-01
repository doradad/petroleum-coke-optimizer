"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectSearchOptimizer = void 0;
/**
 * 直接搜索优化器
 * 使用网格搜索和随机搜索组合来找到最优解
 * 虽然不如线性规划精确，但对石油焦掺配问题足够有效
 */
class DirectSearchOptimizer {
    optimize(products, constraints) {
        const n = products.length;
        if (n === 0) {
            throw new Error('没有产品数据');
        }
        console.log(`开始优化 ${n} 个产品...`);
        let bestSolution = [];
        let bestCost = Infinity;
        let bestResult = null;
        // 方法1: 枚举所有单一产品解
        const singleProductResults = this.trySingleProducts(products, constraints);
        for (const result of singleProductResults) {
            if (result.totalCost < bestCost) {
                bestCost = result.totalCost;
                bestResult = result;
            }
        }
        // 方法2: 尝试主要的两产品组合
        const twoProductResults = this.tryTwoProductCombinations(products, constraints, 5); // 只尝试前5便宜的
        for (const result of twoProductResults) {
            if (result.totalCost < bestCost) {
                bestCost = result.totalCost;
                bestResult = result;
            }
        }
        // 方法3: 尝试三产品组合（如果产品数量足够）
        if (n >= 3) {
            const threeProductResults = this.tryThreeProductCombinations(products, constraints, 3);
            for (const result of threeProductResults) {
                if (result.totalCost < bestCost) {
                    bestCost = result.totalCost;
                    bestResult = result;
                }
            }
        }
        // 方法4: 随机搜索（针对更多产品的组合）
        const randomIterations = Math.min(8000, n * 300); // 增加随机搜索迭代次数
        const randomResults = this.randomSearch(products, constraints, randomIterations);
        for (const result of randomResults) {
            if (result.totalCost < bestCost) {
                bestCost = result.totalCost;
                bestResult = result;
            }
        }
        // 方法4.5: 新增 - 针对三产品组合的专门随机搜索
        if (n >= 3) {
            const specialThreeProductSearch = this.specialThreeProductRandomSearch(products, constraints, Math.min(3000, n * 150));
            for (const result of specialThreeProductSearch) {
                if (result.totalCost < bestCost) {
                    bestCost = result.totalCost;
                    bestResult = result;
                }
            }
        }
        // 方法5: 智能四产品组合搜索（如果有改进空间）
        if (n >= 4 && bestResult) {
            const fourProductResults = this.tryFourProductCombinations(products, constraints, bestCost);
            for (const result of fourProductResults) {
                if (result.totalCost < bestCost) {
                    bestCost = result.totalCost;
                    bestResult = result;
                }
            }
        }
        if (bestResult) {
            console.log(`找到最优解: 成本 ${bestCost.toFixed(2)}, 产品数量 ${bestResult.products.length}`);
            return bestResult;
        }
        return this.createInfeasibleResult();
    }
    trySingleProducts(products, constraints) {
        const results = [];
        for (const product of products) {
            if (this.satisfiesConstraints([1], [product], constraints)) {
                const result = {
                    products: [{ product, ratio: 1.0 }],
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
                results.push(result);
            }
        }
        return results;
    }
    tryTwoProductCombinations(products, constraints, maxProducts) {
        const results = [];
        const sortedProducts = products.slice().sort((a, b) => a.price - b.price);
        const topProducts = sortedProducts.slice(0, Math.min(maxProducts, products.length));
        for (let i = 0; i < topProducts.length; i++) {
            for (let j = i + 1; j < topProducts.length; j++) {
                const result = this.optimizeTwoProducts(topProducts[i], topProducts[j], constraints);
                if (result) {
                    results.push(result);
                }
            }
        }
        return results;
    }
    tryThreeProductCombinations(products, constraints, maxProducts) {
        const results = [];
        // 策略1: 全面搜索最便宜的产品组合 (扩大搜索范围)
        const sortedByPrice = products.slice().sort((a, b) => a.price - b.price);
        const cheapProducts = sortedByPrice.slice(0, Math.min(15, products.length)); // 增加到15个产品
        for (let i = 0; i < cheapProducts.length && i < 12; i++) { // 增加循环范围
            for (let j = i + 1; j < cheapProducts.length && j < 13; j++) {
                for (let k = j + 1; k < cheapProducts.length && k < 15; k++) {
                    const result = this.optimizeThreeProducts(cheapProducts[i], cheapProducts[j], cheapProducts[k], constraints);
                    if (result) {
                        results.push(result);
                    }
                }
            }
        }
        // 策略2: 尝试质量参数互补的产品组合 (放宽筛选条件)
        const lowSulfur = products.filter(p => p.sulfur < constraints.sulfur * 0.8).sort((a, b) => a.price - b.price).slice(0, 8); // 放宽到0.8倍，增加到8个
        const lowAsh = products.filter(p => p.ash < constraints.ash * 0.8).sort((a, b) => a.price - b.price).slice(0, 8);
        const lowVanadium = products.filter(p => p.vanadium < constraints.vanadium * 0.8).sort((a, b) => a.price - b.price).slice(0, 8);
        // 尝试低硫+低灰+低钒的组合 (增加搜索数量)
        for (const p1 of lowSulfur.slice(0, 6)) { // 增加到6个
            for (const p2 of lowAsh.slice(0, 6)) {
                for (const p3 of lowVanadium.slice(0, 6)) {
                    if (p1.id !== p2.id && p2.id !== p3.id && p1.id !== p3.id) {
                        const result = this.optimizeThreeProducts(p1, p2, p3, constraints);
                        if (result) {
                            results.push(result);
                        }
                    }
                }
            }
        }
        // 策略3: 新增 - 混合价格和质量的智能搜索
        // 选择一些价格适中但质量很好的产品进行组合
        const balancedProducts = products.slice().sort((a, b) => {
            // 综合评分：价格权重0.6，质量权重0.4
            const scoreA = a.price * 0.6 + (a.sulfur + a.ash * 10 + a.vanadium / 50) * 0.4;
            const scoreB = b.price * 0.6 + (b.sulfur + b.ash * 10 + b.vanadium / 50) * 0.4;
            return scoreA - scoreB;
        }).slice(0, 12);
        for (let i = 0; i < balancedProducts.length && i < 8; i++) {
            for (let j = i + 1; j < balancedProducts.length && j < 10; j++) {
                for (let k = j + 1; k < balancedProducts.length && k < 12; k++) {
                    const result = this.optimizeThreeProducts(balancedProducts[i], balancedProducts[j], balancedProducts[k], constraints);
                    if (result) {
                        results.push(result);
                    }
                }
            }
        }
        return results;
    }
    optimizeTwoProducts(p1, p2, constraints) {
        let bestRatio = -1;
        let bestCost = Infinity;
        // 网格搜索最优比例
        for (let r1 = 0; r1 <= 1; r1 += 0.01) {
            const r2 = 1 - r1;
            const ratios = [r1, r2];
            const testProducts = [p1, p2];
            if (this.satisfiesConstraints(ratios, testProducts, constraints)) {
                const cost = p1.price * r1 + p2.price * r2;
                if (cost < bestCost) {
                    bestCost = cost;
                    bestRatio = r1;
                }
            }
        }
        if (bestRatio >= 0) {
            return this.createResult([p1, p2], [bestRatio, 1 - bestRatio], constraints);
        }
        return null;
    }
    optimizeThreeProducts(p1, p2, p3, constraints) {
        let bestRatios = [-1, -1, -1];
        let bestCost = Infinity;
        // 粗搜索 (步长0.05 - 提高精度)
        for (let r1 = 0; r1 <= 1; r1 += 0.05) {
            for (let r2 = 0; r2 <= 1 - r1; r2 += 0.05) {
                const r3 = 1 - r1 - r2;
                if (r3 < 0)
                    continue;
                const ratios = [r1, r2, r3];
                const testProducts = [p1, p2, p3];
                if (this.satisfiesConstraints(ratios, testProducts, constraints)) {
                    const cost = p1.price * r1 + p2.price * r2 + p3.price * r3;
                    if (cost < bestCost) {
                        bestCost = cost;
                        bestRatios = [r1, r2, r3];
                    }
                }
            }
        }
        // 如果找到粗略解，进行精细搜索
        if (bestRatios[0] >= 0) {
            const coarseRatios = [...bestRatios];
            // 在粗略解周围进行精细搜索 (步长0.005 - 更高精度)
            const searchRadius = 0.2; // 增大搜索半径
            for (let dr1 = -searchRadius; dr1 <= searchRadius; dr1 += 0.005) {
                for (let dr2 = -searchRadius; dr2 <= searchRadius; dr2 += 0.005) {
                    const r1 = Math.max(0, Math.min(1, coarseRatios[0] + dr1));
                    const r2 = Math.max(0, Math.min(1 - r1, coarseRatios[1] + dr2));
                    const r3 = 1 - r1 - r2;
                    if (r3 < 0 || r3 > 1)
                        continue;
                    const ratios = [r1, r2, r3];
                    const testProducts = [p1, p2, p3];
                    if (this.satisfiesConstraints(ratios, testProducts, constraints)) {
                        const cost = p1.price * r1 + p2.price * r2 + p3.price * r3;
                        if (cost < bestCost) {
                            bestCost = cost;
                            bestRatios = [r1, r2, r3];
                        }
                    }
                }
            }
            return this.createResult([p1, p2, p3], bestRatios, constraints);
        }
        return null;
    }
    tryFourProductCombinations(products, constraints, currentBest) {
        const results = [];
        // 只尝试最有希望的4产品组合
        const sortedProducts = products.slice().sort((a, b) => a.price - b.price);
        const topProducts = sortedProducts.slice(0, Math.min(6, products.length));
        for (let i = 0; i < topProducts.length - 3; i++) {
            for (let j = i + 1; j < topProducts.length - 2; j++) {
                for (let k = j + 1; k < topProducts.length - 1; k++) {
                    for (let l = k + 1; l < topProducts.length; l++) {
                        // 快速预检：理论最低成本是否有希望
                        const minPossibleCost = Math.min(topProducts[i].price, topProducts[j].price, topProducts[k].price, topProducts[l].price);
                        if (minPossibleCost >= currentBest)
                            continue;
                        const result = this.optimizeFourProducts(topProducts[i], topProducts[j], topProducts[k], topProducts[l], constraints);
                        if (result && result.totalCost < currentBest) {
                            results.push(result);
                        }
                    }
                }
            }
        }
        return results;
    }
    optimizeFourProducts(p1, p2, p3, p4, constraints) {
        let bestRatios = [-1, -1, -1, -1];
        let bestCost = Infinity;
        // 粗网格搜索 (步长0.2)
        for (let r1 = 0; r1 <= 1; r1 += 0.2) {
            for (let r2 = 0; r2 <= 1 - r1; r2 += 0.2) {
                for (let r3 = 0; r3 <= 1 - r1 - r2; r3 += 0.2) {
                    const r4 = 1 - r1 - r2 - r3;
                    if (r4 < 0)
                        continue;
                    const ratios = [r1, r2, r3, r4];
                    const testProducts = [p1, p2, p3, p4];
                    if (this.satisfiesConstraints(ratios, testProducts, constraints)) {
                        const cost = p1.price * r1 + p2.price * r2 + p3.price * r3 + p4.price * r4;
                        if (cost < bestCost) {
                            bestCost = cost;
                            bestRatios = [r1, r2, r3, r4];
                        }
                    }
                }
            }
        }
        if (bestRatios[0] >= 0) {
            return this.createResult([p1, p2, p3, p4], bestRatios, constraints);
        }
        return null;
    }
    randomSearch(products, constraints, iterations) {
        const results = [];
        const n = products.length;
        for (let iter = 0; iter < iterations; iter++) {
            // 随机生成比例
            const ratios = this.generateRandomRatios(n);
            if (this.satisfiesConstraints(ratios, products, constraints)) {
                const cost = ratios.reduce((sum, ratio, i) => sum + ratio * products[i].price, 0);
                const result = this.createResult(products, ratios, constraints);
                results.push(result);
            }
        }
        return results;
    }
    generateRandomRatios(n) {
        // 生成随机比例，确保总和为1
        const ratios = Array(n).fill(0).map(() => Math.random());
        const sum = ratios.reduce((s, r) => s + r, 0);
        return ratios.map(r => r / sum);
    }
    satisfiesConstraints(ratios, products, constraints) {
        let sulfur = 0, ash = 0, volatile = 0, vanadium = 0;
        for (let i = 0; i < ratios.length; i++) {
            const ratio = ratios[i];
            if (ratio < 0)
                return false;
            sulfur += products[i].sulfur * ratio;
            ash += products[i].ash * ratio;
            volatile += products[i].volatile * ratio;
            vanadium += products[i].vanadium * ratio;
        }
        return sulfur <= constraints.sulfur + 1e-6 &&
            ash <= constraints.ash + 1e-6 &&
            volatile <= constraints.volatile + 1e-6 &&
            vanadium <= constraints.vanadium + 1e-6;
    }
    createResult(products, ratios, constraints) {
        const filteredProducts = products
            .map((product, index) => ({ product, ratio: ratios[index] }))
            .filter(item => item.ratio > 1e-6)
            .sort((a, b) => b.ratio - a.ratio);
        const mixedProperties = this.calculateMixedProperties(products, ratios);
        const totalCost = ratios.reduce((sum, ratio, i) => sum + ratio * products[i].price, 0);
        return {
            products: filteredProducts,
            mixedProperties,
            totalCost,
            summary: {
                productCount: filteredProducts.length,
                totalRatio: ratios.reduce((sum, r) => sum + r, 0),
                constraintsSatisfied: {
                    sulfur: mixedProperties.sulfur <= constraints.sulfur + 1e-6,
                    ash: mixedProperties.ash <= constraints.ash + 1e-6,
                    volatile: mixedProperties.volatile <= constraints.volatile + 1e-6,
                    vanadium: mixedProperties.vanadium <= constraints.vanadium + 1e-6
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
    // 专门针对三产品组合的随机搜索
    specialThreeProductRandomSearch(products, constraints, iterations) {
        const results = [];
        const n = products.length;
        for (let iter = 0; iter < iterations; iter++) {
            // 随机选择3个不同的产品
            const indices = this.selectRandomThreeProducts(n);
            const selectedProducts = indices.map(i => products[i]);
            // 生成随机比例 - 使用Dirichlet分布来生成更均匀的比例
            const ratios = this.generateDirichletRatios(3);
            if (this.satisfiesConstraints(ratios, selectedProducts, constraints)) {
                const result = this.createResult(selectedProducts, ratios, constraints);
                results.push(result);
            }
        }
        return results;
    }
    selectRandomThreeProducts(n) {
        const indices = [];
        while (indices.length < 3) {
            const randomIndex = Math.floor(Math.random() * n);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }
        return indices.sort((a, b) => a - b);
    }
    // 生成Dirichlet分布的随机比例（更均匀分布）
    generateDirichletRatios(k) {
        const alpha = 1; // Dirichlet参数
        const gammas = [];
        // 生成Gamma分布随机数
        for (let i = 0; i < k; i++) {
            gammas.push(this.generateGamma(alpha, 1));
        }
        const sum = gammas.reduce((a, b) => a + b, 0);
        return gammas.map(g => g / sum);
    }
    // 简化的Gamma分布生成（使用Marsaglia-Tsang方法的简化版）
    generateGamma(alpha, beta) {
        if (alpha < 1) {
            return this.generateGamma(alpha + 1, beta) * Math.pow(Math.random(), 1 / alpha);
        }
        const d = alpha - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            let x, v;
            do {
                x = this.gaussianRandom();
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            const u = Math.random();
            if (u < 1 - 0.0331 * x * x * x * x) {
                return d * v / beta;
            }
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
                return d * v / beta;
            }
        }
    }
    // Box-Muller变换生成高斯随机数
    gaussianRandom() {
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random(); // 避免log(0)
        while (v === 0)
            v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
}
exports.DirectSearchOptimizer = DirectSearchOptimizer;
