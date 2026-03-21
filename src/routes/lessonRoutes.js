import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { validateLesson } from '../middleware/validation.js';
import { auditLogger } from '../middleware/auditLogger.js';
import { getLessonsByCourse, createLesson } from '../controllers/lessonController.js';

const router = express.Router();

router.get('/:courseId/lessons', authMiddleware, getLessonsByCourse);
router.post('/:courseId/lessons', authMiddleware, adminOnly, validateLesson, auditLogger('ADD_LESSON', 'lesson'), createLesson);

export default router;