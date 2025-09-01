import { Matrix } from 'ml-matrix';

export class SimplexSolver {
  private tableau!: Matrix;
  private basicVars: number[];
  private numVars: number;
  private numConstraints: number;

  constructor(c: number[], A: number[][], b: number[]) {
    this.numVars = c.length;
    this.numConstraints = b.length;
    
    // 构建单纯形表
    this.buildTableau(c, A, b);
    this.basicVars = [];
    
    // 初始化基变量（松弛变量）
    for (let i = 0; i < this.numConstraints; i++) {
      this.basicVars.push(this.numVars + i);
    }
  }

  private buildTableau(c: number[], A: number[][], b: number[]): void {
    // 单纯形表格式：
    // [ A | I | b ]
    // [-c | 0 | 0 ]
    
    const rows = this.numConstraints + 1;
    const cols = this.numVars + this.numConstraints + 1;
    
    const tableauData = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    // 填入约束矩阵A
    for (let i = 0; i < this.numConstraints; i++) {
      for (let j = 0; j < this.numVars; j++) {
        tableauData[i][j] = A[i][j];
      }
    }
    
    // 填入单位矩阵I（松弛变量）
    for (let i = 0; i < this.numConstraints; i++) {
      tableauData[i][this.numVars + i] = 1;
    }
    
    // 填入右端向量b
    for (let i = 0; i < this.numConstraints; i++) {
      tableauData[i][cols - 1] = b[i];
    }
    
    // 填入目标函数（取负数，因为要最小化）
    for (let j = 0; j < this.numVars; j++) {
      tableauData[this.numConstraints][j] = -c[j];
    }
    
    this.tableau = new Matrix(tableauData);
  }

  solve(): { solution: number[]; value: number; feasible: boolean } {
    let iterations = 0;
    const maxIterations = 1000;

    while (iterations < maxIterations) {
      // 选择入基变量（最负的系数）
      const enteringVar = this.choosePivotColumn();
      if (enteringVar === -1) {
        // 达到最优解
        return this.extractSolution();
      }

      // 选择出基变量（比值测试）
      const leavingVar = this.choosePivotRow(enteringVar);
      if (leavingVar === -1) {
        // 无界解
        return { solution: [], value: -Infinity, feasible: false };
      }

      // 主元操作
      this.pivot(leavingVar, enteringVar);
      this.basicVars[leavingVar] = enteringVar;
      
      iterations++;
    }

    return { solution: [], value: 0, feasible: false };
  }

  private choosePivotColumn(): number {
    const lastRow = this.tableau.rows - 1;
    let minValue = 0;
    let pivotCol = -1;

    for (let j = 0; j < this.numVars + this.numConstraints; j++) {
      const value = this.tableau.get(lastRow, j);
      if (value < minValue) {
        minValue = value;
        pivotCol = j;
      }
    }

    return pivotCol;
  }

  private choosePivotRow(pivotCol: number): number {
    let minRatio = Infinity;
    let pivotRow = -1;
    const rhsCol = this.tableau.columns - 1;

    for (let i = 0; i < this.numConstraints; i++) {
      const aij = this.tableau.get(i, pivotCol);
      if (aij > 0) {
        const ratio = this.tableau.get(i, rhsCol) / aij;
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    return pivotRow;
  }

  private pivot(pivotRow: number, pivotCol: number): void {
    const pivotElement = this.tableau.get(pivotRow, pivotCol);
    
    // 标准化主元行
    for (let j = 0; j < this.tableau.columns; j++) {
      this.tableau.set(pivotRow, j, this.tableau.get(pivotRow, j) / pivotElement);
    }

    // 消除其他行
    for (let i = 0; i < this.tableau.rows; i++) {
      if (i !== pivotRow) {
        const factor = this.tableau.get(i, pivotCol);
        for (let j = 0; j < this.tableau.columns; j++) {
          const newValue = this.tableau.get(i, j) - factor * this.tableau.get(pivotRow, j);
          this.tableau.set(i, j, newValue);
        }
      }
    }
  }

  private extractSolution(): { solution: number[]; value: number; feasible: boolean } {
    const solution = Array(this.numVars).fill(0);
    const rhsCol = this.tableau.columns - 1;
    const lastRow = this.tableau.rows - 1;

    // 提取基变量的值
    for (let i = 0; i < this.numConstraints; i++) {
      const basicVar = this.basicVars[i];
      if (basicVar < this.numVars) {
        solution[basicVar] = this.tableau.get(i, rhsCol);
      }
    }

    // 目标函数值
    const value = this.tableau.get(lastRow, rhsCol);

    return { solution, value, feasible: true };
  }
}