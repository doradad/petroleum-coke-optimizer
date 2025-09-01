export interface Product {
  id: string;
  name: string;
  sulfur: number;    // S(%)
  ash: number;       // A(%)
  volatile: number;  // V(%)
  vanadium: number;  // 钒含量(ppm)
  price: number;     // 价格
}

export interface Constraints {
  sulfur: number;    // S(%) 上限
  ash: number;       // A(%) 上限
  volatile: number;  // V(%) 上限
  vanadium: number;  // 钒含量(ppm) 上限
}

export interface OptimizationResult {
  products: Array<{
    product: Product;
    ratio: number;    // 掺配比例
  }>;
  mixedProperties: {
    sulfur: number;
    ash: number;
    volatile: number;
    vanadium: number;
    price: number;
  };
  totalCost: number;
  summary?: {
    productCount: number;
    totalRatio: number;
    constraintsSatisfied: {
      sulfur: boolean;
      ash: boolean;
      volatile: boolean;
      vanadium: boolean;
    };
  };
  feasible: boolean;
}

export interface LinearProgrammingProblem {
  c: number[];      // 目标函数系数
  A: number[][];    // 约束矩阵
  b: number[];      // 约束右端值
  bounds?: Array<[number, number]>; // 变量界限
}