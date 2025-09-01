import sqlite3 from 'sqlite3';
import { Product } from '../types';

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.initTables();
  }

  private initTables(): void {
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

  async saveProducts(products: Product[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO products (id, name, sulfur, ash, volatile, vanadium, price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const promises = products.map(product => {
        return new Promise<void>((res, rej) => {
          stmt.run([
            product.id,
            product.name,
            product.sulfur,
            product.ash,
            product.volatile,
            product.vanadium,
            product.price
          ], (err) => {
            if (err) rej(err);
            else res();
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

  async getAllProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM products ORDER BY name',
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const products: Product[] = rows.map(row => ({
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
        }
      );
    });
  }

  async clearProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM products', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new Database();