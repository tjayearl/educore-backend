const express = require('express');
const { updateLesson, deleteLesson } = require('../controllers/lessonController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.put('/:id', authMiddleware, adminOnly, auditLogger('UPDATE_LESSON', 'lesson'), updateLesson);
router.delete('/:id', authMiddleware, adminOnly, auditLogger('DELETE_LESSON', 'lesson'), deleteLesson);

module.exports = router;