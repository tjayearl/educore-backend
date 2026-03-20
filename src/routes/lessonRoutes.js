import express from 'express';
import { updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import auditLogger from '../middleware/auditLogger.js';

const router = express.Router();

router.put('/:id', authMiddleware, adminOnly, auditLogger('UPDATE_LESSON', 'lesson'), updateLesson);
router.delete('/:id', authMiddleware, adminOnly, auditLogger('DELETE_LESSON', 'lesson'), deleteLesson);

export default router;