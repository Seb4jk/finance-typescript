import { pool } from '../config/database';
import { Company, CompanyUser } from '../types/models';

export class CompanyModel {
  static async findAll(userId: string): Promise<Company[]> {
    const [companies] = await pool.execute<Company[]>(
      `SELECT c.* FROM companies c
       INNER JOIN company_users cu ON c.id = cu.company_id
       WHERE cu.user_id = ?
       ORDER BY c.name ASC`,
      [userId]
    );
    return companies;
  }

  static async findById(id: number): Promise<Company | null> {
    const [companies] = await pool.execute<Company[]>(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );
    return companies[0] || null;
  }
  
  static async findByTaxId(taxId: string): Promise<Company | null> {
    const [companies] = await pool.execute<Company[]>(
      'SELECT * FROM companies WHERE tax_id = ?',
      [taxId]
    );
    return companies[0] || null;
  }
  
  static async create(data: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const { name, tax_id, address, city, country, phone, email } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO companies (name, tax_id, address, city, country, phone, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, tax_id, address, city, country, phone, email]
    );
    
    return (result as any).insertId;
  }
  
  static async update(id: number, data: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updateFields = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updateFields.length === 0) return false;
    
    const values = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => data[key as keyof typeof data]);
    
    const [result] = await pool.execute(
      `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    
    return (result as any).affectedRows > 0;
  }
  
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM companies WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  }
  
  // Métodos para la tabla company_users
  static async addUser(companyId: number, userId: string, isAdmin: boolean = false): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO company_users (company_id, user_id, is_admin) VALUES (?, ?, ?)',
      [companyId, userId, isAdmin]
    );
    
    return (result as any).insertId;
  }
  
  static async removeUser(companyId: number, userId: string): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM company_users WHERE company_id = ? AND user_id = ?',
      [companyId, userId]
    );
    
    return (result as any).affectedRows > 0;
  }
  
  static async isUserAssigned(companyId: number, userId: string): Promise<boolean> {
    const [users] = await pool.execute<CompanyUser[]>(
      'SELECT * FROM company_users WHERE company_id = ? AND user_id = ?',
      [companyId, userId]
    );
    
    return users.length > 0;
  }
  
  static async isUserAdmin(companyId: number, userId: string): Promise<boolean> {
    const [users] = await pool.execute<CompanyUser[]>(
      'SELECT * FROM company_users WHERE company_id = ? AND user_id = ? AND is_admin = true',
      [companyId, userId]
    );
    
    return users.length > 0;
  }
}
