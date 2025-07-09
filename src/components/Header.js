// src/components/Header.js - Sticky AppBar (Header) with theme toggle and avatar menu
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip, Box, Fade, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeMode } from '../context/ThemeContext';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HEADER_HEIGHT = 64;

const Header = ({ onMobileMenuClick, sx, handleLogout, isMobile, collapsed, setCollapsed }) => {
  const { mode, toggleMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
        background: mode === 'light' ? '#fff' : theme => theme.palette.background.default,
        ...sx
      }}
    >
      <Toolbar sx={{ minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: 1, color: mode === 'light' ? 'black' : theme => theme.palette.text.primary, mr: 2 }}>
          MyApp
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={toggleMode} sx={{ mr: 2, color: mode === 'light' ? 'black' : theme => theme.palette.text.primary }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
        <Box>
          <Tooltip title="Account">
            <IconButton onClick={handleMenu} size="small" sx={{ color: mode === 'light' ? 'black' : theme => theme.palette.text.primary }}>
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
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Settings</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 