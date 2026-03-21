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

// ================= UPDATE COURSE (Admin Only) =================
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const instructorId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Check if course exists and belongs to this admin
    const checkResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND instructor_id = $2',
      [id, instructorId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // Update the course
    const result = await pool.query(`
      UPDATE courses 
      SET title = $1, description = $2, category = $3, updated_at = NOW()
      WHERE id = $4 AND instructor_id = $5
      RETURNING id, title, description, category, updated_at
    `, [title, description, category || 'General', id, instructorId]);

    res.json({
      message: 'Course updated successfully',
      course: result.rows[0]
    });
  } catch (error) {
    console.error('UPDATE COURSE ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= DELETE COURSE (Admin Only) =================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    // Check if course exists and belongs to this admin
    const checkResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND instructor_id = $2',
      [id, instructorId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    // Delete the course (cascade will delete lessons and progress)
    await pool.query(
      'DELETE FROM courses WHERE id = $1 AND instructor_id = $2',
      [id, instructorId]
    );

    res.json({
      message: 'Course deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('DELETE COURSE ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};