import express from 'express';
import { TaxRateController } from '../controllers/TaxRateController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Define routes
router.get('/', TaxRateController.getTaxRates);
router.get('/default', TaxRateController.getDefaultTaxRate);
router.get('/:id', TaxRateController.getTaxRateById);
router.post('/', TaxRateController.createTaxRate);
router.put('/:id', TaxRateController.updateTaxRate);
router.delete('/:id', TaxRateController.deleteTaxRate);

export default router;
