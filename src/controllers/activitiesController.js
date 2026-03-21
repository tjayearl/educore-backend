import pool from '../config/postgres.js';

/**
 * Get all user activities (audit logs)
 * Admin only - for compliance and security monitoring
 */
export const getAllActivities = async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId, action, startDate, endDate } = req.query;

    // Build dynamic query based on filters
    let query = `
      SELECT 
        al.id,
        al.user_id,
        u.full_name as user_name,
        u.email as user_email,
        al.user_role,
        al.action,
        al.resource_type,
        al.resource_id,
        al.status_code,
        al.success,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    // Apply filters
    if (userId) {
      query += ` AND al.user_id = $${paramCount}`;
      queryParams.push(userId);
      paramCount++;
    }

    if (action) {
      query += ` AND al.action = $${paramCount}`;
      queryParams.push(action);
      paramCount++;
    }

    if (startDate) {
      query += ` AND al.created_at >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND al.created_at <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM audit_logs'
    );

    res.json({
      activities: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('GET ACTIVITIES ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get activity statistics
 * Admin only - dashboard overview
 */
export const getActivityStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE action = 'CREATE_COURSE') as courses_created,
        COUNT(*) FILTER (WHERE action = 'ADD_LESSON') as lessons_added,
        COUNT(*) FILTER (WHERE action = 'REGISTER') as new_registrations,
        COUNT(*) FILTER (WHERE action = 'LOGIN') as total_logins,
        COUNT(*) FILTER (WHERE success = false) as failed_actions,
        COUNT(DISTINCT user_id) as active_users
      FROM audit_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    console.error('GET ACTIVITY STATS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};