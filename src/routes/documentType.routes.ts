import express from 'express';
import { DocumentTypeController } from '../controllers/DocumentTypeController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Define routes
router.get('/', DocumentTypeController.getDocumentTypes);
router.get('/:id', DocumentTypeController.getDocumentTypeById);
router.post('/', DocumentTypeController.createDocumentType);
router.put('/:id', DocumentTypeController.updateDocumentType);
router.delete('/:id', DocumentTypeController.deleteDocumentType);

export default router;
