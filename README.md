# Task Manager - Full Stack Application

A modern task management application built with React frontend and Node.js backend, featuring a beautiful Material UI interface and MySQL database integration.

## 🚀 Features

### Frontend (React + Material UI)

- ✨ Modern, responsive UI with Material Design
- 📊 Interactive dashboard with charts and analytics
- 📝 Real-time task management with DataGrid
- 🎨 Dark mode support
- 📱 Mobile-responsive design
- ⚡ Fast and smooth user experience

### Backend (Node.js + Express)

- 🔧 RESTful API with Express.js
- 🗄️ MySQL database integration
- 🔒 Security with Helmet middleware
- 🌐 CORS enabled for frontend communication
- 📝 Comprehensive error handling
- ⚡ Connection pooling for performance

### Core Functionality

- ✅ Create, read, update, and delete tasks
- 📊 Real-time analytics and statistics
- 🏷️ Task categorization by priority and status
- 📅 Due date management
- 🔍 Task filtering and search
- 📱 Responsive design for all devices

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    SQL    ┌─────────────────┐
│   React Frontend│ ◄──────────────► │  Express Backend│ ◄────────► │   MySQL Database│
│   (Port 3000)   │                 │   (Port 5000)   │           │                 │
└─────────────────┘                 └─────────────────┘           └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with hooks
- **Material UI 7** - Beautiful UI components
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization
- **Day.js** - Date manipulation
- **React Router** - Client-side routing

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Database

- **MySQL** - Relational database
- **Connection Pooling** - Performance optimization

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MySQL (v8.0 or higher)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd newpro
   ```

2. **Run the installation script**

   **For Linux/Mac:**

   ```bash
   chmod +x install.sh
   ./install.sh
   ```

   **For Windows:**

   ```cmd
   install.bat
   ```

3. **Configure the database**

   ```sql
   CREATE DATABASE task_manager;
   ```

4. **Update backend configuration**
   Edit `backend/config.env` with your MySQL credentials:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=task_manager
   DB_PORT=3306
   ```

5. **Start the application**

   **Terminal 1 - Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**

   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: https://task-manager-back-emez.onrender.com
   - Health Check: https://task-manager-back-emez.onrender.com/health

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

## 🔌 API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/status/:status` - Get tasks by status

### Health Check

- `GET /health` - Server health status

## 🎯 Usage

### Creating Tasks

1. Click the "Add Task" button or floating action button
2. Fill in the task details (title, description, priority, status, due date)
3. Click "Create" to save the task

### Managing Tasks

- **Edit**: Click the edit icon in the task row
- **Delete**: Click the delete icon in the task row
- **Filter**: Use the status and priority filters
- **Search**: Use the search functionality

### Dashboard Analytics

- View total tasks, completion rate, and pending tasks
- Monitor task completion trends
- Analyze tasks by priority and category

## 🔧 Development

### Project Structure

```
newpro/
├── backend/                 # Node.js backend
│   ├── server.js           # Main server file
│   ├── db.js              # Database connection
│   ├── routes/
│   │   └── tasks.js       # API routes
│   ├── package.json       # Backend dependencies
│   └── config.env         # Environment variables
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── pages/             # Page components
│   └── ...
└── package.json           # Frontend dependencies
```

### Development Commands

**Backend:**

```bash
cd backend
npm run dev    # Development with auto-restart
npm start      # Production
```

**Frontend:**

```bash
npm start      # Development server
npm run build  # Production build
npm test       # Run tests
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Verify MySQL is running
   - Check credentials in `backend/config.env`
   - Ensure database exists

2. **CORS Errors**

   - Check `CORS_ORIGIN` in backend config
   - Verify frontend port matches

3. **Port Conflicts**

   - Change ports in configuration files
   - Kill processes using the ports

4. **Module Not Found**
   - Run `npm install` in both directories
   - Clear node_modules and reinstall

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Input Validation** - Data sanitization
- **SQL Injection Prevention** - Parameterized queries
- **Error Message Sanitization** - Safe error responses

## 📈 Performance

- **Connection Pooling** - Database performance
- **React Optimization** - Efficient rendering
- **Lazy Loading** - Component optimization
- **Caching** - API response caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the troubleshooting section
- Review the setup documentation
- Open an issue on GitHub

---

**Built with ❤️ using React, Node.js, and Material UI**
