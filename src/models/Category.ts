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
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return categories[0] || null;
  }

  static async findAll(type?: 'income' | 'expense'): Promise<Category[]> {
    let query = 'SELECT * FROM categories';
    const params: any[] = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    const [categories] = await pool.execute<Category[]>(query, params);
    return categories;
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
