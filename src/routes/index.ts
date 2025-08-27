import { Router } from 'express';
import categoryRoutes from './category.routes';
import transactionRoutes from './transaction.routes';
import clientRoutes from './client.routes';
import vendorRoutes from './vendor.routes';
import paymentTypeRoutes from './paymentType.routes';
import statusRoutes from './status.routes';

const router = Router();

// API routes
router.use('/api/v1/categories', categoryRoutes);
router.use('/api/v1/transactions', transactionRoutes);
router.use('/api/v1/clients', clientRoutes);
router.use('/api/v1/vendors', vendorRoutes);
router.use('/api/v1/payment-types', paymentTypeRoutes);
router.use('/api/v1/status', statusRoutes);

export default router;
