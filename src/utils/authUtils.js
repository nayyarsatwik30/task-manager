/**
 * Auth Utilities
 * Handles token verification and authentication state management
 */

/**
 * Check for email authentication token in URL
 * @returns {Promise<{token: string, user: object}|null>} User data if token is valid, null otherwise
 */
export const verifyEmailToken = async () => {
  // Get token from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) return null;

  try {
    // Call the backend to verify the token
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/email-auth/verify-token?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    
    if (data.success && data.token) {
      // Store the session token
      localStorage.setItem('token', data.token);
      
      // Store user data if needed
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
      }
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return {
        token: data.token,
        user: data.user
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get the current auth token
 * @returns {string|null} The auth token or null if not authenticated
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userEmail');
};
