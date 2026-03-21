import express from "express";
import { register, login } from "../controllers/authController.js";
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = express.Router();

router.post('/register', validateRegister, auditLogger('REGISTER', 'user'), register);
router.post('/login', validateLogin, auditLogger('LOGIN', 'user'), login);

export default router;