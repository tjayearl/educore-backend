import pool from './postgres.js';

export const initPostgresDB = async () => {
  try {
    console.log('🔄 Initializing PostgreSQL database...');

    // Create users table (IF NOT EXISTS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'learner',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create courses table (IF NOT EXISTS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create lessons table (IF NOT EXISTS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content_type VARCHAR(50),
        lesson_order INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create progress table (IF NOT EXISTS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      )
    `);

    // Create audit_logs table (IF NOT EXISTS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_role VARCHAR(50),
        user_name VARCHAR(255),
        user_email VARCHAR(255),
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

    // Add user_name and user_email columns if they don't exist (migration)
    await pool.query(`
      DO $$ 
      BEGIN
        BEGIN
          ALTER TABLE audit_logs ADD COLUMN user_name VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
        BEGIN
          ALTER TABLE audit_logs ADD COLUMN user_email VARCHAR(255);
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;
      END $$;
    `);

    // Create indexes if they don't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)
    `);

    console.log('✅ PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('❌ PostgreSQL initialization error:', error);
    throw error;
  }
};