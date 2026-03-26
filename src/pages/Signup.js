import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Checkbox, FormControlLabel, Link, IconButton, InputAdornment, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { useTheme } from '@mui/material';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import AnimatedBackground from '../components/AnimatedBackground';

const GOOGLE_CLIENT_ID = "862607090612-h287u3ho2jcpf7nul1g3lf8beoria71g.apps.googleusercontent.com";

const Signup = ({ setIsAuthenticated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const theme = useTheme();

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.terms) newErrors.terms = 'You must accept the terms.';
    return newErrors;
  };

  const handleShowPassword = () => setShowPassword((show) => !show);
  const handleShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'terms' ? event.target.checked : event.target.value
    }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password
    };

    console.log('🔍 FRONTEND SIGNUP DEBUG - Sending payload:', payload);

    try {
      const res = await fetch('https://task-manager-back-emez.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('🔍 FRONTEND SIGNUP DEBUG - Response status:', res.status);

      const data = await res.json();
      console.log('🔍 FRONTEND SIGNUP DEBUG - Response data:', data);

      if (data.success) {
        // Store user email in localStorage for verification page
        if (formData.email) {
          localStorage.setItem('userEmail', formData.email);
        }
        // Redirect to verification page instead of dashboard
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ api: data.message || 'Signup failed' });
      }
    } catch (err) {
      console.error('🔍 FRONTEND SIGNUP DEBUG - Fetch error:', err);
      setErrors({ api: 'Network error. Please try again.' });
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup clicked');
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
          p: { xs: 2, sm: 3 },
        }}
      >
        <Grid container sx={{ maxWidth: 600, width: '100%' }}>
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
            <Box sx={{ width: '100%', p: { xs: 3, sm: 4 } }}>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                align="center"
                color="primary"
                mb={1}
                sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={4}>
                Join Task Manager and start managing your tasks efficiently
              </Typography>

              <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
                <TextField
                  required
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  name="fullName"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      background: mode === 'dark' ? theme.palette.background.default : 'white',
                      color: theme.palette.text.primary
                    },
                    '& .MuiInputLabel-root': {
                      color: mode === 'dark' ? theme.palette.text.secondary : undefined
                    }
                  }}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  InputLabelProps={{ style: { color: mode === 'dark' ? theme.palette.text.secondary : undefined } }}
                  InputProps={{ style: { color: theme.palette.text.primary } }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      background: mode === 'dark' ? theme.palette.background.default : 'white',
                      color: theme.palette.text.primary
                    },
                    '& .MuiInputLabel-root': {
                      color: mode === 'dark' ? theme.palette.text.secondary : undefined
                    }
                  }}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputLabelProps={{ style: { color: mode === 'dark' ? theme.palette.text.secondary : undefined } }}
                  InputProps={{ style: { color: theme.palette.text.primary } }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      background: mode === 'dark' ? theme.palette.background.default : 'white',
                      color: theme.palette.text.primary
                    },
                    '& .MuiInputLabel-root': {
                      color: mode === 'dark' ? theme.palette.text.secondary : undefined
                    }
                  }}
                  error={!!errors.password}
                  helperText={errors.password}
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

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': {
                      background: mode === 'dark' ? theme.palette.background.default : 'white',
                      color: theme.palette.text.primary
                    },
                    '& .MuiInputLabel-root': {
                      color: mode === 'dark' ? theme.palette.text.secondary : undefined
                    }
                  }}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputLabelProps={{ style: { color: mode === 'dark' ? theme.palette.text.secondary : undefined } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowConfirmPassword} edge="end" aria-label="toggle confirm password visibility">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    style: { color: theme.palette.text.primary },
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.terms}
                      onChange={handleChange('terms')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" color="primary" underline="hover">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="#" color="primary" underline="hover">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 1 }}
                />
                {errors.terms && (
                  <Typography variant="caption" color="error" sx={{ ml: 1, mb: 2, display: 'block' }}>{errors.terms}</Typography>
                )}
                {errors.api && (
                  <Typography variant="caption" color="error" sx={{ ml: 1, mb: 2, display: 'block' }}>{errors.api}</Typography>
                )}

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
                  Create Account
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
                      fetch('https://task-manager-back-emez.onrender.com/api/auth/google', {
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
                      console.log('Google Signup Failed');
                    }}
                  />
                </GoogleOAuthProvider>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link href="/login" color="primary" underline="hover" sx={{ fontWeight: 600 }}>
                    Sign in
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

export default Signup;