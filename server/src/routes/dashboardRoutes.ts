import { Router } from 'express';
import {
  getDashboardStats,
  getRealtimeStatus
} from '../controllers/dashboardController';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/realtime', getRealtimeStatus);

export default router;
