import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const clientController = new ClientController();

// Proteger todas las rutas con middleware de autenticación
router.use(authenticateToken);

// Rutas para clientes
router.post('/', clientController.createClient);
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;
