import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction';
import { CategoryModel } from '../models/Category';
import { DocumentTypeModel } from '../models/DocumentType';
import { TaxRateModel } from '../models/TaxRate';
import { CompanyModel } from '../models/Company';
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
        document_type_id,
        transaction_date, 
        description, 
        amount_net, 
        tax_amount, 
        tax_rate_id,
        amount_total, 
        category_id, 
        vendor_id, 
        status_id, 
        company_id,
        type 
      } = req.body;
      
      if (!document_number || !document_type_id || !transaction_date || !amount_net || !amount_total || !category_id || !vendor_id || 
          !status_id || !type || !['income', 'expense'].includes(type)) {
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

      // Check if document type exists
      const documentType = await DocumentTypeModel.findById(document_type_id);
      if (!documentType) {
        return res.status(404).json({ message: 'Tipo de documento no encontrado' });
      }
      
      // Check if tax rate exists (if provided)
      if (tax_rate_id) {
        const taxRate = await TaxRateModel.findById(tax_rate_id);
        if (!taxRate) {
          return res.status(404).json({ message: 'Tasa de impuesto no encontrada' });
        }
      }
      
      // Check if company exists and user has access to it (if provided)
      if (company_id) {
        const company = await CompanyModel.findById(company_id);
        if (!company) {
          return res.status(404).json({ message: 'Compañía no encontrada' });
        }
        
        // Verify user has access to this company
        const hasAccess = await CompanyModel.isUserAssigned(company_id, userId);
        if (!hasAccess) {
          return res.status(403).json({ message: 'No tienes permiso para utilizar esta compañía' });
        }
      }
      
      // Check if category type matches transaction type
      if (category.type !== type) {
        return res.status(400).json({ 
          message: `La categoría seleccionada no es válida para transacciones de tipo ${type}` 
        });
      }

      const transactionId = await TransactionModel.create({
        document_number: Number(document_number),
        document_type_id: Number(document_type_id),
        description,
        transaction_date: new Date(transaction_date),
        amount_net: Number(amount_net),
        tax_amount: Number(tax_amount),
        tax_rate_id: tax_rate_id ? Number(tax_rate_id) : undefined,
        amount_total: Number(amount_total),
        category_id: Number(category_id),
        vendor_id: Number(vendor_id),
        status_id: Number(status_id),
        company_id: company_id ? Number(company_id) : undefined,
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
      if (req.query.vendorId) filters.vendorId = Number(req.query.vendorId);
      if (req.query.statusId) filters.statusId = Number(req.query.statusId);
      if (req.query.documentTypeId) filters.documentTypeId = Number(req.query.documentTypeId);
      if (req.query.taxRateId) filters.taxRateId = Number(req.query.taxRateId);
      if (req.query.companyId) filters.companyId = Number(req.query.companyId);
      if (req.query.type && ['income', 'expense'].includes(req.query.type as string)) {
        filters.type = req.query.type as 'income' | 'expense';
      }
      if (req.query.documentNumber) filters.documentNumber = req.query.documentNumber as string;
      
      // Parse pagination parameters
      if (req.query.page) {
        const pageNum = Number(req.query.page);
        if (!isNaN(pageNum) && pageNum > 0) {
          filters.page = pageNum;
        }
      }
      if (req.query.limit) {
        const limitNum = Number(req.query.limit);
        if (!isNaN(limitNum) && limitNum > 0) {
          filters.limit = limitNum;
        }
      }
      
      const result = await TransactionModel.findAll(userId, filters);
      return res.json(result);
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
      const { 
        document_number, 
        document_type_id,
        transaction_date, 
        description, 
        amount_net, 
        tax_amount, 
        tax_rate_id,
        amount_total, 
        category_id, 
        vendor_id, 
        payment_type_id, 
        status_id, 
        company_id,
        type 
      } = req.body;
      
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
      
      // Validate document type if changing
      if (document_type_id) {
        const documentType = await DocumentTypeModel.findById(document_type_id);
        if (!documentType) {
          return res.status(404).json({ message: 'Tipo de documento no encontrado' });
        }
      }
      
      // Validate tax rate if changing
      if (tax_rate_id) {
        const taxRate = await TaxRateModel.findById(tax_rate_id);
        if (!taxRate) {
          return res.status(404).json({ message: 'Tasa de impuesto no encontrada' });
        }
      }
      
      // Validate company if changing
      if (company_id) {
        const company = await CompanyModel.findById(company_id);
        if (!company) {
          return res.status(404).json({ message: 'Compañía no encontrada' });
        }
        
        // Verify user has access to this company
        const hasAccess = await CompanyModel.isUserAssigned(company_id, userId);
        if (!hasAccess) {
          return res.status(403).json({ message: 'No tienes permiso para utilizar esta compañía' });
        }
      }

      const updateData: any = {};
      if (document_number !== undefined) updateData.document_number = Number(document_number);
      if (document_type_id !== undefined) updateData.document_type_id = Number(document_type_id);
      if (description !== undefined) updateData.description = description;
      if (transaction_date !== undefined) updateData.transaction_date = new Date(transaction_date);
      if (amount_net !== undefined) updateData.amount_net = Number(amount_net);
      if (tax_amount !== undefined) updateData.tax_amount = Number(tax_amount);
      if (tax_rate_id !== undefined) updateData.tax_rate_id = Number(tax_rate_id);
      if (amount_total !== undefined) updateData.amount_total = Number(amount_total);
      if (category_id !== undefined) updateData.category_id = Number(category_id);
      if (vendor_id !== undefined) updateData.vendor_id = Number(vendor_id);
      if (payment_type_id !== undefined) updateData.payment_type_id = Number(payment_type_id);
      if (status_id !== undefined) updateData.status_id = Number(status_id);
      if (company_id !== undefined) updateData.company_id = Number(company_id);
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

      return res.json({ message: 'Transacción eliminada correctamente' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const { startDate, endDate, companyId } = req.query;
      const filters: any = {};
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (companyId) filters.companyId = Number(companyId);
      const summary = await TransactionModel.summary(userId, filters);
      return res.json(summary);
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
