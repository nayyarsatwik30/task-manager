const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const nodemailer = require('nodemailer');

// Load environment variables from multiple possible locations
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

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email service test route
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendEmail } = require('./utils/emailService');

    console.log('🔧 EMAIL TEST - Starting test...');

    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Task Manager Email Test',
      text: 'This is a test email from Task Manager backend.',
      html: `
        <h2>Task Manager Email Test</h2>
        <p>This is a test email from your Task Manager backend.</p>
        <p>If you receive this, your Gmail SMTP configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });

    if (result.success) {
      console.log('✅ EMAIL TEST SUCCESS - Email sent');
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        sentTo: process.env.EMAIL_USER
      });
    } else {
      console.log('❌ EMAIL TEST FAILED:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('❌ EMAIL TEST ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// API health route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API endpoints available',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      emailAuth: '/api/email-auth',
      preferences: '/api/preferences'
    },
    timestamp: new Date().toISOString()
  });
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
  console.error('Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize server
const startServer = async () => {
  console.log('🔍 Starting server initialization...');
  try {
    console.log('🔄 Initializing database models...');
    // Initialize database tables with Sequelize
    await syncModels();

    console.log('🔄 Validating email configuration...');
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email configuration missing - email services will not work');
      console.warn('   Set EMAIL_USER and EMAIL_PASS in backend/config.env');
      console.warn('   Visit http://localhost:5000/test-email to test email configuration');
    } else {
      console.log('✅ Email configuration found');
    }

    console.log('🔄 Starting HTTP server...');
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   API Base URL: http://localhost:${PORT}/api`);
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`   Email Test: http://localhost:${PORT}/test-email`);

      console.log('🔄 Starting reminder service...');
      // Start the reminder service
      try {
        startReminderService();
        console.log('✅ Reminder service started');
      } catch (reminderError) {
        console.error('❌ Failed to start reminder service:', reminderError);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error(error);
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection error. Please check your database configuration in config.env');
      console.error('Make sure MySQL is running and the credentials are correct');
    }
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer(); 