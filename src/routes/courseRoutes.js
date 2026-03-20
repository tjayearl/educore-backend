const express = require('express');
const { 
  createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, getMyCourses 
} = require('../controllers/courseController');
const { 
  addLesson, getLessonsByCourse 
} = require('../controllers/lessonController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Public course viewing
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Course Management (Admin)
router.post('/', authMiddleware, adminOnly, auditLogger('CREATE_COURSE', 'course'), createCourse);
router.put('/:id', authMiddleware, adminOnly, auditLogger('UPDATE_COURSE', 'course'), updateCourse);
router.delete('/:id', authMiddleware, adminOnly, auditLogger('DELETE_COURSE', 'course'), deleteCourse);

// Instructor specific
router.get('/my/created', authMiddleware, adminOnly, getMyCourses);

// Nested Lesson Routes
router.get('/:courseId/lessons', getLessonsByCourse);
router.post('/:courseId/lessons', authMiddleware, adminOnly, auditLogger('ADD_LESSON', 'lesson'), addLesson);

module.exports = router;