const pool = require('../config/postgres');

const auditLogger = (action, entityType = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async function(data) {
      // Log the audit trail
      try {
        const userId = req.user?.id || null;
        const entityId = data?.id || req.params?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;

        await pool.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, action, entityType, entityId, JSON.stringify({ body: req.body, params: req.params }), ipAddress]
        );
      } catch (error) {
        console.error('Audit logging error:', error);
      }

      return originalJson(data);
    };
    
    next();
  };
};

module.exports = auditLogger;