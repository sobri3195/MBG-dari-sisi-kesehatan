import { Router } from 'express';
import {
  createMedicalPost,
  getAllMedicalPosts,
  getMedicalPostById,
  updateMedicalPost,
  addInventoryItem,
  updateInventoryItem,
  getInventoryByPost,
  getLowStockItems
} from '../controllers/medicalPostController';

const router = Router();

router.post('/', createMedicalPost);
router.get('/', getAllMedicalPosts);
router.get('/:id', getMedicalPostById);
router.put('/:id', updateMedicalPost);

router.post('/inventory', addInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.get('/:postId/inventory', getInventoryByPost);
router.get('/inventory/low-stock', getLowStockItems);

export default router;
