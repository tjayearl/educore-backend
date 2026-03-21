import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  getMyCourses 
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllCourses);
router.get('/:id', authMiddleware, getCourseById);
router.post('/', authMiddleware, adminOnly, createCourse);
router.get('/my/created', authMiddleware, adminOnly, getMyCourses);

export default router;