"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetroleumCokeOptimizer = void 0;
const advancedOptimizer_1 = require("./advancedOptimizer");
class PetroleumCokeOptimizer {
    constructor() {
        this.advancedOptimizer = new advancedOptimizer_1.AdvancedOptimizer();
    }
    optimize(products, constraints) {
        try {
            return this.advancedOptimizer.optimize(products, constraints);
        }
        catch (error) {
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
    // 暴露约束验证功能
    validateConstraints(products, constraints) {
        return this.advancedOptimizer.validateConstraints(products, constraints);
    }
}
exports.PetroleumCokeOptimizer = PetroleumCokeOptimizer;
exports.default = new PetroleumCokeOptimizer();
