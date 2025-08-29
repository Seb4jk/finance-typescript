import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export interface TransactionPayment extends RowDataPacket {
  id?: number;
  transaction_id: string;
  payment_type_id: number;
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  payment_type_name?: string;
}

export class TransactionPaymentModel {
  static async create(data: Omit<TransactionPayment, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO transaction_payments (
        transaction_id, payment_type_id, amount, payment_date, 
        reference_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.transaction_id,
        data.payment_type_id,
        data.amount,
        data.payment_date,
        data.reference_number,
        data.notes
      ]
    );
    
    return result.insertId;
  }

  static async findById(id: number): Promise<TransactionPayment | null> {
    const [payments] = await pool.execute<RowDataPacket[]>(
      `SELECT tp.*, 
        pt.name as payment_type_name
       FROM transaction_payments tp
       LEFT JOIN payment_types pt ON tp.payment_type_id = pt.id
       WHERE tp.id = ?`,
      [id]
    );
    return (payments[0] as TransactionPayment) || null;
  }

  static async findByTransactionId(transactionId: string): Promise<TransactionPayment[]> {
    const [payments] = await pool.execute<RowDataPacket[]>(
      `SELECT tp.*, 
        pt.name as payment_type_name
       FROM transaction_payments tp
       LEFT JOIN payment_types pt ON tp.payment_type_id = pt.id
       WHERE tp.transaction_id = ?
       ORDER BY tp.payment_date DESC`,
      [transactionId]
    );
    return payments as TransactionPayment[];
  }

  static async update(id: number, data: Partial<Omit<TransactionPayment, 'id' | 'transaction_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
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
      `UPDATE transaction_payments SET ${updateFields} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM transaction_payments WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async deleteByTransactionId(transactionId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM transaction_payments WHERE transaction_id = ?',
      [transactionId]
    );
    
    return result.affectedRows > 0;
  }

  static async getTotalPaidAmount(transactionId: string): Promise<number> {
    const [result] = await pool.execute<any[]>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transaction_payments WHERE transaction_id = ?',
      [transactionId]
    );
    
    return result[0]?.total || 0;
  }
}
