import { Router } from 'express';
import categoryRoutes from './category.routes';
import transactionRoutes from './transaction.routes';
import clientRoutes from './client.routes';
import vendorRoutes from './vendor.routes';
import paymentTypeRoutes from './paymentType.routes';
import statusRoutes from './status.routes';
import documentTypeRoutes from './documentType.routes';
import taxRateRoutes from './taxRate.routes';
import companyRoutes from './company.routes';
import transactionPaymentRoutes from './transactionPayment.routes';
import regionRoutes from './region.routes';
import communeRoutes from './commune.routes';

const router = Router();

// API routes
router.use('/api/v1/categories', categoryRoutes);
router.use('/api/v1/transactions', transactionRoutes);
router.use('/api/v1/clients', clientRoutes);
router.use('/api/v1/vendors', vendorRoutes);
router.use('/api/v1/payment-types', paymentTypeRoutes);
router.use('/api/v1/status', statusRoutes);
router.use('/api/v1/document-types', documentTypeRoutes);
router.use('/api/v1/tax-rates', taxRateRoutes);
router.use('/api/v1/companies', companyRoutes);
router.use('/api/v1', transactionPaymentRoutes);
router.use('/api/v1/regions', regionRoutes);
router.use('/api/v1/communes', communeRoutes);

export default router;
