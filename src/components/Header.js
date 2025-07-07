// src/components/Header.js - Sticky AppBar (Header) with theme toggle and avatar menu
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip, Box, Fade, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeMode } from '../context/ThemeContext';
import { useTheme } from '@mui/material';

const HEADER_HEIGHT = 64;

const Header = ({ onMobileMenuClick, sx, handleLogout, isMobile, collapsed, setCollapsed }) => {
  const { mode, toggleMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar 
      position="sticky" 
      elevation={2} 
      color="primary"
      sx={{ 
        zIndex: 1201, 
        minHeight: HEADER_HEIGHT,
        height: HEADER_HEIGHT,
        transition: 'background-color 0.4s',
        background: mode === 'light' ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : 'background.paper',
        ...sx
      }}
    >
      <Toolbar sx={{ minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT }}>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => {
          if (isMobile) {
            onMobileMenuClick();
          } else {
            setCollapsed && setCollapsed(!collapsed);
          }
        }} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: 1, color: 'white', mr: 2 }}>
          MyApp
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={toggleMode} sx={{ mr: 2 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
        <Box>
          <Tooltip title="Account">
            <IconButton onClick={handleMenu} size="small" sx={{ color: 'white' }}>
              <Avatar alt="User" src="" />
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
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={() => { handleClose(); setLogoutOpen(true); }}>Logout</MenuItem>
          </Menu>
        </Box>
        <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>Are you sure you want to logout?</DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={() => { setLogoutOpen(false); handleLogout && handleLogout(); }}>Logout</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 