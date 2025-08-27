import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction';
import { CategoryModel } from '../models/Category';
import { TokenPayload } from '../types/auth';
import { TransactionFilters } from '../types/models';

export class TransactionController {
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { 
        document_number, 
        transaction_date, 
        description, 
        amount_net, 
        tax_amount, 
        amount_total, 
        category_id, 
        vendor_id, 
        payment_type_id, 
        status_id, 
        type 
      } = req.body;
      
      if (!document_number || !transaction_date || !description || !amount_net || 
          !tax_amount || !amount_total || !category_id || !vendor_id || 
          !payment_type_id || !status_id || !type || !['income', 'expense'].includes(type)) {
        return res.status(400).json({ 
          message: 'Todos los campos son requeridos. El tipo debe ser "income" o "expense"' 
        });
      }

      // Verificar si ya existe una transacción con el mismo número de documento
      const existingTransaction = await TransactionModel.findByDocumentNumber(document_number);
      if (existingTransaction) {
        return res.status(409).json({ 
          message: 'Ya existe una transacción con este número de documento', 
          existingTransaction 
        });
      }

      // Check if category exists
      const category = await CategoryModel.findById(category_id);
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Check if category type matches transaction type
      if (category.type !== type) {
        return res.status(400).json({ 
          message: `La categoría seleccionada no es válida para transacciones de tipo ${type}` 
        });
      }

      const transactionId = await TransactionModel.create({
        document_number: Number(document_number),
        description,
        transaction_date: new Date(transaction_date),
        amount_net: Number(amount_net),
        tax_amount: Number(tax_amount),
        amount_total: Number(amount_total),
        category_id: Number(category_id),
        vendor_id: Number(vendor_id),
        payment_type_id: Number(payment_type_id),
        status_id: Number(status_id),
        user_id: userId,
        type
      });

      const transaction = await TransactionModel.findById(transactionId, userId);
      
      return res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const filters: TransactionFilters = {};
      
      // Parse query parameters for filtering
      if (req.query.startDate) filters.startDate = req.query.startDate as string;
      if (req.query.endDate) filters.endDate = req.query.endDate as string;
      if (req.query.categoryId) filters.categoryId = Number(req.query.categoryId);
      if (req.query.type && ['income', 'expense'].includes(req.query.type as string)) {
        filters.type = req.query.type as 'income' | 'expense';
      }
      
      const transactions = await TransactionModel.findAll(userId, filters);
      return res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const transaction = await TransactionModel.findById(id, userId);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transacción no encontrada' });
      }

      return res.json(transaction);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      const { amount, description, transaction_date, category_id, type } = req.body;
      
      // Check if transaction exists and belongs to user
      const existingTransaction = await TransactionModel.findById(id, userId);
      if (!existingTransaction) {
        return res.status(404).json({ message: 'Transacción no encontrada' });
      }

      // If changing category or type, validate category
      if (category_id || type) {
        const newType = type || existingTransaction.type;
        const newCategoryId = category_id || existingTransaction.category_id;
        
        const category = await CategoryModel.findById(newCategoryId);
        if (!category) {
          return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        
        if (category.type !== newType) {
          return res.status(400).json({ 
            message: `La categoría seleccionada no es válida para transacciones de tipo ${newType}` 
          });
        }
      }

      const updateData: any = {};
      if (amount !== undefined) updateData.amount = Number(amount);
      if (description !== undefined) updateData.description = description;
      if (transaction_date !== undefined) updateData.transaction_date = new Date(transaction_date);
      if (category_id !== undefined) updateData.category_id = Number(category_id);
      if (type !== undefined) updateData.type = type;

      const updated = await TransactionModel.update(id, userId, updateData);
      
      if (!updated) {
        return res.status(400).json({ message: 'Error al actualizar la transacción' });
      }

      const updatedTransaction = await TransactionModel.findById(id, userId);
      return res.json(updatedTransaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const transaction = await TransactionModel.findById(id, userId);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transacción no encontrada' });
      }

      const deleted = await TransactionModel.delete(id, userId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Error al eliminar la transacción' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
