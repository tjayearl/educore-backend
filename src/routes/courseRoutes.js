const express = require('express');
const { 
  createCourse, 
  getAllCourses, 
  getMyCourses,
  getCourseById, 
  updateCourse, 
  deleteCourse 
} = require('../controllers/courseController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const router = express.Router();

// Admin: Create course
router.post('/', authMiddleware, adminOnly, auditLogger('COURSE_CREATED', 'course'), createCourse);

// Both: Browse all courses (catalog)
router.get('/', authMiddleware, getAllCourses);

// Admin: View my created courses
router.get('/my-courses', authMiddleware, adminOnly, getMyCourses);

// Both: View course details
router.get('/:id', authMiddleware, getCourseById);

// Admin: Update course
router.put('/:id', authMiddleware, adminOnly, auditLogger('COURSE_UPDATED', 'course'), updateCourse);

// Admin: Delete course
router.delete('/:id', authMiddleware, adminOnly, auditLogger('COURSE_DELETED', 'course'), deleteCourse);

module.exports = router;