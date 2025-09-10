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
  summary: {
    productCount: number;
    totalRatio: number;
    constraintsSatisfied: {
      sulfur: boolean;
      ash: boolean;
      volatile: boolean;
      vanadium: boolean;
    };
  };
}

// TOP5优化结果类型
export interface Top5OptimizationResult {
  rank: number;
  result: OptimizationResult;
}

// TOP5响应类型
export interface Top5Response {
  success: boolean;
  count: number;
  results: Top5OptimizationResult[];
  constraints: Constraints;
}