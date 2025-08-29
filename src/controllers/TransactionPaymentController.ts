import { Request, Response } from 'express';
import { TransactionPaymentModel, TransactionPayment } from '../models/TransactionPayment';
import { TransactionModel } from '../models/Transaction';

export class TransactionPaymentController {
  // Get all payments for a transaction
  static async getPaymentsByTransaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { transactionId } = req.params;
      
      // Verificar que la transacción existe y pertenece al usuario
      const transaction = await TransactionModel.findById(transactionId, userId);
      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
        return;
      }

      const payments = await TransactionPaymentModel.findByTransactionId(transactionId);
      
      res.status(200).json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error al obtener los pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos'
      });
    }
  }

  // Get payment by ID
  static async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de pago inválido'
        });
        return;
      }

      const payment = await TransactionPaymentModel.findById(Number(id));
      
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }

      // Verificar que la transacción pertenece al usuario
      const transaction = await TransactionModel.findById(payment.transaction_id, userId);
      if (!transaction) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a este pago'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error al obtener el pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago'
      });
    }
  }

  // Create new payment
  static async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { transactionId } = req.params;
      const { payment_type_id, amount, payment_date, reference_number, notes } = req.body;
      
      // Validaciones básicas
      if (!payment_type_id || !amount || !payment_date) {
        res.status(400).json({
          success: false,
          message: 'Tipo de pago, monto y fecha son obligatorios'
        });
        return;
      }

      // Verificar que la transacción existe y pertenece al usuario
      const transaction = await TransactionModel.findById(transactionId, userId);
      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
        return;
      }

      // Verificar que el monto no exceda el total de la transacción
      const totalPaid = Number(await TransactionPaymentModel.getTotalPaidAmount(transactionId));
      const newTotal = totalPaid + Number(amount);
      const transactionTotal = Number(transaction.amount_total);
      
      if (newTotal > transactionTotal) {
        const remainingAmount = transactionTotal - totalPaid;
        res.status(400).json({
          success: false,
          message: `El monto total de pagos no puede exceder ${transactionTotal.toFixed(2)}. Ya se han pagado ${totalPaid.toFixed(2)}. Monto disponible: ${remainingAmount.toFixed(2)}`
        });
        return;
      }
      
      const paymentId = await TransactionPaymentModel.create({
        transaction_id: transactionId,
        payment_type_id: Number(payment_type_id),
        amount: Number(amount),
        payment_date,
        reference_number,
        notes
      });
      
      res.status(201).json({
        success: true,
        data: { id: paymentId }
      });
    } catch (error) {
      console.error('Error al crear el pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el pago'
      });
    }
  }

  // Update payment
  static async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      const { payment_type_id, amount, payment_date, reference_number, notes } = req.body;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de pago inválido'
        });
        return;
      }

      // Verificar que el pago existe
      const payment = await TransactionPaymentModel.findById(Number(id));
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }

      // Verificar que la transacción pertenece al usuario
      const transaction = await TransactionModel.findById(payment.transaction_id, userId);
      if (!transaction) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar este pago'
        });
        return;
      }

      // Si se modifica el monto, verificar que no exceda el total
      if (amount && Number(amount) !== payment.amount) {
        const totalPaid = await TransactionPaymentModel.getTotalPaidAmount(payment.transaction_id);
        const newTotal = totalPaid - payment.amount + Number(amount);
        
        if (newTotal > transaction.amount_total) {
          res.status(400).json({
            success: false,
            message: `El monto total de pagos no puede exceder ${transaction.amount_total}`
          });
          return;
        }
      }
      
      const success = await TransactionPaymentModel.update(Number(id), {
        payment_type_id: payment_type_id ? Number(payment_type_id) : undefined,
        amount: amount ? Number(amount) : undefined,
        payment_date,
        reference_number,
        notes
      });
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'No se pudo actualizar el pago'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Pago actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el pago'
      });
    }
  }

  // Delete payment
  static async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de pago inválido'
        });
        return;
      }

      // Verificar que el pago existe
      const payment = await TransactionPaymentModel.findById(Number(id));
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }

      // Verificar que la transacción pertenece al usuario
      const transaction = await TransactionModel.findById(payment.transaction_id, userId);
      if (!transaction) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar este pago'
        });
        return;
      }
      
      const success = await TransactionPaymentModel.delete(Number(id));
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'No se pudo eliminar el pago'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Pago eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pago'
      });
    }
  }

  // Get payment summary for transaction
  static async getPaymentSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { transactionId } = req.params;
      
      // Verificar que la transacción existe y pertenece al usuario
      const transaction = await TransactionModel.findById(transactionId, userId);
      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
        return;
      }

      const payments = await TransactionPaymentModel.findByTransactionId(transactionId);
      const totalPaid = await TransactionPaymentModel.getTotalPaidAmount(transactionId);
      const remaining = transaction.amount_total - totalPaid;
      
      res.status(200).json({
        success: true,
        data: {
          transaction_total: transaction.amount_total,
          total_paid: totalPaid,
          remaining_amount: remaining,
          payment_count: payments.length,
          payments: payments
        }
      });
    } catch (error) {
      console.error('Error al obtener el resumen de pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el resumen de pagos'
      });
    }
  }
}
