const express = require('express');
const { markLessonComplete, getUserProgress } = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, auditLogger('LESSON_COMPLETED', 'progress'), markLessonComplete);
router.get('/:courseId', authMiddleware, getUserProgress);

module.exports = router;