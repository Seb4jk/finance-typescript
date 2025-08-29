import { pool } from '../config/database';
import { DocumentType } from '../types/models';
import { ResultSetHeader } from 'mysql2';

export class DocumentTypeModel {
  static async findAll(): Promise<DocumentType[]> {
    const [documentTypes] = await pool.execute<DocumentType[]>(
      'SELECT * FROM document_types ORDER BY code ASC'
    );
    return documentTypes;
  }

  static async findById(id: number): Promise<DocumentType | null> {
    const [documentTypes] = await pool.execute<DocumentType[]>(
      'SELECT * FROM document_types WHERE id = ?',
      [id]
    );
    return documentTypes[0] || null;
  }
  
  static async findByCode(code: string): Promise<DocumentType | null> {
    const [documentTypes] = await pool.execute<DocumentType[]>(
      'SELECT * FROM document_types WHERE code = ?',
      [code]
    );
    return documentTypes[0] || null;
  }

  static async create(documentType: Omit<DocumentType, 'id'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO document_types (code, name, description, is_electronic) VALUES (?, ?, ?, ?)',
      [documentType.code, documentType.name, documentType.description, documentType.is_electronic]
    );
    return result.insertId;
  }

  static async update(id: number, documentType: Partial<Omit<DocumentType, 'id'>>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    if (documentType.code !== undefined) {
      fields.push('code = ?');
      values.push(documentType.code);
    }
    if (documentType.name !== undefined) {
      fields.push('name = ?');
      values.push(documentType.name);
    }
    if (documentType.description !== undefined) {
      fields.push('description = ?');
      values.push(documentType.description);
    }
    if (documentType.is_electronic !== undefined) {
      fields.push('is_electronic = ?');
      values.push(documentType.is_electronic);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE document_types SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM document_types WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}
