import { pool } from '../config/database';
import { TaxRate } from '../types/models';
import { ResultSetHeader } from 'mysql2';

export class TaxRateModel {
  static async findAll(): Promise<TaxRate[]> {
    const [taxRates] = await pool.execute<TaxRate[]>(
      'SELECT * FROM tax_rates ORDER BY name ASC'
    );
    return taxRates;
  }

  static async findById(id: number): Promise<TaxRate | null> {
    const [taxRates] = await pool.execute<TaxRate[]>(
      'SELECT * FROM tax_rates WHERE id = ?',
      [id]
    );
    return taxRates[0] || null;
  }
  
  static async findDefault(): Promise<TaxRate | null> {
    const [taxRates] = await pool.execute<TaxRate[]>(
      'SELECT * FROM tax_rates WHERE is_default = true LIMIT 1'
    );
    return taxRates[0] || null;
  }

  static async findByName(name: string): Promise<TaxRate | null> {
    const [taxRates] = await pool.execute<TaxRate[]>(
      'SELECT * FROM tax_rates WHERE name = ?',
      [name]
    );
    return taxRates[0] || null;
  }

  static async create(taxRate: Omit<TaxRate, 'id'>): Promise<number> {
    // Si es_default es true, primero quitar el default de otros
    if (taxRate.is_default) {
      await pool.execute(
        'UPDATE tax_rates SET is_default = false WHERE is_default = true'
      );
    }
    
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tax_rates (name, rate, description, is_default) VALUES (?, ?, ?, ?)',
      [taxRate.name, taxRate.rate, taxRate.description, taxRate.is_default]
    );
    return result.insertId;
  }

  static async update(id: number, taxRate: Partial<Omit<TaxRate, 'id'>>): Promise<boolean> {
    // Si es_default es true, primero quitar el default de otros
    if (taxRate.is_default) {
      await pool.execute(
        'UPDATE tax_rates SET is_default = false WHERE is_default = true AND id != ?',
        [id]
      );
    }
    
    const fields = [];
    const values = [];
    
    if (taxRate.name !== undefined) {
      fields.push('name = ?');
      values.push(taxRate.name);
    }
    if (taxRate.rate !== undefined) {
      fields.push('rate = ?');
      values.push(taxRate.rate);
    }
    if (taxRate.description !== undefined) {
      fields.push('description = ?');
      values.push(taxRate.description);
    }
    if (taxRate.is_default !== undefined) {
      fields.push('is_default = ?');
      values.push(taxRate.is_default);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE tax_rates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM tax_rates WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}
