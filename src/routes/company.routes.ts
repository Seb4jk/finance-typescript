import express from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Define routes
router.get('/assigned', CompanyController.getUserAssignedCompanies);
router.get('/', CompanyController.getCompanies);
router.get('/:id', CompanyController.getCompanyById);
router.post('/', CompanyController.createCompany);
router.put('/:id', CompanyController.updateCompany);
router.post('/:id/users', CompanyController.addUserToCompany);
router.delete('/:id/users/:user_id', CompanyController.removeUserFromCompany);

export default router;
