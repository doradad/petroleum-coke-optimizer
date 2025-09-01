"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const XLSX = __importStar(require("xlsx"));
const database_1 = __importDefault(require("../database"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Excel上传接口
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '未选择文件' });
        }
        // 解析Excel文件
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // 转换为JSON数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length < 2) {
            return res.status(400).json({ error: 'Excel文件格式错误：需要至少包含标题行和一行数据' });
        }
        // 解析表头
        const headers = jsonData[0].map((h) => String(h).trim());
        const expectedHeaders = ['产品编号', 'S(%)', 'A(%)', 'V(%)', '钒含量(ppm)', '价格'];
        // 检查必要列是否存在
        const missingHeaders = expectedHeaders.filter(header => !headers.some(h => h.includes(header.replace(/[()]/g, '')) || h === header));
        if (missingHeaders.length > 0) {
            return res.status(400).json({
                error: `Excel文件缺少必要列: ${missingHeaders.join(', ')}`,
                expectedHeaders,
                actualHeaders: headers
            });
        }
        // 找到各列的索引
        const getColumnIndex = (searchTerms) => {
            return headers.findIndex(header => searchTerms.some(term => header.toLowerCase().includes(term.toLowerCase().replace(/[()]/g, ''))));
        };
        const colIndexes = {
            name: getColumnIndex(['产品编号', '产品名称', '编号', '名称']),
            sulfur: getColumnIndex(['s', '硫', 'sulfur']),
            ash: getColumnIndex(['a', '灰', 'ash']),
            volatile: getColumnIndex(['v', '挥发', 'volatile']),
            vanadium: getColumnIndex(['钒', 'vanadium', 'ppm']),
            price: getColumnIndex(['价格', 'price', '成本'])
        };
        // 检查是否所有列都找到了
        const missingColumns = Object.entries(colIndexes)
            .filter(([_, index]) => index === -1)
            .map(([key, _]) => key);
        if (missingColumns.length > 0) {
            return res.status(400).json({
                error: `无法找到必要的数据列: ${missingColumns.join(', ')}`,
                headers,
                colIndexes
            });
        }
        // 解析数据行
        const products = [];
        const errors = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0 || !row[colIndexes.name]) {
                continue; // 跳过空行
            }
            try {
                const product = {
                    id: `product_${i}_${Date.now()}`,
                    name: String(row[colIndexes.name]).trim(),
                    sulfur: parseFloat(row[colIndexes.sulfur]) || 0,
                    ash: parseFloat(row[colIndexes.ash]) || 0,
                    volatile: parseFloat(row[colIndexes.volatile]) || 0,
                    vanadium: parseFloat(row[colIndexes.vanadium]) || 0,
                    price: parseFloat(row[colIndexes.price]) || 0
                };
                // 验证数据有效性
                if (!product.name) {
                    errors.push(`第${i + 1}行：产品名称不能为空`);
                    continue;
                }
                if (product.sulfur < 0 || product.ash < 0 ||
                    product.volatile < 0 || product.vanadium < 0 || product.price <= 0) {
                    errors.push(`第${i + 1}行：数值必须为非负数，价格必须大于0`);
                    continue;
                }
                products.push(product);
            }
            catch (error) {
                errors.push(`第${i + 1}行：数据解析错误`);
            }
        }
        if (products.length === 0) {
            return res.status(400).json({
                error: '没有有效的产品数据',
                errors
            });
        }
        // 清空现有数据并保存新数据
        await database_1.default.clearProducts();
        await database_1.default.saveProducts(products);
        res.json({
            success: true,
            message: `成功导入${products.length}个产品`,
            products: products.slice(0, 5), // 返回前5个作为预览
            total: products.length,
            errors: errors.length > 0 ? errors : undefined
        });
    }
    catch (error) {
        console.error('Excel解析错误:', error);
        res.status(500).json({
            error: '文件解析失败，请检查Excel格式是否正确',
            detail: error instanceof Error ? error.message : '未知错误'
        });
    }
});
// 下载模板
router.get('/template', (req, res) => {
    try {
        // 创建示例数据
        const templateData = [
            ['产品编号', 'S(%)', 'A(%)', 'V(%)', '钒含量(ppm)', '价格'],
            ['石油焦A', 2.5, 0.3, 10.0, 300, 2800],
            ['石油焦B', 3.2, 0.5, 12.5, 350, 2600],
            ['石油焦C', 1.8, 0.2, 8.5, 250, 3200],
            ['石油焦D', 4.0, 0.6, 15.0, 400, 2400],
            ['石油焦E', 2.0, 0.25, 9.0, 280, 3000]
        ];
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);
        // 设置列宽
        ws['!cols'] = [
            { width: 15 }, // 产品编号
            { width: 10 }, // S(%)
            { width: 10 }, // A(%)
            { width: 10 }, // V(%)
            { width: 12 }, // 钒含量(ppm)
            { width: 10 } // 价格
        ];
        XLSX.utils.book_append_sheet(wb, ws, '产品清单');
        // 生成Excel buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename="petroleum-coke-template.xlsx"; filename*=UTF-8\'\'%E7%9F%B3%E6%B2%B9%E7%84%A6%E4%BA%A7%E5%93%81%E6%B8%85%E5%8D%95%E6%A8%A1%E6%9D%BF.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }
    catch (error) {
        console.error('模板生成错误:', error);
        res.status(500).json({ error: '模板生成失败' });
    }
});
exports.default = router;
