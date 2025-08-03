const express = require('express');
const router = express.Router();
const { UserPreference, User } = require('../models');

// Get user preferences
router.get('/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let preferences = await UserPreference.findOne({ where: { user_id: user.id } });
    
    // Create default preferences if none exist
    if (!preferences) {
      preferences = await UserPreference.create({
        user_id: user.id,
        emailNotifications: true,
        reminderNotifications: true,
        reminderTime: 30
      });
    }

    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update user preferences
router.put('/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { emailNotifications, reminderNotifications, reminderTime } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let preferences = await UserPreference.findOne({ where: { user_id: user.id } });
    
    if (!preferences) {
      preferences = await UserPreference.create({
        user_id: user.id,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        reminderNotifications: reminderNotifications !== undefined ? reminderNotifications : true,
        reminderTime: reminderTime || 30
      });
    } else {
      await preferences.update({
        emailNotifications: emailNotifications !== undefined ? emailNotifications : preferences.emailNotifications,
        reminderNotifications: reminderNotifications !== undefined ? reminderNotifications : preferences.reminderNotifications,
        reminderTime: reminderTime || preferences.reminderTime
      });
    }

    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router; 