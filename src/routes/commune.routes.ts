import { Router } from 'express';
import { CommuneController } from '../controllers/CommuneController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const communeController = new CommuneController();

// Proteger todas las rutas con middleware de autenticación
router.use(authenticateToken);

router.get('/', (req, res) => communeController.getCommunes(req, res));

export default router;
