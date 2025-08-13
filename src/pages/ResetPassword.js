import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  useTheme,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token, email]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate passwords
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setResetSuccess(true);
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(129,199,132,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(76,175,80,0.02) 0%, rgba(129,199,132,0.01) 100%)',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(76,175,80,0.2)',
              borderRadius: 2,
              width: '100%',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
            </Box>

            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Password Reset Successful!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                textAlign: 'center',
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            >
              Your password has been successfully reset. You can now log in with your new password.
            </Typography>

            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                width: '100%',
                '& .MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center',
                }
              }}
            >
              {message}
            </Alert>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                },
                transition: 'all 0.2s ease-in-out',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!token || !email) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(239,83,80,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(244,67,54,0.02) 0%, rgba(239,83,80,0.01) 100%)',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(244,67,54,0.3)' : '1px solid rgba(244,67,54,0.2)',
              borderRadius: 2,
              width: '100%',
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 2,
                color: theme.palette.error.main,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Invalid Reset Link
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                textAlign: 'center',
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            >
              This password reset link is invalid or has expired. Please request a new password reset.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/forgot-password')}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
                },
                transition: 'all 0.2s ease-in-out',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Request New Reset Link
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(25,118,210,0.02) 0%, rgba(66,165,245,0.01) 100%)',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(25,118,210,0.1)',
            borderRadius: 2,
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Lock sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 1,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Reset Password
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              textAlign: 'center',
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            Enter your new password below. Make sure it's secure and easy to remember.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(66,165,245,0.7)' : '#42a5f5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(66,165,245,0.7)' : '#42a5f5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
              sx={{
                mb: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
                },
                '&:disabled': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#42a5f5' : '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                ← Back to Login
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
  );
};

export default ResetPassword;
