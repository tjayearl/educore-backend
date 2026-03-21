import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import activitiesRoutes from './routes/activitiesRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Trust proxy (for accurate IP addresses behind Render)
app.set('trust proxy', true);

// Root route - API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Educore LMS API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      courses: {
        getAll: 'GET /api/courses',
        getById: 'GET /api/courses/:id',
        create: 'POST /api/courses (Admin only)',
        update: 'PUT /api/courses/:id (Admin only)',
        delete: 'DELETE /api/courses/:id (Admin only)',
        getMyCourses: 'GET /api/courses/my/created (Admin only)'
      },
      lessons: {
        getByCourse: 'GET /api/courses/:courseId/lessons',
        create: 'POST /api/courses/:courseId/lessons (Admin only)'
      },
      progress: {
        getAll: 'GET /api/progress/all',
        getByCourse: 'GET /api/progress/:courseId',
        markComplete: 'POST /api/progress/:courseId/lessons/:lessonId/complete'
      },
      activities: {
        getAll: 'GET /api/activities/all (Admin only)',
        getStats: 'GET /api/activities/stats (Admin only)'
      },
      stats: {
        adminStats: 'GET /api/stats/admin (Admin only)'
      }
    },
    documentation: 'https://github.com/yourusername/educore-lms'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      '/',
      '/health',
      '/api/auth/*',
      '/api/courses/*',
      '/api/progress/*',
      '/api/activities/*',
      '/api/stats/*'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;