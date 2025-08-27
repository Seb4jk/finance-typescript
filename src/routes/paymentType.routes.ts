import { Router } from 'express';
import { PaymentTypeController } from '../controllers/PaymentTypeController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const paymentTypeController = new PaymentTypeController();

// Rutas para tipos de pago
router.get('/', authenticateToken, paymentTypeController.getPaymentTypes);
router.get('/:id', authenticateToken, paymentTypeController.getPaymentTypeById);

export default router;
