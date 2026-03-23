const { sendEmail } = require('./emailService');
const { Task, User, UserPreference } = require('../models');
const cron = require('node-cron');
const { generateEmailToken } = require('./emailAuth');

// Get frontend URL from environment variables or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Send reminder email function
const sendReminderEmail = async (user, task) => {
  try {
    const reminderUrl = `${FRONTEND_URL}/tasks?task=${task.id}`;
    
    const result = await sendEmail({
      to: user.email,
      subject: `Task Reminder: ${task.title}`,
      text: `Hi ${user.name},\n\nThis is a reminder that your task "${task.title}" is due soon.\n\nDue Date: ${task.due_date}\nPriority: ${task.priority}\n\nClick here to view your task: ${reminderUrl}\n\nBest regards,\nTask Manager Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Task Reminder</h2>
          <p>Hi ${user.name},</p>
          <p>This is a reminder that your task is due soon:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">${task.title}</h3>
            <p><strong>Description:</strong> ${task.description || 'No description'}</p>
            <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleString()}</p>
            <p><strong>Priority:</strong> <span style="color: ${task.priority === 'high' ? '#d32f2f' : task.priority === 'medium' ? '#f57c00' : '#388e3c'};">${task.priority.toUpperCase()}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reminderUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Task</a>
          </div>
          
          <p>Best regards,<br>Task Manager Team</p>
        </div>
      `
    });
    
    return result;
  } catch (error) {
    console.error('❌ Reminder email error:', error);
    return { success: false, error: error.message };
  }
};

// Check task reminders function
const checkTaskReminders = async () => {
  try {
    console.log('Checking for task reminders...');
    
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Find tasks that are due in the next 30 minutes and have reminders enabled
    const tasksNeedingReminders = await Task.findAll({
      where: {
        due_date: {
          [require('sequelize').Op.between]: [now, thirtyMinutesFromNow]
        },
        reminder_enabled: true,
        status: 'pending'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (tasksNeedingReminders.length === 0) {
      console.log('Found 0 tasks needing reminders');
      return;
    }
    
    console.log(`Found ${tasksNeedingReminders.length} tasks needing reminders`);
    
    // Send reminder emails
    for (const task of tasksNeedingReminders) {
      const user = task.User;
      await sendReminderEmail(user, task);
    }
    
  } catch (error) {
    console.error('Error checking task reminders:', error);
  }
};

// Start reminder service - run every 5 minutes
const startReminderService = () => {
  console.log('🔄 Starting reminder service...');
  
  // Check immediately on start
  checkTaskReminders();
  
  // Then check every 5 minutes
  cron.schedule('*/5 * * * *', checkTaskReminders);
  
  console.log('✅ Reminder service started');
};

module.exports = {
  sendReminderEmail,
  checkTaskReminders,
  startReminderService
};
