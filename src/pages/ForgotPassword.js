import React, { useState } from 'react';
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
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Email, ArrowBack } from '@mui/icons-material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://task-manager-back-emez.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmailSent(true);
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
              <Email sx={{ fontSize: 40, color: 'white' }} />
            </Box>

            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Check Your Email
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
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your email and click the link to reset your password.
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

            <Typography
              variant="body2"
              sx={{
                mb: 3,
                textAlign: 'center',
                color: theme.palette.text.secondary,
              }}
            >
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(25,118,210,0.3)',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(25,118,210,0.5)',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(25,118,210,0.05)',
                  },
                }}
              >
                Back to Login
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setMessage('');
                }}
                sx={{
                  flex: 1,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Try Again
              </Button>
            </Box>
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
            Forgot Password?
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
            No worries! Enter your email address and we'll send you a link to reset your password.
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              disabled={loading || !email.trim()}
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
                'Send Reset Link'
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

export default ForgotPassword;
