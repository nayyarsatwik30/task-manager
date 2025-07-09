# Task Manager Backend

A Node.js + Express backend for the Task Manager application with MySQL database integration.

## 🚀 Features

- **RESTful API** for task management
- **MySQL Database** integration with connection pooling
- **CORS** enabled for frontend communication
- **Security** with Helmet middleware
- **Logging** with Morgan
- **Environment** configuration with dotenv
- **Error handling** and validation

## 📋 API Endpoints

### Tasks

- `GET /api/tasks` - Fetch all tasks
- `GET /api/tasks/:id` - Fetch single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/status/:status` - Get tasks by status

### Health Check

- `GET /health` - Server health status

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `config.env` and update the database credentials:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

Make sure you have MySQL running and create the database:

```sql
CREATE DATABASE task_manager;
```

The application will automatically create the `tasks` table on startup.

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📊 Database Schema

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 API Request Examples

### Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task manager app",
    "status": "pending",
    "priority": "high",
    "due_date": "2024-12-31"
  }'
```

### Get All Tasks

```bash
curl http://localhost:5000/api/tasks
```

### Update Task

```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete Task

```bash
curl -X DELETE http://localhost:5000/api/tasks/1
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## 🔒 Security Features

- **Helmet** for security headers
- **CORS** configuration
- **Input validation**
- **SQL injection prevention** with parameterized queries
- **Error message sanitization**

## 📝 Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `DB_*` - Database configuration
- `CORS_ORIGIN` - Allowed CORS origin

## 🔗 Frontend Integration

The backend is configured to work with the React frontend running on `http://localhost:3000`. Update the `CORS_ORIGIN` in `config.env` if your frontend runs on a different port.
