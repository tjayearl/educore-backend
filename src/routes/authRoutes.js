const express = require('express');
const { register, login } = require('../controllers/authController');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/register', auditLogger('REGISTER', 'user'), register);
router.post('/login', auditLogger('LOGIN', 'session'), login);

module.exports = router;