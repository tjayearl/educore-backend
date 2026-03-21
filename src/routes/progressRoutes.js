import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  getProgress, 
  markLessonComplete, 
  getAllProgress 
} from '../controllers/progressController.js';

const router = express.Router();

router.get('/all', authMiddleware, getAllProgress);
router.get('/:courseId', authMiddleware, getProgress);
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, markLessonComplete);

export default router;