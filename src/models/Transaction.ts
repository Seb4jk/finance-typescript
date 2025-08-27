import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Transaction, TransactionFilters } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export class TransactionModel {
  static async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = uuidv4();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO transactions (
        id, document_number, transaction_date, description, 
        amount_net, tax_amount, amount_total, 
        category_id, vendor_id, 
        payment_type_id, status_id, user_id, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        Number(data.document_number),
        data.transaction_date,
        data.description,
        data.amount_net,
        data.tax_amount,
        data.amount_total,
        data.category_id,
        data.vendor_id,
        data.payment_type_id,
        data.status_id,
        data.user_id,
        data.type
      ]
    );
    
    return id;
  }

  static async findById(id: string, userId: string): Promise<Transaction | null> {
    const [transactions] = await pool.execute<Transaction[]>(
      `SELECT t.*, 
        c.name as category_name,
        v.name as vendor_name,
        pt.name as payment_type_name,
        s.name as status_name
       FROM transactions t
       INNER JOIN categories c ON t.category_id = c.id
       LEFT JOIN vendors v ON t.vendor_id = v.id
       LEFT JOIN payment_types pt ON t.payment_type_id = pt.id
       LEFT JOIN status s ON t.status_id = s.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );
    return transactions[0] || null;
  }

  static async findByDocumentNumber(documentNumber: number): Promise<Transaction | null> {
    const [transactions] = await pool.execute<Transaction[]>(
      `SELECT t.*
       FROM transactions t
       WHERE t.document_number = ?`,
      [documentNumber]
    );
    return transactions[0] || null;
  }

  static async findAll(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    let query = `
      SELECT t.*, 
        c.name as category_name,
        v.name as vendor_name,
        pt.name as payment_type_name,
        s.name as status_name 
      FROM transactions t
      INNER JOIN categories c ON t.category_id = c.id
      LEFT JOIN vendors v ON t.vendor_id = v.id
      LEFT JOIN payment_types pt ON t.payment_type_id = pt.id
      LEFT JOIN status s ON t.status_id = s.id
      WHERE t.user_id = ?
    `;
    
    const params: any[] = [userId];
    
    if (filters) {
      if (filters.startDate) {
        query += ' AND t.transaction_date >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        query += ' AND t.transaction_date <= ?';
        params.push(filters.endDate);
      }
      
      if (filters.categoryId) {
        query += ' AND t.category_id = ?';
        params.push(filters.categoryId);
      }
      
      if (filters.vendorId) {
        query += ' AND t.vendor_id = ?';
        params.push(filters.vendorId);
      }
      
      
      if (filters.statusId) {
        query += ' AND t.status_id = ?';
        params.push(filters.statusId);
      }
      
      if (filters.paymentTypeId) {
        query += ' AND t.payment_type_id = ?';
        params.push(filters.paymentTypeId);
      }
      
      if (filters.type) {
        query += ' AND t.type = ?';
        params.push(filters.type);
      }
      
      if (filters.documentNumber) {
        query += ' AND t.document_number LIKE ?';
        params.push(`%${filters.documentNumber}%`);
      }
    }
    
    query += ' ORDER BY t.transaction_date DESC';
    
    const [transactions] = await pool.execute<Transaction[]>(query, params);
    return transactions;
  }

  static async update(id: string, userId: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updateFields = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!updateFields) return false;
    
    const values = Object.keys(data)
      .filter(key => data[key as keyof typeof data] !== undefined)
      .map(key => data[key as keyof typeof data]);
    
    values.push(id);
    values.push(userId);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE transactions SET ${updateFields} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }
}
