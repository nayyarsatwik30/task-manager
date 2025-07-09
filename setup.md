# Task Manager - Full Stack Setup Guide

This guide will help you set up the complete Task Manager application with React frontend and Node.js backend.

## 🏗️ Project Structure

```
newpro/
├── backend/                 # Node.js + Express backend
│   ├── server.js           # Main server file
│   ├── db.js              # Database connection
│   ├── routes/
│   │   └── tasks.js       # Task API routes
│   ├── package.json       # Backend dependencies
│   └── config.env         # Environment variables
├── src/                    # React frontend
│   ├── components/
│   │   ├── Dashboard.js   # Dashboard with charts
│   │   ├── TaskForm.js    # Task creation/editing form
│   │   └── ...
│   ├── hooks/
│   │   └── useTasks.js    # Custom hook for task management
│   ├── services/
│   │   └── api.js         # API service with axios
│   └── pages/
│       └── MyTasks.js     # Task management page
└── package.json           # Frontend dependencies
```

## 🚀 Quick Start

### 1. Database Setup

First, ensure you have MySQL installed and running. Create the database:

```sql
CREATE DATABASE task_manager;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit config.env with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=task_manager
# DB_PORT=3306

# Start the backend server
npm run dev
```

The backend will automatically create the `tasks` table on startup.

### 3. Frontend Setup

```bash
# In a new terminal, navigate to project root
cd newpro

# Install frontend dependencies
npm install

# Start the React development server
npm start
```

## 🔧 Configuration

### Backend Environment Variables (`backend/config.env`)

```env
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

### Frontend Environment Variables (optional)

Create `.env` in the project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

The application automatically creates this table:

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

## 🌐 API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/status/:status` - Get tasks by status

### Health Check

- `GET /health` - Server health status

## 🎯 Features

### Frontend Features

- ✅ Modern React with Material UI
- ✅ Real-time task management
- ✅ Beautiful dashboard with charts
- ✅ Task creation/editing form
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Dark mode support (existing)

### Backend Features

- ✅ Express.js REST API
- ✅ MySQL database integration
- ✅ CORS enabled for frontend
- ✅ Security with Helmet
- ✅ Input validation
- ✅ Error handling
- ✅ Connection pooling

## 🧪 Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:5000/health
```

### 2. Create a Test Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "status": "pending",
    "priority": "medium",
    "due_date": "2024-12-31"
  }'
```

### 3. Get All Tasks

```bash
curl http://localhost:5000/api/tasks
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check MySQL is running
   - Verify credentials in `config.env`
   - Ensure database `task_manager` exists

2. **CORS Errors**

   - Verify `CORS_ORIGIN` in backend config
   - Check frontend is running on correct port

3. **Port Already in Use**

   - Change `PORT` in backend config
   - Update frontend API URL accordingly

4. **Frontend Can't Connect to Backend**
   - Ensure backend is running on port 5000
   - Check network connectivity
   - Verify API URL in frontend

## 🔄 Migration from PHP

The PHP files can now be safely removed:

- `api/add_task.php`
- `api/get_tasks.php`
- `api/update_task.php`
- `add_task.php`
- `index.php`

## 📝 Development

### Backend Development

```bash
cd backend
npm run dev  # Auto-restart on changes
```

### Frontend Development

```bash
npm start    # Auto-reload on changes
```

### Production Build

```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

## 🎉 Success!

Your full-stack Task Manager is now running with:

- React frontend on `http://localhost:3000`
- Express backend on `http://localhost:5000`
- MySQL database with automatic table creation

The application provides a complete task management experience with real-time data persistence and a modern, responsive UI.
