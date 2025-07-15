const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = express.Router();

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
    // Insert user
    const newUser = await User.create({ name, email, password: hashedPassword });
    res.json({ success: true, message: 'User registered successfully.', userId: newUser.id });
  } catch (error) {
    console.error('Signup error:', error);
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

module.exports = router; 