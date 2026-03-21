import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { validateCourse } from '../middleware/validation.js';
import { auditLogger } from '../middleware/auditLogger.js';
import { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  getMyCourses 
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllCourses);
router.get('/:id', authMiddleware, getCourseById);
router.post('/', authMiddleware, adminOnly, validateCourse, auditLogger('CREATE_COURSE', 'course'), createCourse);
router.get('/my/created', authMiddleware, adminOnly, getMyCourses);

export default router;