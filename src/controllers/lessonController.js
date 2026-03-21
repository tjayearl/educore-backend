import pool from '../config/postgres.js';
import mongoose from 'mongoose';

// MongoDB Lesson Schema
const lessonContentSchema = new mongoose.Schema({
  lessonId: { type: Number, required: true, unique: true },
  courseId: { type: Number, required: true },
  title: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'text'], required: true },
  contentUrl: { type: String },
  contentBody: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const LessonContent = mongoose.models.LessonContent || mongoose.model('LessonContent', lessonContentSchema);

// ================= GET LESSONS BY COURSE =================
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get lesson metadata from PostgreSQL
    const pgResult = await pool.query(`
      SELECT id, course_id, title, content_type, lesson_order, created_at
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC, created_at ASC
    `, [courseId]);

    // Get lesson content from MongoDB
    const lessonIds = pgResult.rows.map(row => row.id);
    const mongoLessons = await LessonContent.find({ lessonId: { $in: lessonIds } });

    // Merge PostgreSQL metadata with MongoDB content
    const lessons = pgResult.rows.map(pgLesson => {
      const mongoLesson = mongoLessons.find(ml => ml.lessonId === pgLesson.id);
      return {
        id: pgLesson.id,
        title: pgLesson.title,
        contentType: pgLesson.content_type,
        contentUrl: mongoLesson?.contentUrl,
        contentBody: mongoLesson?.contentBody,
        order: pgLesson.lesson_order,
        createdAt: pgLesson.created_at
      };
    });

    res.json({ lessons });
  } catch (error) {
    console.error('GET LESSONS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= CREATE LESSON (Admin Only) =================
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, contentType, contentUrl, contentBody } = req.body;

    if (!title || !contentType) {
      return res.status(400).json({ message: 'Title and content type are required' });
    }

    // Validate content based on type
    if (contentType === 'video' && !contentUrl) {
      return res.status(400).json({ message: 'Video URL is required for video lessons' });
    }
    if (contentType === 'text' && !contentBody) {
      return res.status(400).json({ message: 'Text content is required for text lessons' });
    }

    // Insert lesson metadata into PostgreSQL
    const pgResult = await pool.query(`
      INSERT INTO lessons (course_id, title, content_type, lesson_order, created_at)
      VALUES ($1, $2, $3, 
        (SELECT COALESCE(MAX(lesson_order), 0) + 1 FROM lessons WHERE course_id = $1),
        NOW())
      RETURNING id, course_id, title, content_type, lesson_order, created_at
    `, [courseId, title, contentType]);

    const lessonId = pgResult.rows[0].id;

    // Store lesson content in MongoDB
    const mongoLesson = new LessonContent({
      lessonId,
      courseId: parseInt(courseId),
      title,
      contentType,
      contentUrl: contentType === 'video' ? contentUrl : undefined,
      contentBody: contentType === 'text' ? contentBody : undefined
    });

    await mongoLesson.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson: {
        id: lessonId,
        title,
        contentType,
        contentUrl,
        contentBody
      }
    });
  } catch (error) {
    console.error('CREATE LESSON ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};