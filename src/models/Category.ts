import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Category } from '../types/models';

export class CategoryModel {
  static async create(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO categories (
        name, description, type, is_default
      ) VALUES (?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        data.type,
        data.is_default || false
      ]
    );
    
    return result.insertId;
  }

  static async findById(id: number): Promise<Category | null> {
    const [categories] = await pool.execute<Category[]>(
      'SELECT id, name, description, type FROM categories WHERE id = ?',
      [id]
    );
    return categories[0] || null;
  }

  static async findAll(type?: 'income' | 'expense', page: number = 1, limit: number = 50): Promise<{ data: Category[], pagination: { page: number, limit: number, total: number, totalPages: number, hasNext: boolean, hasPrev: boolean } }> {
    // Calcular page y limit válidos
    page = Math.max(1, Math.floor(Number(page) || 1));
    limit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 50)));
    const offset = Math.max(0, (page - 1) * limit);

    // Construir WHERE
    let whereClause = 'WHERE 1=1';
    const filterParams: any[] = [];
    if (type) {
      whereClause += ' AND type = ?';
      filterParams.push(type);
    }

    // Total count
    const countQuery = `SELECT COUNT(*) as total FROM categories ${whereClause}`;
    const [countResult] = await pool.execute<any[]>(countQuery, filterParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Main query: interpolar limit y offset directamente
    const mainQuery = `SELECT * FROM categories ${whereClause} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    const [categories] = await pool.execute<Category[]>(mainQuery, filterParams);

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
  
  static async findByName(name: string, type: 'income' | 'expense'): Promise<Category | null> {
    const [categories] = await pool.execute<Category[]>(
      'SELECT * FROM categories WHERE name = ? AND type = ?',
      [name, type]
    );
    return categories[0] || null;
  }

  static async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updateFields = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!updateFields) return false;
    
    const values = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => data[key as keyof typeof data]);
    
    values.push(id);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE categories SET ${updateFields} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM categories WHERE id = ? AND is_default = FALSE',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}
