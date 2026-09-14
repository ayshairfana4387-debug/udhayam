import { Router } from 'express';
import {
  healthController,
  userController,
  createRequestController,
  getRequestsController,
  getRequestController,
  updateRequestController,
  deleteRequestController,
  statisticsController
} from '../controllers/requestController.js';
import { validateRequest, validateUser } from '../middleware/validate.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Udyam Sahayak API is running', timestamp: new Date().toISOString() });
});
router.get('/health', healthController);
router.post('/users', validateUser, userController);
router.post('/requests', validateRequest, createRequestController);
router.get('/requests', getRequestsController);
router.get('/requests/:id', getRequestController);
router.put('/requests/:id', updateRequestController);
router.delete('/requests/:id', deleteRequestController);
router.get('/statistics', statisticsController);

export default router;
