import express from 'express';
import { getAllActivities, getUserActivities } from '../controllers/activityController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Admin can view all activities
router.get('/all', authMiddleware, adminOnly, getAllActivities);

// Users can view their own activities
router.get('/my-activities', authMiddleware, getUserActivities);

export default router;