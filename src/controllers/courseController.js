import pool from '../config/postgres.js';

// ================= GET ALL COURSES (Browse Catalog) =================
export const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.category,
        c.created_at,
        u.full_name as instructor_name,
        COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN lessons l ON c.id = l.course_id
      GROUP BY c.id, u.full_name
      ORDER BY c.created_at DESC
    `);

    res.json({
      courses: result.rows
    });
  } catch (error) {
    console.error('GET ALL COURSES ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET COURSE BY ID (View Course Details) =================
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseResult = await pool.query(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.category,
        c.created_at,
        u.full_name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      course: courseResult.rows[0]
    });
  } catch (error) {
    console.error('GET COURSE BY ID ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= CREATE COURSE (Admin Only) =================
export const createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const instructorId = req.user.id; // From auth middleware

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const result = await pool.query(`
      INSERT INTO courses (title, description, category, instructor_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, title, description, category, created_at
    `, [title, description, category || 'General', instructorId]);

    res.status(201).json({
      message: 'Course created successfully',
      course: result.rows[0]
    });
  } catch (error) {
    console.error('CREATE COURSE ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET MY COURSES (Admin) =================
export const getMyCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const result = await pool.query(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.category,
        c.created_at,
        COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.instructor_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [instructorId]);

    res.json({
      courses: result.rows
    });
  } catch (error) {
    console.error('GET MY COURSES ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};