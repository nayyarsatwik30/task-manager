const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
  await transporter.sendMail({
    from: 'MyApp <no-reply@myapp.com>',
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Thank you for signing up! Please <a href="${verificationUrl}">click here to verify your email</a>.</p>`
  });
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
    const newUser = await User.create({ name, email, password: hashedPassword, verified: false, verificationToken });
    // Send verification email
    await sendVerificationEmail(newUser, verificationToken);
    res.json({ success: true, message: 'User registered successfully. Please check your email to verify your account.', userId: newUser.id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) {
    return res.status(400).send('Invalid verification link.');
  }
  try {
    const user = await User.findOne({ where: { email, verificationToken: token } });
    if (!user) {
      return res.status(400).send('Invalid or expired verification link.');
    }
    user.verified = true;
    user.verificationToken = null;
    await user.save();
    res.send('Email verified! You can now log in.');
  } catch (error) {
    res.status(500).send('Server error.');
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

module.exports = router; 