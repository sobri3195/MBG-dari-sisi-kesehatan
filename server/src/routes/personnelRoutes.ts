import { Router } from 'express';
import {
  createPersonnel,
  getAllPersonnel,
  getPersonnelById,
  updatePersonnel,
  updateHealthProfile
} from '../controllers/personnelController';

const router = Router();

router.post('/', createPersonnel);
router.get('/', getAllPersonnel);
router.get('/:id', getPersonnelById);
router.put('/:id', updatePersonnel);
router.put('/:id/health-profile', updateHealthProfile);

export default router;
