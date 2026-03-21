import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { validateCourse } from '../middleware/validation.js';
import { auditLogger } from '../middleware/auditLogger.js';
import { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  getMyCourses,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllCourses);
router.get('/my/created', authMiddleware, adminOnly, getMyCourses);
router.get('/:id', authMiddleware, getCourseById);
router.post('/', authMiddleware, adminOnly, validateCourse, auditLogger('CREATE_COURSE', 'course'), createCourse);
router.put('/:id', authMiddleware, adminOnly, validateCourse, auditLogger('UPDATE_COURSE', 'course'), updateCourse);
router.delete('/:id', authMiddleware, adminOnly, auditLogger('DELETE_COURSE', 'course'), deleteCourse);

export default router;