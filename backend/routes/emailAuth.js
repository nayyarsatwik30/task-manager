const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyEmailToken } = require('../utils/emailAuth');

/**
 * @route   GET /api/email-auth/verify-token
 * @desc    Verify email token and return a session token
 * @access  Public
 */
router.get('/verify-token', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }

    // Verify the token
    const decoded = verifyEmailToken(token);
    
    if (!decoded || decoded.purpose !== 'email_auth') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Find the user
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate a new session token (longer lived)
    const sessionToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        purpose: 'session'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Session token expires in 7 days
    );

    // Return the session token and user data
    res.json({ 
      success: true, 
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // Add other user fields as needed
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
