const nodemailer = require('nodemailer');
const { Task, User, UserPreference } = require('../models');
const cron = require('node-cron');
const { generateEmailToken } = require('./emailAuth');

// Get frontend URL from environment variables or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate authenticated URL with token
const generateAuthenticatedUrl = (user, path) => {
  const token = generateEmailToken(user);
  return `${FRONTEND_URL}${path}?token=${token}`;
};

// Send reminder email
async function sendReminderEmail(userEmail, taskData, timeLeft) {
  // Get user to generate token
  const user = await User.findOne({ where: { email: userEmail } });
  if (!user) {
    console.error(`User not found with email: ${userEmail}`);
    return;
  }

  // Generate authenticated URLs
  const taskUrl = generateAuthenticatedUrl(user, '/tasks');
  const dashboardUrl = generateAuthenticatedUrl(user, '/dashboard');

  // Format due date and time
  const dueDate = new Date(taskData.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const dueTime = taskData.due_time ? 
    new Date(`2000-01-01T${taskData.due_time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : '';

  const mailOptions = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `⏰ Reminder: "${taskData.title}" is due ${timeLeft.toLowerCase()}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Reminder: ${taskData.title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4a6cf7 0%, #2541b2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .header p { color: rgba(255,255,255,0.8); margin: 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .task-card { background: #f8f9ff; border-left: 4px solid #4a6cf7; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .task-title { font-size: 18px; font-weight: 600; color: #2d3436; margin: 0 0 10px; }
        .task-meta { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; }
        .meta-item { display: flex; align-items: center; font-size: 14px; color: #636e72; }
        .meta-item svg { margin-right: 8px; color: #4a6cf7; }
        .priority { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .priority.high { background: #ffebee; color: #e53935; }
        .priority.medium { background: #fff8e1; color: #ff8f00; }
        .priority.low { background: #e8f5e9; color: #43a047; }
        .btn { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; text-align: center; }
        .btn-primary { background: #4a6cf7; color: white; }
        .btn-secondary { background: #f1f3f9; color: #4a6cf7; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px; }
        .disclaimer { font-size: 11px; color: #95a5a6; margin-top: 20px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Task Reminder</h1>
          <p>Your task is due ${timeLeft.toLowerCase()}</p>
        </div>
        <div class="content">
          <div class="task-card">
            <h2 class="task-title">${taskData.title}</h2>
            
            <div class="task-meta">
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${dueDate} ${dueTime ? `at ${dueTime}` : ''}
              </div>
              
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${timeLeft} left
              </div>
              
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                ${taskData.priority} priority
              </div>
            </div>
            
            ${taskData.description ? `
            <div style="margin-top: 15px; color: #636e72; font-size: 14px; line-height: 1.5;">
              <strong>Description:</strong>
              <p style="margin: 5px 0 0 0;">${taskData.description}</p>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${taskUrl}" class="btn btn-primary">View Task</a>
            <a href="${dashboardUrl}" class="btn btn-secondary">Go to Dashboard</a>
          </div>
          
          <div class="disclaimer">
            <p>This is an automated reminder. The links in this email will log you in automatically and expire in 1 hour for security.</p>
            <p>If you did not request this reminder, please ignore this email or contact support if you have any concerns.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Task Manager. All rights reserved.</p>
          <p>This email was sent to ${userEmail} because you have an active task reminder.</p>
        </div>
      </div>
    </body>
    </html>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #d63031; margin: 0 0 15px 0; font-size: 20px;">📋 Task Details</h2>
            <div style="margin-bottom: 15px;">
              <strong style="color: #2d3436;">Task:</strong> ${taskData.title}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #2d3436;">Priority:</strong> 
              <span style="
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 12px; 
                font-weight: bold;
                ${taskData.priority === 'high' ? 'background-color: #e74c3c; color: white;' : 
                  taskData.priority === 'medium' ? 'background-color: #f39c12; color: white;' : 
                  'background-color: #27ae60; color: white;'}
              ">
                ${taskData.priority.toUpperCase()}
              </span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #2d3436;">Due Date:</strong> ${new Date(taskData.dueDate).toLocaleDateString()}
              ${taskData.due_time ? ` at <strong>${taskData.due_time}</strong>` : ''}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #e74c3c;">Time Left:</strong> ${timeLeft}
            </div>
            ${taskData.description ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #2d3436;">Description:</strong><br>
              <span style="color: #636e72;">${taskData.description}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${taskUrl}" 
               style="display: inline-block; background-color: #3498db; color: white; 
                      padding: 12px 25px; text-decoration: none; border-radius: 5px; 
                      font-weight: bold; margin: 10px 5px;">
              View Task
            </a>
            <a href="${dashboardUrl}" 
               style="display: inline-block; background-color: #2ecc71; color: white; 
                      padding: 12px 25px; text-decoration: none; border-radius: 5px; 
                      font-weight: bold; margin: 10px 5px;">
              Go to Dashboard
            </a>
          </div>
          <div style="margin-top: 15px; font-size: 12px; color: #7f8c8d; text-align: center;">
            <p>Links in this email will log you in automatically and expire in 1 hour for security.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/mytasks" 
               style="
                 background-color: #95a5a6; 
                 color: white; 
                 padding: 12px 30px; 
                 text-decoration: none; 
                 border-radius: 6px; 
                 display: inline-block; 
                 font-weight: bold;
                 margin: 0 10px;
               ">
              📋 View All Tasks
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 14px;">
            <p>This is an automated reminder from your Task Manager app.</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail} for task: ${taskData.title}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
}

// Check for tasks that need reminders
async function checkTaskReminders() {
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    console.log(`🔍 Checking for reminders at ${now.toLocaleString()}`);
    
    // First, find all tasks that are pending, have reminders enabled, and haven't had a reminder sent yet
    const tasks = await Task.findAll({
      where: {
        status: 'pending',
        reminder_enabled: true,
        reminder_sent: false
      },
      include: [{
        model: User,
        attributes: ['email', 'name', 'id']
      }],
      raw: true,
      nest: true
    });
    
    // Filter tasks that are due within the next 30 minutes, considering both date and time
    const tasksNeedingReminders = tasks.filter(task => {
      // Create a Date object for when the task is due
      const dueDate = new Date(task.due_date);
      
      // If task has a specific time, set it
      if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':');
        dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        // If no specific time, set to end of day
        dueDate.setHours(23, 59, 59, 999);
      }
      
      // Check if the task is due within the next 30 minutes
      return dueDate > now && dueDate <= thirtyMinutesFromNow;
    });
    
    console.log(`📋 Found ${tasksNeedingReminders.length} tasks needing reminders`);
    
    console.log(`📋 Found ${tasksNeedingReminders.length} tasks needing reminders`);
    
    // Process each task that needs a reminder
    for (const task of tasksNeedingReminders) {
      console.log(`\n📝 Processing task: "${task.title}" for user: ${task.User.email}`);
      
      // Create precise due datetime by combining due_date and due_time
      let taskDueDateTime = new Date(task.due_date);
      
      if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':');
        taskDueDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        console.log(`⏰ Task has specific time: ${task.due_time}`);
      }
      
      console.log(`📅 Task due: ${taskDueDateTime.toLocaleString()}`);
      
      const timeUntilDue = taskDueDateTime - now;
      const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));
      
      console.log(`⏳ Minutes until due: ${minutesUntilDue}`);
      
      // Only proceed if task is due within 30 minutes
      if (minutesUntilDue <= 30 && minutesUntilDue > 0) {
        console.log(`✅ SENDING REMINDER for task: "${task.title}" to ${task.User.email}`);
        
        try {
          // First, mark the task as having a reminder sent
          await Task.update(
            {
              reminder_sent: true,
              reminder_sent_at: new Date()
            },
            {
              where: { id: task.id }
            }
          );
          
          console.log(`✅ Task ${task.id} marked for reminder`);

          // Then send the reminder email
          await sendReminderEmail(
            task.User.email, 
            {
              id: task.id,
              title: task.title,
              priority: task.priority,
              dueDate: task.due_date,
              due_time: task.due_time,
              description: task.description
            },
            `${minutesUntilDue} minute${minutesUntilDue === 1 ? '' : 's'}`
          );
          
          console.log(`✅ Reminder sent for task "${task.title}"`);
          
        } catch (error) {
          console.error(`❌ Failed to process reminder for task ${task.id}:`, error);
          // Don't reset the flag - we'll let the admin handle failed emails
        }
      } else {
        console.log(`❌ NOT sending reminder for task: "${task.title}"`);
        if (minutesUntilDue <= 0) {
          console.log(`   Reason: Task is overdue (${minutesUntilDue} minutes)`);
        } else {
          console.log(`   Reason: Not within 30-minute window (${minutesUntilDue} minutes until due)`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking task reminders:', error);
  }
}

// Start the reminder service
function startReminderService() {
  // Check for reminders every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Checking for task reminders...');
    await checkTaskReminders();
  });
  
  console.log('Task reminder service started');
}

module.exports = {
  startReminderService,
  sendReminderEmail,
  checkTaskReminders
}; 