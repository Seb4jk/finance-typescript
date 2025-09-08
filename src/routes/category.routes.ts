import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const categoryController = new CategoryController();

// All category routes require authentication
router.use(authenticateToken);

router.post('/', (req, res) => void categoryController.createCategory(req, res));
router.get('/', (req, res) => void categoryController.getCategories(req, res));
router.get('/:id', (req, res) => void categoryController.getCategoryById(req, res));
router.put('/:id', (req, res) => void categoryController.updateCategory(req, res));
router.delete('/:id', (req, res) => void categoryController.deleteCategory(req, res));

export default router;
