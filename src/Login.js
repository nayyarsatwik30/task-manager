import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Checkbox, FormControlLabel, Link, IconButton, InputAdornment, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from './context/ThemeContext';
import { useTheme } from '@mui/material';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import AnimatedBackground from './components/AnimatedBackground';

const Login = ({ setIsAuthenticated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const theme = useTheme();

  const GOOGLE_CLIENT_ID ="862607090612-h287u3ho2jcpf7nul1g3lf8beoria71g.apps.googleusercontent.com";

  const handleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated && setIsAuthenticated(true);
        // Store user email in localStorage for profile page
        if (data.user && data.user.email) {
          localStorage.setItem('userEmail', data.user.email);
        }
        navigate('/');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  const handleMicrosoftLogin = () => {
    // Redirect to backend Microsoft OAuth route
    window.location.href = 'http://localhost:5000/api/auth/microsoft';
  };

  return (
    <AnimatedBackground>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Grid container sx={{ maxWidth: 500, width: '100%' }}>
          <Grid item xs={12} component={Paper} elevation={6} square sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: mode === 'light' 
              ? 'rgba(255,255,255,0.95)'
              : theme.palette.background.paper,
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            color: theme.palette.text.primary
          }}>
            <Box sx={{ width: '100%', p: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom align="center" color="primary" mb={1}>
                Welcome to Task Manager
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={4}>
                Sign in to your account to continue
              </Typography>
            
            <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
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
                onChange={e => setEmail(e.target.value)}
                sx={{ mb: 2, 
                  '& .MuiInputBase-root': {
                    background: mode === 'dark' ? theme.palette.background.default : 'white',
                    color: theme.palette.text.primary
                  },
                  '& .MuiInputLabel-root': {
                    color: mode === 'dark' ? theme.palette.text.secondary : undefined
                  }
                }}
                InputLabelProps={{ style: { color: mode === 'dark' ? theme.palette.text.secondary : undefined } }}
                InputProps={{
                  style: { color: theme.palette.text.primary },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{ mb: 1, 
                  '& .MuiInputBase-root': {
                    background: mode === 'dark' ? theme.palette.background.default : 'white',
                    color: theme.palette.text.primary
                  },
                  '& .MuiInputLabel-root': {
                    color: mode === 'dark' ? theme.palette.text.secondary : undefined
                  }
                }}
                InputLabelProps={{ style: { color: mode === 'dark' ? theme.palette.text.secondary : undefined } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword} edge="end" aria-label="toggle password visibility">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: { color: theme.palette.text.primary },
                }}
              />
              {error && (
                <Typography color="error" sx={{ mb: 2, fontWeight: 500 }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} color="primary" />}
                  label="Remember Me"
                />
                <Link href="#" variant="body2" underline="hover" color="primary">
                  Forgot password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  py: 1.5, 
                  fontWeight: 600, 
                  fontSize: '1rem', 
                  borderRadius: 2, 
                  boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
                  }
                }}
              >
                Sign In
              </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    fetch('http://localhost:5000/api/auth/google', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: credentialResponse.credential }),
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        localStorage.setItem('userEmail', data.user.email);
                        setIsAuthenticated && setIsAuthenticated(true);
                        navigate('/');
                      }
                    });
                  }}
                  onError={() => {
                    console.log('Google Login Failed');
                  }}
                />
              </GoogleOAuthProvider>
              
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleMicrosoftLogin}
                sx={{ 
                  py: 1.5,
                  borderColor: '#5e5e5e',
                  color: '#e0e0e0',
                  backgroundColor: theme.palette.mode === 'dark' ? '#2b2b2b' : 'transparent',
                  '&:hover': {
                    borderColor: '#4a4a4a',
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : 'rgba(0,0,0,0.04)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Microsoft 4-square logo */}
                  <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                    <rect width="10" height="10" x="1" y="1" fill="#f25022"/>
                    <rect width="10" height="10" x="12" y="1" fill="#7fba00"/>
                    <rect width="10" height="10" x="1" y="12" fill="#00a4ef"/>
                    <rect width="10" height="10" x="12" y="12" fill="#ffb900"/>
                  </svg>
                  Continue with Microsoft
                </Box>
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/signup" color="primary" underline="hover" sx={{ fontWeight: 600 }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </AnimatedBackground>
  );
};

export default Login;