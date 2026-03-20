const pool = require('../config/postgres');

const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    // Capture the original send function to intercept the response
    const originalSend = res.json;

    res.json = function (body) {
      // Restore original function to avoid infinite loop
      res.json = originalSend;

      // Execute logging asynchronously (fire and forget)
      // We use setImmediate to ensure we don't block the response
      setImmediate(async () => {
        try {
          // Only log successful operations (2xx status codes)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Try to get user from request (Auth middleware) or response body (Login/Register)
            const userId = req.user ? req.user.id : (body && body.user ? body.user.id : null);
            
            const entityId = body.id || body._id || (req.params.id ? req.params.id : null);
            
            // details can be the body title, or specific updates
            const details = body.title || req.body.title || 'Operation completed';

            await pool.query(
              `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) 
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [userId, action, entityType, entityId, details, req.ip]
            );
          }
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });

      // Call the original response
      return originalSend.call(this, body);
    };

    next();
  };
};

module.exports = auditLogger;