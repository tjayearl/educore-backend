import express from 'express';
import { markLessonComplete, getUserProgress } from '../controllers/progressController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId', authMiddleware, getUserProgress);
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, markLessonComplete);

export default router;