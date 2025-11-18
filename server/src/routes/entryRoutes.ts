import { Router } from 'express';
import {
  createEntryCheck,
  getEntryChecks,
  getEntryCheckById,
  getEntryStats
} from '../controllers/entryController';

const router = Router();

router.post('/', createEntryCheck);
router.get('/', getEntryChecks);
router.get('/stats', getEntryStats);
router.get('/:id', getEntryCheckById);

export default router;
