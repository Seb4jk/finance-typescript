import { Router } from 'express';
import { RegionController } from '../controllers/RegionController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const regionController = new RegionController();

// Proteger todas las rutas con middleware de autenticación
router.use(authenticateToken);

router.get('/', (req, res) => regionController.getRegions(req, res));

export default router;
