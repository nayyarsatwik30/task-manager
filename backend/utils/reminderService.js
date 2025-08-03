const nodemailer = require('nodemailer');
const { Task, User, UserPreference } = require('../models');
const cron = require('node-cron');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send reminder email
async function sendReminderEmail(userEmail, taskData, timeLeft) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `⏰ Task Reminder: "${taskData.title}" is due soon!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c; margin: 0;">⏰ Task Reminder</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Your task is due soon!</p>
          </div>
          
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
              <strong style="color: #2d3436;">Due Date:</strong> ${new Date(taskData.dueDate).toLocaleString()}
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
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/mytasks" 
               style="
                 background-color: #3498db; 
                 color: white; 
                 padding: 12px 30px; 
                 text-decoration: none; 
                 border-radius: 6px; 
                 display: inline-block; 
                 font-weight: bold;
                 margin: 0 10px;
               ">
              🎯 Complete Task
            </a>
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
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Find tasks that are due within the next hour and not completed
    const tasksNeedingReminders = await Task.findAll({
      where: {
        status: {
          [require('sequelize').Op.ne]: 'completed'
        },
        dueDate: {
          [require('sequelize').Op.between]: [now, oneHourFromNow]
        }
      },
      include: [{
        model: User,
        attributes: ['email', 'name']
      }]
    });

    for (const task of tasksNeedingReminders) {
      const timeUntilDue = task.dueDate - now;
      const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));
      
      // Get user preferences from database
      const userPreference = await UserPreference.findOne({
        where: { user_id: task.User.id }
      });
      
      // Use default values if no preferences found
      const userReminderTime = userPreference ? userPreference.reminderTime : 30;
      const userReminderEnabled = userPreference ? userPreference.reminderNotifications : true;
      
      // Send reminder if task is due within user's preferred time and reminders are enabled
      if (minutesUntilDue <= userReminderTime && minutesUntilDue > 0 && userReminderEnabled) {
        const timeLeft = minutesUntilDue <= 1 ? 
          `${minutesUntilDue} minute` : 
          `${minutesUntilDue} minutes`;
        
        await sendReminderEmail(
          task.User.email, 
          {
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
            description: task.description
          },
          timeLeft
        );
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