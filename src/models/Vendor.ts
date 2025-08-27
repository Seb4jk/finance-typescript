import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Vendor } from '../types/models';

export class VendorModel {
  static async create(data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO vendors (
        name, tax_id, contact_name, email, phone, address, 
        city, country, industry, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.tax_id,
        data.contact_name,
        data.email,
        data.phone,
        data.address,
        data.city,
        data.country,
        data.industry || null,
        data.notes || null,
        data.user_id
      ]
    );
    
    return result.insertId;
  }

  static async findById(id: number): Promise<Vendor | null> {
    const [vendors] = await pool.execute<Vendor[]>(
      'SELECT * FROM vendors WHERE id = ?',
      [id]
    );
    return vendors[0] || null;
  }
  
  static async findByTaxId(taxId: string): Promise<Vendor | null> {
    const [vendors] = await pool.execute<Vendor[]>(
      'SELECT * FROM vendors WHERE tax_id = ?',
      [taxId]
    );
    return vendors[0] || null;
  }

  static async findAll(userId: string, filters: { name?: string, industry?: string, country?: string, tax_id?: string } = {}): Promise<Vendor[]> {
    let query = 'SELECT * FROM vendors WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    
    if (filters.industry) {
      query += ' AND industry LIKE ?';
      params.push(`%${filters.industry}%`);
    }
    
    if (filters.country) {
      query += ' AND country LIKE ?';
      params.push(`%${filters.country}%`);
    }
    
    if (filters.tax_id) {
      query += ' AND tax_id LIKE ?';
      params.push(`%${filters.tax_id}%`);
    }
    
    query += ' ORDER BY name ASC';
    
    const [vendors] = await pool.execute<Vendor[]>(query, params);
    return vendors;
  }

  static async update(id: number, userId: string, data: Partial<Omit<Vendor, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updateFields = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!updateFields) {
      return false;
    }
    
    const values = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => data[key as keyof typeof data]);
    
    values.push(id);
    values.push(userId);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE vendors SET ${updateFields} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: number, userId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM vendors WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }
}
