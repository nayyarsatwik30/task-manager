import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Checkbox, FormControlLabel, Link, IconButton, InputAdornment, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { useTheme } from '@mui/material';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup clicked');
  };

  const handleFacebookSignup = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook signup clicked');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: mode === 'light' 
        ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)'
        : 'linear-gradient(135deg, #181a20 0%, #23272f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
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
          <Box sx={{ width: '100%', p: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom align="center" color="primary" mb={1}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" mb={4}>
              Join MyApp and start managing your tasks efficiently
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
                sx={{ mb: 2, 
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
                sx={{ mb: 2, 
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
                sx={{ mb: 2, 
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
                sx={{ mb: 2, 
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
              
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleSignup}
                sx={{ 
                  mb: 2, 
                  py: 1.5,
                  borderColor: '#db4437',
                  color: '#db4437',
                  '&:hover': {
                    borderColor: '#c23321',
                    backgroundColor: 'rgba(219, 68, 55, 0.04)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#db4437" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Box>
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleFacebookSignup}
                sx={{ 
                  py: 1.5,
                  borderColor: '#1877f2',
                  color: '#1877f2',
                  '&:hover': {
                    borderColor: '#166fe5',
                    backgroundColor: 'rgba(24, 119, 242, 0.04)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign up with Facebook
                </Box>
              </Button>
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
  );
};

export default Signup; 