// src/components/Header.js - Sticky AppBar (Header) with theme toggle and avatar menu
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip, Box, Fade, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useThemeMode } from '../context/ThemeContext';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HEADER_HEIGHT = 64;

const Header = ({ onMobileMenuClick, sx, handleLogout, isMobile, collapsed, setCollapsed }) => {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(() => localStorage.getItem('userAvatar') || '');
  const navigate = useNavigate();

  // Layout margins are handled by the content container; header shouldn't add its own offsets

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    setLogoutOpen(true);
    handleClose();
  };

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    handleLogout && handleLogout();
  };

  const handleLogoutCancel = () => {
    setLogoutOpen(false);
  };

  // Keep header avatar in sync with profile updates
  useEffect(() => {
    const updateFromStorage = () => setAvatarSrc(localStorage.getItem('userAvatar') || '');
    const onCustom = () => updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    window.addEventListener('avatar-updated', onCustom);
    return () => {
      window.removeEventListener('storage', updateFromStorage);
      window.removeEventListener('avatar-updated', onCustom);
    };
  }, []);

  return (
    <AppBar 
      position="sticky" 
      elevation={2} 
      color="default"
      sx={{ 
        zIndex: 1201, 
        minHeight: HEADER_HEIGHT,
        height: HEADER_HEIGHT,
        transition: 'background-color 0.4s',
        bgcolor: theme.palette.background.paper, // Always match sidebar color
        boxShadow: 'none',
        ...sx
      }}
    >
      <Toolbar sx={{ minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
        {/* Left side: mobile menu + app name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              aria-label="open navigation"
              onClick={onMobileMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {/* App title moved to Sidebar; header text removed */}
        </Box>
        {/* Right side: theme toggle, avatar, menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton 
              color="inherit" 
              onClick={toggleMode} 
              sx={{ 
                mr: 2, 
                color: mode === 'light' ? 'black' : 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Account">
            <IconButton 
              onClick={handleMenu} 
              size="small" 
              sx={{ 
                color: mode === 'light' ? 'black' : 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Avatar alt="User" src={avatarSrc || ''} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Settings</MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
          {/* Logout Confirmation Dialog */}
          <Dialog open={logoutOpen} onClose={handleLogoutCancel}>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to log out?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLogoutCancel} color="primary">Cancel</Button>
              <Button onClick={handleLogoutConfirm} color="error" variant="contained">Logout</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 