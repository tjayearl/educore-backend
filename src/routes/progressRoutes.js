const express = require('express');
const { markLessonComplete, getUserProgress } = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/:courseId', authMiddleware, getUserProgress);
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, markLessonComplete);

module.exports = router;