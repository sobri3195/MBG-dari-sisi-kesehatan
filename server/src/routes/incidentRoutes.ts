import { Router } from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  getIncidentStats
} from '../controllers/incidentController';

const router = Router();

router.post('/', createIncident);
router.get('/', getIncidents);
router.get('/stats', getIncidentStats);
router.get('/:id', getIncidentById);
router.put('/:id', updateIncident);

export default router;
