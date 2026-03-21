import pool from '../config/postgres.js';

// ================= GET ADMIN STATS =================
export const getAdminStats = async (req, res) => {
  try {
    // Count total users (students only, exclude admins)
    const studentsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'learner'"
    );

    // Count total courses
    const coursesResult = await pool.query(
      "SELECT COUNT(*) as count FROM courses"
    );

    // Count total lessons
    const lessonsResult = await pool.query(
      "SELECT COUNT(*) as count FROM lessons"
    );

    res.json({
      stats: {
        totalStudents: parseInt(studentsResult.rows[0].count),
        totalCourses: parseInt(coursesResult.rows[0].count),
        totalLessons: parseInt(lessonsResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('GET ADMIN STATS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};