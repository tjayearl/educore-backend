import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { getAllActivities, getActivityStats } from '../controllers/activitiesController.js';

const router = express.Router();

router.get('/all', authMiddleware, adminOnly, getAllActivities);
router.get('/stats', authMiddleware, adminOnly, getActivityStats);

export default router;