import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Client } from '../types/models';

export class ClientModel {
  static async create(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO clients (
        name, tax_id, email, phone, address, region_id, commune_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.tax_id,
        data.email,
        data.phone,
        data.address,
        data.region_id,
        data.commune_id,
        data.notes || null
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

  static async findAll(userId: string, filters: { name?: string, region_id?: number, commune_id?: number, tax_id?: string } = {}): Promise<Client[]> {
    let query = 'SELECT * FROM clients WHERE 1=1';
    const params: any[] = [];
    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    if (filters.region_id) {
      query += ' AND region_id = ?';
      params.push(filters.region_id);
    }
    if (filters.commune_id) {
      query += ' AND commune_id = ?';
      params.push(filters.commune_id);
    }
    if (filters.tax_id) {
      query += ' AND tax_id LIKE ?';
      params.push(`%${filters.tax_id}%`);
    }
    query += ' ORDER BY name ASC';
    const [clients] = await pool.execute<Client[]>(query, params);
    return clients;
  }

  static async update(id: number, data: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
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
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE clients SET ${updateFields} WHERE id = ?`,
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

// MODELO REGION
export class RegionModel {
  static async findAll() {
    const [regions] = await pool.execute('SELECT * FROM regions ORDER BY name ASC');
    return regions;
  }
}

// MODELO COMMUNE
export class CommuneModel {
  static async findAll() {
    const [communes] = await pool.execute('SELECT * FROM communes ORDER BY name ASC');
    return communes;
  }
  static async findByRegionId(region_id: number) {
    const [communes] = await pool.execute('SELECT * FROM communes WHERE region_id = ? ORDER BY name ASC', [region_id]);
    return communes;
  }
}
