import { Router } from 'express';
import personnelRoutes from './personnelRoutes';
import screeningRoutes from './screeningRoutes';
import entryRoutes from './entryRoutes';
import incidentRoutes from './incidentRoutes';
import medicalPostRoutes from './medicalPostRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.use('/personnel', personnelRoutes);
router.use('/screenings', screeningRoutes);
router.use('/entries', entryRoutes);
router.use('/incidents', incidentRoutes);
router.use('/medical-posts', medicalPostRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
