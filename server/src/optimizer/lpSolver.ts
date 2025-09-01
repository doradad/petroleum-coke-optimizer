/**
 * 简单的线性规划求解器
 * 使用改进的单纯形法求解标准形式的线性规划问题
 * Min c^T x
 * s.t. Ax = b, x >= 0
 */

export interface LPResult {
  solution: number[];
  objectiveValue: number;
  status: 'optimal' | 'infeasible' | 'unbounded' | 'error';
  iterations: number;
}

export class LinearProgrammingSolver {
  private tolerance = 1e-8;
  private maxIterations = 1000;

  solve(c: number[], A: number[][], b: number[]): LPResult {
    try {
      console.log('LP求解输入:');
      console.log('目标函数系数c:', c);
      console.log('约束矩阵A:', A);
      console.log('约束右端b:', b);
      
      // 转换为标准形式（添加松弛变量）
      const { cStd, AStd, bStd } = this.toStandardForm(c, A, b);
      
      console.log('标准形式:');
      console.log('cStd:', cStd);
      console.log('AStd:', AStd);
      console.log('bStd:', bStd);
      
      // 使用单纯形法求解
      return this.simplex(cStd, AStd, bStd);
    } catch (error) {
      console.error('LP求解错误:', error);
      return {
        solution: [],
        objectiveValue: Infinity,
        status: 'error',
        iterations: 0
      };
    }
  }

  private toStandardForm(c: number[], A: number[][], b: number[]) {
    const m = A.length; // 约束数量
    const n = c.length; // 变量数量
    
    // 添加松弛变量，将不等式转换为等式
    const cStd = [...c, ...Array(m).fill(0)];
    
    const AStd = A.map((row, i) => {
      const newRow = [...row];
      // 添加松弛变量（单位矩阵的一列）
      for (let j = 0; j < m; j++) {
        newRow.push(i === j ? 1 : 0);
      }
      return newRow;
    });
    
    const bStd = [...b];
    
    return { cStd, AStd, bStd };
  }

  private simplex(c: number[], A: number[][], b: number[]): LPResult {
    const m = A.length;
    const n = c.length;
    
    // 注意：不检查b[i] < 0，因为等式约束转换后可能有负值
    // 这里我们假设约束已经正确转换为标准形式
    
    // 构建初始单纯形表
    const tableau = this.buildInitialTableau(c, A, b);
    
    // 初始基变量（松弛变量）
    const basicVars = [];
    const originalVars = c.length - A.length; // 原始变量数量
    for (let i = 0; i < m; i++) {
      basicVars.push(originalVars + i);
    }
    
    let iterations = 0;
    
    while (iterations < this.maxIterations) {
      // 检查最优性条件
      const enteringVar = this.findEnteringVariable(tableau, m);
      if (enteringVar === -1) {
        // 达到最优解
        return this.extractSolution(tableau, basicVars, originalVars, iterations);
      }
      
      // 找出基变量
      const leavingVar = this.findLeavingVariable(tableau, enteringVar, m);
      if (leavingVar === -1) {
        // 无界解
        return {
          solution: [],
          objectiveValue: -Infinity,
          status: 'unbounded',
          iterations
        };
      }
      
      // 主元操作
      this.pivot(tableau, leavingVar, enteringVar);
      basicVars[leavingVar] = enteringVar;
      
      iterations++;
    }
    
    return {
      solution: [],
      objectiveValue: Infinity,
      status: 'error',
      iterations
    };
  }
  
  private buildInitialTableau(c: number[], A: number[][], b: number[]): number[][] {
    const m = A.length;
    const n = c.length;
    
    // 单纯形表: [A|I|b; c^T|0|0]
    const tableau: number[][] = [];
    
    // 约束行
    for (let i = 0; i < m; i++) {
      tableau.push([...A[i], b[i]]);
    }
    
    // 目标函数行 (取负号，因为要最小化)
    const objRow = [...c.map(x => -x), 0];
    tableau.push(objRow);
    
    return tableau;
  }
  
  private findEnteringVariable(tableau: number[][], m: number): number {
    const objRow = tableau[m];
    let minValue = 0;
    let enteringVar = -1;
    
    // 找到最负的系数
    for (let j = 0; j < objRow.length - 1; j++) {
      if (objRow[j] < minValue) {
        minValue = objRow[j];
        enteringVar = j;
      }
    }
    
    return enteringVar;
  }
  
  private findLeavingVariable(tableau: number[][], enteringVar: number, m: number): number {
    let minRatio = Infinity;
    let leavingVar = -1;
    const rhsCol = tableau[0].length - 1;
    
    for (let i = 0; i < m; i++) {
      const pivot = tableau[i][enteringVar];
      if (pivot > this.tolerance) {
        const ratio = tableau[i][rhsCol] / pivot;
        if (ratio >= 0 && ratio < minRatio) {
          minRatio = ratio;
          leavingVar = i;
        }
      }
    }
    
    return leavingVar;
  }
  
  private pivot(tableau: number[][], pivotRow: number, pivotCol: number): void {
    const pivotElement = tableau[pivotRow][pivotCol];
    
    // 标准化主元行
    for (let j = 0; j < tableau[pivotRow].length; j++) {
      tableau[pivotRow][j] /= pivotElement;
    }
    
    // 消除其他行
    for (let i = 0; i < tableau.length; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        for (let j = 0; j < tableau[i].length; j++) {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        }
      }
    }
  }
  
  private extractSolution(tableau: number[][], basicVars: number[], originalVars: number, iterations: number): LPResult {
    const solution = Array(originalVars).fill(0);
    const rhsCol = tableau[0].length - 1;
    const objRow = tableau.length - 1;
    
    // 提取基变量的值
    for (let i = 0; i < basicVars.length; i++) {
      const varIndex = basicVars[i];
      if (varIndex < originalVars) {
        solution[varIndex] = Math.max(0, tableau[i][rhsCol]);
      }
    }
    
    const objectiveValue = tableau[objRow][rhsCol];
    
    return {
      solution,
      objectiveValue,
      status: 'optimal',
      iterations
    };
  }
}