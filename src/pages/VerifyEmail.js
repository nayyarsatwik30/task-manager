import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import { 
  Email as EmailIcon, 
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material';

const VerifyEmail = ({ setIsAuthenticated }) => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending'); // 'pending', 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  
  const userEmail = searchParams.get('email') || localStorage.getItem('userEmail');
  const token = searchParams.get('token');
  const verified = searchParams.get('verified');
  const error = searchParams.get('error');

  useEffect(() => {
    // Handle errors from backend
    if (error) {
      setStatus('error');
      if (error === 'invalid_token') {
        setMessage('This verification link has expired or is invalid. Please request a new verification email.');
      } else if (error === 'invalid_link') {
        setMessage('Invalid verification link. Please check your email for the correct link.');
      } else {
        setMessage('An error occurred during verification. Please try again.');
      }
      return;
    }
    
    // If verification is already confirmed from backend
    if (verified === 'true' && userEmail) {
      setStatus('success');
      setMessage('Email verified successfully! Redirecting to dashboard...');
      
      // Set authentication and redirect after a short delay
      setTimeout(() => {
        setIsAuthenticated(true);
        navigate('/');
      }, 2000);
    }
    // If we have a token in the URL, this is a verification link click
    else if (token && userEmail) {
      handleVerification();
    }
  }, [token, userEmail, verified, error]);

  const handleVerification = async () => {
    setStatus('verifying');
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/verify-email?token=${token}&email=${encodeURIComponent(userEmail)}`
      );
      
      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');
        
        // Set authentication and redirect after a short delay
        setTimeout(() => {
          setIsAuthenticated(true);
          navigate('/');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Verification failed. The link may be expired or invalid.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage('Failed to resend email. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying your email...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon 
              sx={{ 
                fontSize: 80, 
                color: 'success.main', 
                mb: 3 
              }} 
            />
            <Typography variant="h4" gutterBottom color="success.main">
              Email Verified!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <CircularProgress size={24} />
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ mr: 2 }}
            >
              Go to Login
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleResendEmail}
              startIcon={<RefreshIcon />}
            >
              Resend Email
            </Button>
          </Box>
        );

      default: // pending
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EmailIcon 
              sx={{ 
                fontSize: 80, 
                color: 'primary.main', 
                mb: 3 
              }} 
            />
            <Typography variant="h4" gutterBottom>
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a verification link to:
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                color: 'primary.main',
                fontWeight: 600 
              }}
            >
              {userEmail}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Click the link in your email to verify your account and access your dashboard.
              If you don't see the email, check your spam folder.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="outlined" 
                onClick={handleResendEmail}
                startIcon={<RefreshIcon />}
                sx={{ mr: 2 }}
              >
                Resend Email
              </Button>
              <Button 
                variant="text" 
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 4 }}>
              <Typography variant="body2">
                <strong>Didn't receive the email?</strong><br />
                • Check your spam/junk folder<br />
                • Make sure the email address is correct<br />
                • Try resending the verification email
              </Typography>
            </Alert>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)'
        : 'linear-gradient(135deg, #181a20 0%, #23272f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Box sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                🎯 Task Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email Verification
              </Typography>
            </Box>
            
            {renderContent()}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
