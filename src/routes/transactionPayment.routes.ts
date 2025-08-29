import express from 'express';
import { TransactionPaymentController } from '../controllers/TransactionPaymentController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Transaction Payment routes
router.get('/transaction/:transactionId/payments', TransactionPaymentController.getPaymentsByTransaction);
router.get('/transaction/:transactionId/payments/summary', TransactionPaymentController.getPaymentSummary);
router.post('/transaction/:transactionId/payments', TransactionPaymentController.createPayment);
router.get('/payments/:id', TransactionPaymentController.getPaymentById);
router.put('/payments/:id', TransactionPaymentController.updatePayment);
router.delete('/payments/:id', TransactionPaymentController.deletePayment);

export default router;
