import pool from '../config/postgres.js';
import mongoose from 'mongoose';

// MongoDB Progress Schema
const progressSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  courseId: { type: Number, required: true },
  lessonId: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

// ================= GET PROGRESS FOR A COURSE =================
export const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get all lessons for this course from PostgreSQL
    const lessonsResult = await pool.query(`
      SELECT id, title, content_type, lesson_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC, created_at ASC
    `, [courseId]);

    const totalLessons = lessonsResult.rows.length;

    // Get completed lessons from MongoDB
    const completedLessons = await Progress.find({
      userId,
      courseId: parseInt(courseId)
    });

    const completedLessonIds = completedLessons.map(p => p.lessonId);

    res.json({
      progress: {
        courseId: parseInt(courseId),
        totalLessons,
        completedLessons: completedLessonIds.length,
        percentage: totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0,
        completedLessonIds
      }
    });
  } catch (error) {
    console.error('GET PROGRESS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= MARK LESSON AS COMPLETE =================
export const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Check if lesson exists in PostgreSQL
    const lessonExists = await pool.query(`
      SELECT id FROM lessons WHERE id = $1 AND course_id = $2
    `, [lessonId, courseId]);

    if (lessonExists.rows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Mark as complete in MongoDB (upsert to handle duplicates)
    await Progress.findOneAndUpdate(
      { userId, lessonId: parseInt(lessonId) },
      {
        userId,
        courseId: parseInt(courseId),
        lessonId: parseInt(lessonId),
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Also record in PostgreSQL for relational tracking
    await pool.query(`
      INSERT INTO progress (user_id, course_id, lesson_id, completed_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, lesson_id) DO NOTHING
    `, [userId, courseId, lessonId]);

    res.json({
      message: 'Lesson marked as complete',
      success: true
    });
  } catch (error) {
    console.error('MARK COMPLETE ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET ALL USER PROGRESS (Dashboard Stats) =================
export const getAllProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all courses
    const coursesResult = await pool.query(`
      SELECT c.id, c.title, COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      GROUP BY c.id
    `);

    // Get user's completed lessons from MongoDB
    const completedLessons = await Progress.find({ userId });

    // Calculate progress per course
    const progress = coursesResult.rows.map(course => {
      const completed = completedLessons.filter(
        p => p.courseId === course.id
      ).length;

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalLessons: parseInt(course.total_lessons),
        completedLessons: completed,
        percentage: course.total_lessons > 0 
          ? Math.round((completed / course.total_lessons) * 100) 
          : 0
      };
    });

    res.json({ progress });
  } catch (error) {
    console.error('GET ALL PROGRESS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};