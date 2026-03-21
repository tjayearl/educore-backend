import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { getAdminStats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/admin', authMiddleware, adminOnly, getAdminStats);

export default router;