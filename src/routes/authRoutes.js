const express = require('express');
const { register, login } = require('../controllers/authController');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/register', auditLogger('USER_REGISTERED', 'user'), register);
router.post('/login', auditLogger('USER_LOGGED_IN', 'user'), login);

module.exports = router;