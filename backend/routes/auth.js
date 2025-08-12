const express = require('express');
const bcrypt = require('bcrypt');
const { User, Task } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = '862607090612-h287u3ho2jcpf7nul1g3lf8beoria71g.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const router = express.Router();

// Helper: send verification email
async function sendVerificationEmail(user, verificationToken) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // set in config.env
      pass: process.env.EMAIL_PASS, // set in config.env (use app password)
    },
  });
  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Task Manager</title>
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
          background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
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
        .welcome-text {
          font-size: 18px;
          color: #333333;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #666666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
          transition: all 0.3s ease;
        }
        .verify-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
        }
        .features {
          background-color: #f8f9fa;
          padding: 30px;
          margin: 30px 0;
          border-radius: 8px;
        }
        .features h3 {
          color: #1976d2;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 8px 0;
          color: #666666;
          position: relative;
          padding-left: 25px;
        }
        .feature-list li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4caf50;
          font-weight: bold;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 0;
          color: #999999;
          font-size: 14px;
        }
        .footer a {
          color: #1976d2;
          text-decoration: none;
        }
        .security-note {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
          color: #856404;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            box-shadow: none;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .verify-button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Task Manager</h1>
          <p>Welcome to your productivity journey!</p>
        </div>
        
        <div class="content">
          <div class="welcome-text">
            Hi ${user.name}! 👋
          </div>
          
          <div class="message">
            Thank you for joining <strong>Task Manager</strong>! We're excited to help you organize your tasks and boost your productivity.
          </div>
          
          <div class="message">
            To get started and secure your account, please verify your email address by clicking the button below:
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="verify-button">
              ✉️ Verify My Email Address
            </a>
          </div>
          
          <div class="features">
            <h3>🚀 What you can do with Task Manager:</h3>
            <ul class="feature-list">
              <li>Create and organize tasks with priorities</li>
              <li>Track your progress with beautiful analytics</li>
              <li>Plan your schedule with the interactive calendar</li>
              <li>Switch between light and dark themes</li>
              <li>Access your tasks from any device</li>
            </ul>
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
          </div>
          
          <div class="message">
            If the button above doesn't work, you can copy and paste this link into your browser:
            <br><br>
            <a href="${verificationUrl}" style="color: #1976d2; word-break: break-all;">${verificationUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <p>
            <strong>Task Manager Team</strong><br>
            Making productivity simple and beautiful
          </p>
          <p style="margin-top: 15px;">
            Need help? <a href="mailto:support@taskmanager.com">Contact our support team</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: 'Task Manager <no-reply@taskmanager.com>',
    to: user.email,
    subject: '🎯 Welcome to Task Manager - Verify Your Email',
    html: emailTemplate
  });
}

// Helper: send password reset email
async function sendPasswordResetEmail(user, resetToken) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Link to frontend reset page; frontend will call backend /reset-password
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Task Manager</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 28px; }
        .message { font-size: 16px; color: #444; margin-bottom: 18px; }
        .reset-button { display: inline-block; background: linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(66,165,245,0.3); transition: all 0.3s ease; }
        .reset-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(66,165,245,0.4); }
        .footer { background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px; }
        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .reset-button { display: block; text-align: center; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset your Task Manager password</h1>
        </div>
        <div class="content">
          <div class="message">Hi ${user.name || 'there'},</div>
          <div class="message">We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</div>
          <div style="text-align:center; margin: 28px 0;">
            <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          </div>
          <div class="message">If you didn't request a password reset, you can safely ignore this email — your password will remain the same.</div>
          <div class="message">If the button doesn't work, copy and paste this link in your browser:<br><a href="${resetUrl}" style="color:#1976d2; word-break: break-all;">${resetUrl}</a></div>
        </div>
        <div class="footer">  ${new Date().getFullYear()} Task Manager</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: 'Task Manager <no-reply@taskmanager.com>',
    to: user.email,
    subject: 'Reset your Task Manager password',
    html: emailTemplate,
  });
}

// Helper: create starter tasks for new users
async function createStarterTasksForUser(user) {
  const starterTasks = [
    {
      title: '🎉 Welcome to Task Manager!',
      description: 'Explore the app features: Dashboard, My Tasks, and Calendar. Mark this as complete when you\'re familiar with the interface.',
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Due tomorrow
      user_id: user.id
    },
    {
      title: 'Create your first personal task',
      description: 'Add a task that\'s important to you - it could be work-related, personal, or a hobby project.',
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      user_id: user.id
    },
    {
      title: 'Set up your weekly planning routine',
      description: 'Schedule 15 minutes each week to review completed tasks and plan upcoming ones.',
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
      user_id: user.id
    },
    {
      title: 'Try the Calendar view',
      description: 'Check out the Calendar page to see your tasks in a visual timeline. You can add tasks directly from the calendar!',
      status: 'pending',
      priority: 'low',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
      user_id: user.id
    },
    {
      title: 'Customize your task priorities',
      description: 'Experiment with High, Medium, and Low priority levels to organize your tasks effectively.',
      status: 'pending',
      priority: 'low',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
      user_id: user.id
    }
  ];

  try {
    await Task.bulkCreate(starterTasks);
    console.log(`Created ${starterTasks.length} starter tasks for user: ${user.email}`);
  } catch (error) {
    console.error('Error creating starter tasks:', error);
  }
}

// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Insert user (unverified)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });
    // Add starter tasks
    await createStarterTasksForUser(user);
    // Send verification email
    await sendVerificationEmail(user, verificationToken);
    res.json({ success: true, message: 'User registered successfully. Please check your email to verify your account.', userId: user.id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) {
    return res.redirect(`http://localhost:3000/verify-email?error=invalid_link`);
  }
  try {
    const user = await User.findOne({ where: { email, verificationToken: token } });
    if (!user) {
      return res.redirect(`http://localhost:3000/verify-email?error=invalid_token&email=${encodeURIComponent(email)}`);
    }
    user.verified = true;
    user.verificationToken = null;
    await user.save();

    // Direct redirect to frontend with success status
    res.redirect(`http://localhost:3000/verify-email?verified=true&email=${encodeURIComponent(email)}`);
  } catch (error) {
    res.redirect(`http://localhost:3000/verify-email?error=server_error&email=${encodeURIComponent(email)}`);
  }
});

// Resend verification email route
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({ success: true, message: 'Verification email sent successfully.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    // Check if verified
    if (!user.verified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }
    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    // For now, just return success (no JWT/session yet)
    res.json({ success: true, message: 'Login successful.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Google login route
router.post('/google', async (req, res) => {
  // Accept both 'token' and 'credential' from frontend
  const token = req.body.token || req.body.credential;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    let user = await User.findOne({ where: { email } });
    let isNew = false;
    if (!user) {
      user = await User.create({ name, email, password: '', verified: true });
      isNew = true;
    }
    if (isNew) {
      await createStarterTasksForUser(user);
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// Get current user data by email (for demo; in production, use auth token)
router.get('/me', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      created_at: user.created_at,
      // Add more fields as needed
    }
  });
});

// TEMPORARY: Cleanup duplicate tasks endpoint
router.post('/cleanup-tasks', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current task count
    const currentCount = await Task.count({ where: { userId: user.id } });
    console.log(`Current tasks for ${email}: ${currentCount}`);

    // Delete all existing tasks
    await Task.destroy({ where: { userId: user.id } });
    console.log('Deleted all existing tasks');

    // Create 15 fresh tasks
    const freshTasks = [
      { title: 'Complete project proposal', description: 'Draft and finalize the Q1 project proposal', status: 'pending', priority: 'high', category: 'Work' },
      { title: 'Review team performance', description: 'Monthly team review and feedback session', status: 'in-progress', priority: 'medium', category: 'Work' },
      { title: 'Update website content', description: 'Refresh homepage and about page content', status: 'completed', priority: 'medium', category: 'Work' },
      { title: 'Plan vacation trip', description: 'Research destinations and book flights', status: 'pending', priority: 'low', category: 'Personal' },
      { title: 'Grocery shopping', description: 'Weekly grocery shopping for essentials', status: 'pending', priority: 'medium', category: 'Personal' },
      { title: 'Learn React hooks', description: 'Complete advanced React hooks tutorial', status: 'in-progress', priority: 'high', category: 'Education' },
      { title: 'Organize home office', description: 'Declutter and reorganize workspace', status: 'pending', priority: 'low', category: 'Personal' },
      { title: 'Client meeting prep', description: 'Prepare presentation for client meeting', status: 'pending', priority: 'high', category: 'Work' },
      { title: 'Exercise routine', description: 'Start morning workout routine', status: 'in-progress', priority: 'medium', category: 'Personal' },
      { title: 'Read technical book', description: 'Finish reading Clean Code by Robert Martin', status: 'in-progress', priority: 'medium', category: 'Education' },
      { title: 'Fix kitchen sink', description: 'Repair leaky kitchen faucet', status: 'pending', priority: 'high', category: 'Home' },
      { title: 'Write blog post', description: 'Write article about React best practices', status: 'pending', priority: 'medium', category: 'Work' },
      { title: 'Call dentist', description: 'Schedule dental cleaning appointment', status: 'completed', priority: 'medium', category: 'Personal' },
      { title: 'Learn TypeScript', description: 'Complete TypeScript fundamentals course', status: 'pending', priority: 'medium', category: 'Education' },
      { title: 'Plan weekend activities', description: 'Research fun weekend activities with family', status: 'pending', priority: 'low', category: 'Personal' }
    ];

    const createdTasks = [];
    for (const taskData of freshTasks) {
      const task = await Task.create({
        ...taskData,
        userId: user.id,
        due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
      createdTasks.push(task);
    }

    const finalCount = await Task.count({ where: { userId: user.id } });

    res.json({
      message: 'Tasks cleaned up successfully',
      deletedCount: currentCount,
      createdCount: createdTasks.length,
      finalCount: finalCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify token endpoint
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Token is valid
    res.json({ 
      valid: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 