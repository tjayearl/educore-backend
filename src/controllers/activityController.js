const pool = require('../config/postgres');

const getAllActivities = async (req, res) => {
  try {
    // SQL JOIN operation: Efficiently combining audit_logs and users tables
    const result = await pool.query(`
      SELECT 
        a.*, 
        u.full_name, 
        u.email 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get all activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Relational query with filtering
    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllActivities, getUserActivities };