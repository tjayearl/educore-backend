const express = require('express');
const {
  addLesson,
  getLessonsByCourse,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/:courseId/lessons', authMiddleware, adminOnly, auditLogger('LESSON_ADDED', 'lesson'), addLesson);
router.get('/:courseId/lessons', authMiddleware, getLessonsByCourse);
router.put('/lessons/:id', authMiddleware, adminOnly, auditLogger('LESSON_UPDATED', 'lesson'), updateLesson);
router.delete('/lessons/:id', authMiddleware, adminOnly, auditLogger('LESSON_DELETED', 'lesson'), deleteLesson);

module.exports = router;