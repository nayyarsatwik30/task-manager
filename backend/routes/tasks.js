const express = require('express');
const router = express.Router();
const { Task, User } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const { generateEmailToken } = require('../utils/emailAuth');

// Get frontend URL from environment variables or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Email transporter configuration with error handling
let transporter = null;

const initializeEmailTransporter = () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email credentials not found - task emails will not work');
      console.warn('   Set EMAIL_USER and EMAIL_PASS in backend/config.env');
      return null;
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('✅ Task email transporter initialized');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize task email transporter:', error);
    return null;
  }
};

// Initialize email transporter
initializeEmailTransporter();

// Generate authenticated URL with token
const generateAuthenticatedUrl = (user, path) => {
  const token = generateEmailToken(user);
  return `${FRONTEND_URL}${path}?token=${token}`;
};

// Email notification function for task creation
async function sendTaskCreationEmail(userEmail, taskData) {
  try {
    // Get user to generate token
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      console.error(`User not found with email: ${userEmail}`);
      return;
    }

    // Check if email transporter is available
    if (!transporter) {
      console.error('❌ Email transporter not initialized - cannot send task creation email');
      return;
    }

    // Generate authenticated dashboard URL
    const dashboardUrl = generateAuthenticatedUrl(user, '/dashboard');

    const emailTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Task Created - Task Manager</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .task-details {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
          }
          .task-title {
            font-size: 20px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 10px;
          }
          .task-description {
            color: #666666;
            margin-bottom: 15px;
          }
          .task-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .priority-high {
            background-color: #ffebee;
            color: #c62828;
          }
          .priority-medium {
            background-color: #fff3e0;
            color: #ef6c00;
          }
          .priority-low {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-pending {
            background-color: #fff3e0;
            color: #ef6c00;
          }
          .status-in-progress {
            background-color: #e3f2fd;
            color: #1565c0;
          }
          .status-completed {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 14px;
          }
          .dashboard-link {
            display: inline-block;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
            transition: all 0.3s ease;
          }
          .dashboard-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> New Task Created!</h1>
            <p>Your task has been successfully added to your task manager</p>
          </div>
          <div class="content">
            <h2 style="color: #333333; margin-bottom: 20px;">Task Details</h2>
            <div class="task-details">
              <div class="task-title">${taskData.title}</div>
              ${taskData.description ? `<div class="task-description">${taskData.description}</div>` : ''}
              <div class="task-meta">
                <div class="meta-item">
                  <strong>Priority:</strong>
                  <span class="priority-badge priority-${taskData.priority}">${taskData.priority}</span>
                </div>
                <div class="meta-item">
                  <strong>Status:</strong>
                  <span class="status-badge status-${taskData.status}">${taskData.status}</span>
                </div>
                ${taskData.due_date ? `<div class="meta-item">
                  <strong>Due Date:</strong>
                  <span>${new Date(taskData.due_date).toLocaleDateString()}</span>
                </div>` : ''}
              </div>
            </div>
            <p style="color: #666666; margin: 20px 0;">
              You can view and manage this task from your dashboard. Keep track of your progress and stay organized!
            </p>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="dashboard-link">View Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from your Task Manager application.</p>
            <p>If you didn't create this task, please contact support immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `New Task Created: ${taskData.title}`,
      html: emailTemplate,
    });

    console.log(`Task creation email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending task creation email:', error);
    // Don't throw error to avoid breaking the task creation flow
  }
}

// Email notification function for task completion
async function sendTaskCompletionEmail(userEmail, taskData) {
  try {
    // Get user to generate token
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      console.error(`User not found with email: ${userEmail}`);
      return;
    }

    // Check if email transporter is available
    if (!transporter) {
      console.error('❌ Email transporter not initialized - cannot send task completion email');
      return;
    }

    // Generate authenticated dashboard URL
    const dashboardUrl = generateAuthenticatedUrl(user, '/dashboard');

    const emailTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Completed - Task Manager</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .task-details {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
          }
          .task-title {
            font-size: 20px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 10px;
          }
          .task-description {
            color: #666666;
            margin-bottom: 15px;
          }
          .task-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .priority-high {
            background-color: #ffebee;
            color: #c62828;
          }
          .priority-medium {
            background-color: #fff3e0;
            color: #ef6c00;
          }
          .priority-low {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-completed {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 14px;
          }
          .dashboard-link {
            display: inline-block;
            background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
            transition: all 0.3s ease;
          }
          .dashboard-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
          .celebration {
            text-align: center;
            margin: 20px 0;
          }
          .celebration h2 {
            color: #4caf50;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Task Completed!</h1>
            <p>Congratulations! You've successfully completed a task</p>
          </div>
          <div class="content">
            <div class="celebration">
              <h2>Great job! 🎊</h2>
              <p style="color: #666666;">You've marked this task as completed. Keep up the excellent work!</p>
            </div>
            <h2 style="color: #333333; margin-bottom: 20px;">Completed Task Details</h2>
            <div class="task-details">
              <div class="task-title">${taskData.title}</div>
              ${taskData.description ? `<div class="task-description">${taskData.description}</div>` : ''}
              <div class="task-meta">
                <div class="meta-item">
                  <strong>Priority:</strong>
                  <span class="priority-badge priority-${taskData.priority}">${taskData.priority}</span>
                </div>
                <div class="meta-item">
                  <strong>Status:</strong>
                  <span class="status-badge status-${taskData.status}">${taskData.status}</span>
                </div>
                ${taskData.due_date ? `<div class="meta-item">
                  <strong>Due Date:</strong>
                  <span>${new Date(taskData.due_date).toLocaleDateString()}</span>
                </div>` : ''}
              </div>
            </div>
            <p style="color: #666666; margin: 20px 0;">
              You're making great progress! Continue managing your tasks and stay productive.
            </p>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="dashboard-link">View Dashboard</a>
            </div>
            <p style="font-size: 12px; color: #7f8c8d; text-align: center; margin-top: 15px;">
              The dashboard link will log you in automatically and expires in 1 hour for security.
            </p>
          </div>
          <div class="footer">
            <p>This email was sent from your Task Manager application.</p>
            <p>Keep up the great work and stay organized!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Task Completed: ${taskData.title}`,
      html: emailTemplate,
    });

    console.log(`Task completion email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending task completion email:', error);
    // Don't throw error to avoid breaking the task update flow
  }
}

// GET /api/tasks - Fetch all tasks for a specific user
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Get user ID from email
    const { User } = require('../models');
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const tasks = await Task.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// GET /api/tasks/:id - Fetch single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'pending',
      priority = 'medium',
      due_date,
      due_time,
      userEmail,
      reminder_enabled = true
    } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Get user ID from email
    const { User } = require('../models');
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description || null,
      status: status || 'pending',
      priority: priority || 'medium',
      due_date: due_date || null,
      due_time: due_time || null,
      user_id: user.id,
      reminder_enabled: reminder_enabled !== false, // Default to true if not provided
      reminder_sent: false,
      reminder_sent_at: null
    });

    // Send email notification if user email is provided and notifications are enabled
    if (userEmail && req.body.emailNotifications !== false && !req.body.skipEmail) {
      await sendTaskCreationEmail(userEmail, {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        due_date: newTask.due_date
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      due_date,
      due_time,
      userEmail,
      reminder_enabled
    } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Get user ID from email
    const { User } = require('../models');
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const task = await Task.findOne({
      where: {
        id: id,
        user_id: user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Store old status for comparison
    const oldStatus = task.status;

    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (due_date !== undefined) task.due_date = due_date || null;
    if (due_time !== undefined) task.due_time = due_time || null;

    // Reset reminder flags if due date/time changes
    if (due_date !== undefined || due_time !== undefined) {
      task.reminder_sent = false;
      task.reminder_sent_at = null;
    }

    // Update reminder settings if provided
    if (reminder_enabled !== undefined) {
      task.reminder_enabled = reminder_enabled;
    }

    await task.save();

    // Send email notification for status changes to completed
    if (userEmail && oldStatus !== 'completed' && task.status === 'completed' && req.body.emailNotifications !== false && !req.body.skipEmail) {
      await sendTaskCompletionEmail(userEmail, {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Get user ID from email
    const { User } = require('../models');
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const task = await Task.findOne({
      where: {
        id: id,
        user_id: user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// GET /api/tasks/status/:status - Get tasks by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in-progress, completed'
      });
    }
    const tasks = await Task.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks by status',
      error: error.message
    });
  }
});

module.exports = router; 