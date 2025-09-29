import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Vendor } from '../types/models';

export class VendorModel {
  static async create(data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO vendors (
        name, tax_id, business_activity, email, phone, address, region_id, commune_id, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name ?? null,
        data.tax_id ?? null,
        data.business_activity ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.address ?? null,
        data.region_id ?? null,
        data.commune_id ?? null,
        data.notes ?? null,
        data.user_id ?? null
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

  static async findAll(userId: string, filters: { name?: string, region_id?: number, commune_id?: number, tax_id?: string } = {}): Promise<Vendor[]> {
    let query = `SELECT v.id, v.name, v.tax_id, v.business_activity, v.email, v.phone, v.address, v.region_id, v.commune_id, v.notes, r.name as region_name, c.name as commune_name
                 FROM vendors v
                 INNER JOIN regions r ON v.region_id = r.id
                 INNER JOIN communes c ON v.commune_id = c.id
                 WHERE v.user_id = ?`;
    const params: any[] = [userId];
    if (filters.name) {
      query += ' AND v.name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    if (filters.region_id) {
      query += ' AND v.region_id = ?';
      params.push(filters.region_id);
    }
    if (filters.commune_id) {
      query += ' AND v.commune_id = ?';
      params.push(filters.commune_id);
    }
    if (filters.tax_id) {
      query += ' AND v.tax_id LIKE ?';
      params.push(`%${filters.tax_id}%`);
    }
    query += ' ORDER BY v.name ASC';
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
