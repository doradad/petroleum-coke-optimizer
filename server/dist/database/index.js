"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
class Database {
    constructor() {
        this.db = new sqlite3_1.default.Database(':memory:');
        this.initTables();
    }
    initTables() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sulfur REAL NOT NULL,
        ash REAL NOT NULL,
        volatile REAL NOT NULL,
        vanadium REAL NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
        this.db.run(createTableSQL);
    }
    async saveProducts(products) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO products (id, name, sulfur, ash, volatile, vanadium, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
            const promises = products.map(product => {
                return new Promise((res, rej) => {
                    stmt.run([
                        product.id,
                        product.name,
                        product.sulfur,
                        product.ash,
                        product.volatile,
                        product.vanadium,
                        product.price
                    ], (err) => {
                        if (err)
                            rej(err);
                        else
                            res();
                    });
                });
            });
            Promise.all(promises)
                .then(() => {
                stmt.finalize();
                resolve();
            })
                .catch(reject);
        });
    }
    async getAllProducts() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    const products = rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        sulfur: row.sulfur,
                        ash: row.ash,
                        volatile: row.volatile,
                        vanadium: row.vanadium,
                        price: row.price
                    }));
                    resolve(products);
                }
            });
        });
    }
    async clearProducts() {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM products', (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.default = new Database();
