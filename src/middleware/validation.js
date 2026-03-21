import { body, param, validationResult } from 'express-validator';

/**
 * Validation error handler
 * Returns validation errors in a consistent format
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Course validation rules
export const validateCourse = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  handleValidationErrors
];

// Lesson validation rules
export const validateLesson = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('contentType')
    .notEmpty().withMessage('Content type is required')
    .isIn(['video', 'text']).withMessage('Content type must be either "video" or "text"'),
  body('contentUrl')
    .if(body('contentType').equals('video'))
    .notEmpty().withMessage('Video URL is required for video lessons')
    .isURL().withMessage('Invalid URL format'),
  body('contentBody')
    .if(body('contentType').equals('text'))
    .notEmpty().withMessage('Text content is required for text lessons')
    .isLength({ min: 10 }).withMessage('Text content must be at least 10 characters'),
  param('courseId')
    .isInt({ min: 1 }).withMessage('Invalid course ID'),
  handleValidationErrors
];

// Auth validation rules
export const validateRegister = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['learner', 'admin']).withMessage('Role must be either "learner" or "admin"'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];