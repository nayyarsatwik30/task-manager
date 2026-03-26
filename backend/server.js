const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const nodemailer = require('nodemailer');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const tasksRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const emailAuthRoutes = require('./routes/emailAuth');
const preferencesRoutes = require('./routes/preferences');
const { syncModels } = require('./models');
const { startReminderService } = require('./utils/reminderService');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// ✅ FIXED CORS CONFIG (PRODUCTION + LOCAL + GOOGLE AUTH SAFE)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://task-manager-back-emez.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      emailAuth: '/api/email-auth',
      preferences: '/api/preferences'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email test route
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendEmail } = require('./utils/emailService');

    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Task Manager Email Test',
      text: 'Test email from backend',
      html: `<h2>Email working ✅</h2><p>${new Date().toISOString()}</p>`
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API routes
app.use('/api/tasks', tasksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email-auth', emailAuthRoutes);
app.use('/api/preferences', preferencesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    await syncModels();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 API: https://task-manager-back-emez.onrender.com/api`);
      console.log(`❤️ Health: https://task-manager-back-emez.onrender.com/health`);

      try {
        startReminderService();
        console.log('⏰ Reminder service started');
      } catch (err) {
        console.error('Reminder service failed:', err);
      }
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

startServer();