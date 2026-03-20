import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

// Check critical environment variables
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined. Authentication will fail.');
}
if (!process.env.PG_HOST) {
  console.warn('WARNING: PG_HOST is not defined. Database connection will fail.');
}

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.removeHeader('X-Powered-By');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/activities', activityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }

  // PostgreSQL Unique Violation (e.g., duplicate email)
  if (err.code === '23505') {
    return res.status(400).json({ 
      message: 'Duplicate entry: Resource already exists' 
    });
  }

  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;