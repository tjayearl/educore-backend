# Educore LMS - Backend API

RESTful API for a Learning Management System built with Node.js, Express, PostgreSQL, and MongoDB

## 🌐 Live Demo
**API Base URL**: https://educore-backend-7p4o.onrender.com  
**Health Check**: https://educore-backend-7p4o.onrender.com/health

> **⚠️ Development Note**: The production PostgreSQL database restricts external connections. 
> For frontend development, please utilize the **Live API URL** above. 
> There is no need to run the backend locally unless you are developing backend features with a local database.

## 📋 Overview
Educore LMS backend is a full-stack learning management system API that demonstrates:

- **Hybrid database architecture** (PostgreSQL + MongoDB)
- **JWT-based authentication** with role-based access control
- **RESTful API design principles**
- **Docker containerization** for consistent deployment
- **Production deployment** on Render

Built as part of the **Kenya Broadcasting Corporation (KBC) Junior Full-Stack Developer** assessment.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Databases**: 
  - **PostgreSQL 15** (users, courses, audit logs)
  - **MongoDB 7** (lessons, user progress)
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker & Docker Compose
- **Deployment**: Render (Backend) + MongoDB Atlas

## ✨ Features
**Authentication & Authorization**
- ✅ User registration (Admin/Learner roles)
- ✅ JWT-based login
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt

**Course Management (Admin)**
- ✅ Create, read, update, delete courses
- ✅ Add multimedia lessons (video, text)
- ✅ View all user activities

**Learning Experience (Learner)**
- ✅ Browse course catalog
- ✅ View course details with lessons
- ✅ Track learning progress
- ✅ Mark lessons as complete

**System Features**
- ✅ Automatic audit logging
- ✅ RESTful API architecture
- ✅ Error handling middleware
- ✅ CORS support for frontend integration

## 🗄️ Database Architecture
**Why Hybrid Database Approach?**
- **PostgreSQL (Relational Data)**
  - Users & Courses: ACID compliance, referential integrity
  - Audit Logs: Strong consistency for compliance
  - Complex Queries: JOIN operations for reporting
- **MongoDB (Document Data)**
  - Lessons: Flexible schema for different content types (video, text, quiz)
  - User Progress: Nested arrays for completed lessons
  - Performance: Optimized for frequent updates

**Database Schema**
- **PostgreSQL Tables**
  - `users` (id, email, password_hash, full_name, role, created_at, updated_at)
  - `courses` (id, title, description, category, created_by, created_at, updated_at)
  - `audit_logs` (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
- **MongoDB Collections**
  - `lessons` { courseId, title, contentType, contentUrl, contentBody, order }
  - `userprogresses` { userId, courseId, completedLessons: [{ lessonId, completedAt }], lastAccessedAt }

## 🏗️ Microservices Decomposition Strategy
Although currently built as a modular monolith, the system is designed with "Boundaries" that allow for easy splitting into microservices:

**1. Identity Service (Auth)**
- **Responsibilities**: User registration, login, JWT issuance, Role management.
- **Database**: PostgreSQL (Users table).
- **Communication**: synchronous REST for login, async events for "UserCreated".

**2. Content Management Service (CMS)**
- **Responsibilities**: Course creation, Lesson management (Video/Text/Quiz).
- **Database**: MongoDB (Lessons), PostgreSQL (Course Metadata).
- **Why Split?**: High read traffic from learners vs low write traffic from admins. Scaling independent of auth.

**3. Learning Progress Service**
- **Responsibilities**: Tracking completions, calculating scores, Audit logging.
- **Database**: MongoDB (UserProgress), PostgreSQL (AuditLogs).
- **Communication**: Listens for "LessonCompleted" events to update analytics.

**4. API Gateway**
- A unified entry point (e.g., Nginx or Kong) would route requests (`/auth/*`, `/courses/*`) to the respective services.

## 🚀 Getting Started
### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/tjayearl/educore-backend.git
cd educore-backend

# Start services with Docker
docker compose up -d

# Verify services
docker compose ps
curl http://localhost:5000/health
```

### Environment Variables
```env
NODE_ENV=production
PORT=5000
PG_HOST=your-postgres-host
PG_PORT=5432
PG_USER=your-db-user
PG_PASSWORD=your-db-password
PG_DATABASE=your-database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

## 📚 API Endpoints
### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Courses
- `POST /api/courses` - Create course (Admin only)
- `GET /api/courses` - Browse all courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Lessons
- `POST /api/courses/:courseId/lessons` - Add lesson (Admin only)
- `GET /api/courses/:courseId/lessons` - Get lessons
- `PUT /api/lessons/:id` - Update lesson (Admin only)
- `DELETE /api/lessons/:id` - Delete lesson (Admin only)

### Progress
- `POST /api/progress/:courseId/lessons/:lessonId/complete` - Mark complete
- `GET /api/progress/:courseId` - Get progress

### Audit Logs
- `GET /api/activities/all` - All activities (Admin only)
- `GET /api/activities/my-activities` - My activities

## 👨‍💻 Author
**Tjay Earl**  
Built for **Kenya Broadcasting Corporation (KBC)** Junior Full-Stack Developer Assessment  
Submitted: **March 2026**  
Repository: https://github.com/tjayearl/educore-backend  
Live API: https://educore-backend-7p4o.onrender.com

## 📄 License
This project was created as part of the KBC assessment.

Built with ❤️ for Kenya Broadcasting Corporation (KBC)