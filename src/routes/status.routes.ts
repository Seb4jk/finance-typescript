import { Router } from 'express';
import { StatusController } from '../controllers/StatusController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const statusController = new StatusController();

// Rutas para estados
router.get('/', authenticateToken, statusController.getStatuses);
router.get('/:id', authenticateToken, statusController.getStatusById);

export default router;
