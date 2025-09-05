import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Transaction, TransactionFilters, PaginatedResponse } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export class TransactionModel {
  static async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = uuidv4();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO transactions (
        id, document_number, document_type_id, transaction_date, description, 
        amount_net, tax_amount, tax_rate_id, amount_total, 
        category_id, vendor_id, 
        status_id, user_id, company_id, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        Number(data.document_number),
        data.document_type_id,
        data.transaction_date,
        data.description,
        data.amount_net,
        data.tax_amount,
        data.tax_rate_id,
        data.amount_total,
        data.category_id,
        data.vendor_id,
        data.status_id,
        data.user_id,
        data.company_id,
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
        s.name as status_name,
        dt.name as document_type_name,
        dt.code as document_type_code,
        tr.name as tax_rate_name,
        tr.rate as tax_rate,
        comp.name as company_name
       FROM transactions t
       INNER JOIN categories c ON t.category_id = c.id
       LEFT JOIN vendors v ON t.vendor_id = v.id
       LEFT JOIN status s ON t.status_id = s.id
       LEFT JOIN document_types dt ON t.document_type_id = dt.id
       LEFT JOIN tax_rates tr ON t.tax_rate_id = tr.id
       LEFT JOIN companies comp ON t.company_id = comp.id
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

  static async findAll(userId: string, filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    // Build WHERE clause
    let whereClause = 'WHERE t.user_id = ?';
    const params: any[] = [userId];
    
    if (filters) {
      if (filters.startDate) {
        whereClause += ' AND t.transaction_date >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        whereClause += ' AND t.transaction_date <= ?';
        params.push(filters.endDate);
      }
      
      if (filters.categoryId) {
        whereClause += ' AND t.category_id = ?';
        params.push(filters.categoryId);
      }
      
      if (filters.vendorId) {
        whereClause += ' AND t.vendor_id = ?';
        params.push(filters.vendorId);
      }
      
      if (filters.statusId) {
        whereClause += ' AND t.status_id = ?';
        params.push(filters.statusId);
      }
      
      if (filters.documentTypeId) {
        whereClause += ' AND t.document_type_id = ?';
        params.push(filters.documentTypeId);
      }
      
      if (filters.taxRateId) {
        whereClause += ' AND t.tax_rate_id = ?';
        params.push(filters.taxRateId);
      }
      
      if (filters.companyId) {
        whereClause += ' AND t.company_id = ?';
        params.push(filters.companyId);
      }
      
      if (filters.type) {
        whereClause += ' AND t.type = ?';
        params.push(filters.type);
      }
      
      if (filters.documentNumber) {
        whereClause += ' AND t.document_number LIKE ?';
        params.push(`%${filters.documentNumber}%`);
      }
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM transactions t ${whereClause}`;
    const [countResult] = await pool.execute<any[]>(countQuery, params);
    const total = countResult[0].total;
    
    // Pagination parameters - ensure integers
    const page = Math.max(1, Math.floor(filters?.page || 1));
    const limit = Math.max(1, Math.min(100, Math.floor(filters?.limit || 50)));
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Main query con subconsultas para pagos
    const baseQuery = `
      SELECT t.*, 
        c.name as category_name,
        v.name as vendor_name,
        s.name as status_name,
        CASE 
          WHEN LOWER(s.name) IN ('pagado', 'paid') THEN 'green'
          WHEN LOWER(s.name) IN ('pendiente', 'pending') THEN 'yellow'
          ELSE NULL
        END as statusColor,
        dt.name as document_type_name,
        dt.code as document_type_code,
        tr.name as tax_rate_name,
        tr.rate as tax_rate,
        comp.name as company_name,
        (
          SELECT COUNT(*) FROM transaction_payments tp WHERE tp.transaction_id = t.id
        ) as paymentsCount,
        (
          t.amount_total - COALESCE((SELECT SUM(tp.amount) FROM transaction_payments tp WHERE tp.transaction_id = t.id), 0)
        ) as pendingAmount
      FROM transactions t
      INNER JOIN categories c ON t.category_id = c.id
      LEFT JOIN vendors v ON t.vendor_id = v.id
      LEFT JOIN status s ON t.status_id = s.id
      LEFT JOIN document_types dt ON t.document_type_id = dt.id
      LEFT JOIN tax_rates tr ON t.tax_rate_id = tr.id
      LEFT JOIN companies comp ON t.company_id = comp.id
      ${whereClause}
      ORDER BY t.transaction_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [transactions] = await pool.execute<Transaction[]>(baseQuery, params);
    
    return {
      data: transactions,
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

  static async summary(userId: string, filters?: { startDate?: string; endDate?: string; companyId?: number }): Promise<{ totalIncome: number; totalExpense: number; netBalance: number }> {
    let whereClause = 'WHERE t.user_id = ?';
    const params: any[] = [userId];
    if (filters?.startDate) {
      whereClause += ' AND t.transaction_date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      whereClause += ' AND t.transaction_date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.companyId) {
      whereClause += ' AND t.company_id = ?';
      params.push(filters.companyId);
    }
    // Sumar ingresos
    const [incomeRows] = await pool.execute<any[]>(`SELECT SUM(amount_total) as total FROM transactions t ${whereClause} AND t.type = 'income'`, params);
    // Sumar egresos
    const [expenseRows] = await pool.execute<any[]>(`SELECT SUM(amount_total) as total FROM transactions t ${whereClause} AND t.type = 'expense'`, params);
    const totalIncome = Number(incomeRows[0].total) || 0;
    const totalExpense = Number(expenseRows[0].total) || 0;
    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    };
  }
}
