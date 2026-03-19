const pool = require('../config/postgres');
const Lesson = require('../models/Lesson');

const createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const created_by = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const result = await pool.query(
      'INSERT INTO courses (title, description, category, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, category || 'General', created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.full_name as creator_name
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `);

    // Get lesson counts for each course
    const coursesWithLessons = await Promise.all(
      result.rows.map(async (course) => {
        const lessonCount = await Lesson.countDocuments({ courseId: course.id });
        return { ...course, lesson_count: lessonCount };
      })
    );

    res.json(coursesWithLessons);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courseResult = await pool.query(`
      SELECT 
        c.*,
        u.full_name as creator_name
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ courseId: parseInt(id) }).sort({ order: 1 });

    res.json({
      ...courseResult.rows[0],
      lessons
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const created_by = req.user.id;

    const result = await pool.query(
      'SELECT * FROM courses WHERE created_by = $1 ORDER BY created_at DESC',
      [created_by]
    );

    // Get lesson counts
    const coursesWithLessons = await Promise.all(
      result.rows.map(async (course) => {
        const lessonCount = await Lesson.countDocuments({ courseId: course.id });
        return { ...course, lesson_count: lessonCount };
      })
    );

    res.json(coursesWithLessons);
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const result = await pool.query(
      'UPDATE courses SET title = $1, description = $2, category = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, description, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated lessons first
    await Lesson.deleteMany({ courseId: parseInt(id) });

    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};