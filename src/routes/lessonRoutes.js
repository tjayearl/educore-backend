import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { getLessonsByCourse, createLesson } from '../controllers/lessonController.js';

const router = express.Router();

router.get('/:courseId/lessons', authMiddleware, getLessonsByCourse);
router.post('/:courseId/lessons', authMiddleware, adminOnly, createLesson);

export default router;