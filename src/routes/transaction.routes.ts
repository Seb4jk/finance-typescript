import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authenticateToken } from '../middleware/auth/authenticateToken';

const router = Router();
const transactionController = new TransactionController();

// All transaction routes require authentication
router.use(authenticateToken);

router.post('/', (req, res) => void transactionController.createTransaction(req, res));
router.get('/', (req, res) => void transactionController.getTransactions(req, res));
router.get('/summary', (req, res) => void transactionController.getSummary(req, res));
router.get('/:id', (req, res) => void transactionController.getTransactionById(req, res));
router.put('/:id', (req, res) => void transactionController.updateTransaction(req, res));
router.delete('/:id', (req, res) => void transactionController.deleteTransaction(req, res));

export default router;
