import { Router } from 'express';
import {
  createScreening,
  getScreeningsByPersonnel,
  getScreeningById,
  getClearanceByQR,
  revokeClearance
} from '../controllers/screeningController';

const router = Router();

router.post('/', createScreening);
router.get('/personnel/:personnelId', getScreeningsByPersonnel);
router.get('/:id', getScreeningById);
router.get('/clearance/qr/:qrCode', getClearanceByQR);
router.put('/clearance/:id/revoke', revokeClearance);

export default router;
