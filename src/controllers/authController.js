const pool = require('../config/postgres');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { isValidEmail, isStrongPassword } = require('../utils/validation');

const register = async (req, res) => {
  try {
    let { email, password, full_name, role } = req.body;

    // Sanitize input
    email = email ? email.trim().toLowerCase() : null;
    full_name = full_name ? full_name.trim() : null;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user (defaulting to 'learner' if role not provided/valid)
    const userRole = role === 'admin' ? 'admin' : 'learner';
    
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, full_name, userRole]
    );

    const user = newUser.rows[0];
    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (email) email = email.trim().toLowerCase();

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    // Remove password from response
    delete user.password_hash;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error details:', error.message);
    // If in development or if the error is a configuration issue, log the stack
    if (process.env.NODE_ENV !== 'production' || !process.env.JWT_SECRET) console.error(error.stack);
    
    res.status(500).json({ message: 'Server error. Check server logs for details.' });
  }
};

module.exports = { register, login };