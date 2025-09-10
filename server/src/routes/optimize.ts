import { Router } from 'express';
import { Product, Constraints } from '../types';
import optimizer from '../optimizer';
import database from '../database';

const router = Router();

// 优化接口
router.post('/optimize', async (req, res) => {
  try {
    const { constraints } = req.body as { constraints: Constraints };
    
    if (!constraints) {
      return res.status(400).json({ error: '缺少约束条件' });
    }

    // 验证约束条件
    if (constraints.sulfur <= 0 || constraints.ash <= 0 || 
        constraints.volatile <= 0 || constraints.vanadium <= 0) {
      return res.status(400).json({ error: '约束条件必须为正数' });
    }

    // 获取所有产品
    const products = await database.getAllProducts();
    
    if (products.length === 0) {
      return res.status(400).json({ error: '没有产品数据，请先上传产品清单' });
    }

    // 验证约束可行性
    const validation = optimizer.validateConstraints(products, constraints);
    if (!validation.feasible) {
      return res.status(400).json({ 
        error: '约束条件无法满足', 
        violations: validation.violations 
      });
    }

    // 执行优化
    const result = optimizer.optimize(products, constraints);
    
    if (!result.feasible) {
      return res.status(400).json({ 
        error: '无法找到可行解，请放宽约束条件' 
      });
    }

    res.json({
      success: true,
      result: {
        products: result.products,
        mixedProperties: result.mixedProperties,
        totalCost: result.totalCost,
        summary: {
          productCount: result.products.length,
          totalRatio: result.products.reduce((sum, p) => sum + p.ratio, 0),
          constraintsSatisfied: {
            sulfur: result.mixedProperties.sulfur <= constraints.sulfur,
            ash: result.mixedProperties.ash <= constraints.ash,
            volatile: result.mixedProperties.volatile <= constraints.volatile,
            vanadium: result.mixedProperties.vanadium <= constraints.vanadium
          }
        }
      }
    });

  } catch (error) {
    console.error('优化计算错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// TOP5优化接口
router.post('/optimize-top5', async (req, res) => {
  try {
    const { constraints } = req.body as { constraints: Constraints };
    
    if (!constraints) {
      return res.status(400).json({ error: '缺少约束条件' });
    }

    // 验证约束条件
    if (constraints.sulfur <= 0 || constraints.ash <= 0 || 
        constraints.volatile <= 0 || constraints.vanadium <= 0) {
      return res.status(400).json({ error: '约束条件必须为正数' });
    }

    // 获取所有产品
    const products = await database.getAllProducts();
    
    if (products.length === 0) {
      return res.status(400).json({ error: '没有产品数据，请先上传产品清单' });
    }

    // 验证约束可行性
    const validation = optimizer.validateConstraints(products, constraints);
    if (!validation.feasible) {
      return res.status(400).json({ 
        error: '约束条件无法满足', 
        violations: validation.violations 
      });
    }

    // 执行TOP5优化
    const results = optimizer.optimizeTop5(products, constraints);
    
    if (results.length === 0) {
      return res.status(400).json({ 
        error: '无法找到可行解，请放宽约束条件' 
      });
    }

    // 处理结果，添加排名和汇总信息
    const processedResults = results.map((result, index) => ({
      rank: index + 1,
      result: {
        products: result.products,
        mixedProperties: result.mixedProperties,
        totalCost: result.totalCost,
        summary: {
          productCount: result.products.length,
          totalRatio: result.products.reduce((sum, p) => sum + p.ratio, 0),
          constraintsSatisfied: {
            sulfur: result.mixedProperties.sulfur <= constraints.sulfur,
            ash: result.mixedProperties.ash <= constraints.ash,
            volatile: result.mixedProperties.volatile <= constraints.volatile,
            vanadium: result.mixedProperties.vanadium <= constraints.vanadium
          }
        }
      }
    }));

    res.json({
      success: true,
      count: processedResults.length,
      results: processedResults,
      constraints
    });

  } catch (error) {
    console.error('TOP5优化计算错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取产品列表
router.get('/products', async (req, res) => {
  try {
    const products = await database.getAllProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('获取产品列表错误:', error);
    res.status(500).json({ error: '获取产品列表失败' });
  }
});

// 清空产品数据
router.delete('/products', async (req, res) => {
  try {
    await database.clearProducts();
    res.json({ success: true, message: '产品数据已清空' });
  } catch (error) {
    console.error('清空产品数据错误:', error);
    res.status(500).json({ error: '清空产品数据失败' });
  }
});

export default router;