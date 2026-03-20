-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'learner' CHECK (role IN ('admin', 'learner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table (For "View User Activities" User Story)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,      -- e.g., 'CREATE_COURSE', 'LOGIN'
  entity_type VARCHAR(100) NOT NULL, -- e.g., 'course', 'lesson'
  entity_id VARCHAR(100),            -- ID of the affected entity
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);

-- Seed Initial Admin User (Password: admin123)
-- Hash generated via bcrypt for 'admin123'
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@educore.com', 
  '$2b$10$wT2.O9/i.o4yS.g5i.k.ue/7./.u.1.2.3.4.5.6.7.8.9.0', 
  'System Admin', 
  'admin'
) 
ON CONFLICT (email) DO NOTHING;