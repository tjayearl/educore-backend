import pool from '../config/postgres.js';

/**
 * Audit Logger Middleware
 * Logs all admin actions to the database for compliance and security
 * 
 * @param {string} action - The action being performed (e.g., 'CREATE_COURSE', 'ADD_LESSON')
 * @param {string} resourceType - Type of resource (e.g., 'course', 'lesson', 'user')
 */
export const auditLogger = (action, resourceType) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Store original send function
    const originalSend = res.send;
    
    // Override res.send to capture response
    res.send = function(data) {
      const statusCode = res.statusCode;
      const success = statusCode >= 200 && statusCode < 300;
      
      // Parse response data to get user info for LOGIN/REGISTER
      let parsedData = null;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        parsedData = null;
      }

      // For LOGIN/REGISTER, extract user info from response
      let logUserId = userId;
      let logUserRole = userRole;
      let logUserEmail = null;
      let logUserName = null;

      // Insert log function
      const insertLog = () => {
        pool.query(`
          INSERT INTO audit_logs (
            user_id, 
            user_role, 
            user_name,
            user_email,
            action, 
            resource_type, 
            resource_id,
            status_code,
            success,
            ip_address,
            user_agent,
            request_body,
            response_body,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        `, [
          logUserId,
          logUserRole,
          logUserName,
          logUserEmail,
          action,
          resourceType,
          req.params.id || req.params.courseId || null,
          statusCode,
          success,
          ipAddress,
          userAgent,
          JSON.stringify(req.body),
          typeof data === 'string' ? data.substring(0, 1000) : JSON.stringify(data).substring(0, 1000)
        ]).catch(err => console.error('Audit log error:', err));
      };

      if ((action === 'LOGIN' || action === 'REGISTER') && parsedData?.user) {
        logUserId = parsedData.user.id;
        logUserRole = parsedData.user.role;
        logUserEmail = parsedData.user.email;
        logUserName = parsedData.user.full_name;
      } else if (userId) {
        // For authenticated actions, get user info from database
        pool.query('SELECT full_name, email FROM users WHERE id = $1', [userId])
          .then(result => {
            if (result.rows.length > 0) {
              logUserEmail = result.rows[0].email;
              logUserName = result.rows[0].full_name;
            }
            insertLog();
          })
          .catch(err => {
            console.error('Error fetching user info for audit:', err);
            insertLog();
          });
        
        // Call original send and return (log insertion happens async)
        originalSend.call(this, data);
        return;
      }
      
      // Insert log and call original send
      insertLog();
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};