import { Router } from 'express';
import { VendorController } from '../controllers/VendorController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const vendorController = new VendorController();

// Proteger todas las rutas con middleware de autenticación
router.use(authenticateToken);

// Rutas para proveedores
router.post('/', vendorController.createVendor);
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;
