import pool from './postgres.js';

export const initPostgresDB = async () => {
  try {
    // Drop existing tables (in reverse order due to foreign keys)
    await pool.query('DROP TABLE IF EXISTS audit_logs CASCADE');
    await pool.query('DROP TABLE IF EXISTS progress CASCADE');
    await pool.query('DROP TABLE IF EXISTS lessons CASCADE');
    await pool.query('DROP TABLE IF EXISTS courses CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'learner',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create courses table
    await pool.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create lessons table
    await pool.query(`
      CREATE TABLE lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content_type VARCHAR(50),
        lesson_order INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create progress table
    await pool.query(`
      CREATE TABLE progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      )
    `);

    // Create audit_logs table for compliance and security
    await pool.query(`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id INTEGER,
        status_code INTEGER,
        success BOOLEAN,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_body TEXT,
        response_body TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster audit log queries
    await pool.query(`
      CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
    `);

    console.log('✓ PostgreSQL tables initialized');
  } catch (error) {
    console.error('PostgreSQL initialization error:', error);
    throw error;
  }
};