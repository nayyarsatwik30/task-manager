const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for email authentication
 * @param {Object} user - User object containing at least id and email
 * @returns {string} JWT token
 */
const generateEmailToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      purpose: 'email_auth'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
};

/**
 * Verifies an email JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyEmailToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

module.exports = { generateEmailToken, verifyEmailToken };
