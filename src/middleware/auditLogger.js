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
      
      // Log the audit trail
      pool.query(`
        INSERT INTO audit_logs (
          user_id, 
          user_role, 
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `, [
        userId,
        userRole,
        action,
        resourceType,
        req.params.id || req.params.courseId || null,
        statusCode,
        success,
        ipAddress,
        userAgent,
        JSON.stringify(req.body),
        typeof data === 'string' ? data.substring(0, 1000) : JSON.stringify(data).substring(0, 1000) // Limit to 1000 chars
      ]).catch(err => console.error('Audit log error:', err));
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};