import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Client } from '../types/models';

export class ClientModel {
  static async create(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO clients (
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

  static async findById(id: number): Promise<Client | null> {
    const [clients] = await pool.execute<Client[]>(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    return clients[0] || null;
  }
  
  static async findByTaxId(taxId: string): Promise<Client | null> {
    const [clients] = await pool.execute<Client[]>(
      'SELECT * FROM clients WHERE tax_id = ?',
      [taxId]
    );
    return clients[0] || null;
  }

  static async findAll(userId: string, filters: { name?: string, industry?: string, country?: string, tax_id?: string } = {}): Promise<Client[]> {
    let query = 'SELECT * FROM clients WHERE user_id = ?';
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
    
    const [clients] = await pool.execute<Client[]>(query, params);
    return clients;
  }

  static async update(id: number, userId: string, data: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
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
      `UPDATE clients SET ${updateFields} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: number, userId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM clients WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }
}
