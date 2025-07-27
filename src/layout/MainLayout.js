// src/layout/MainLayout.js - Main layout wrapper for dashboard (Sidebar + Header)
import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, IconButton, AppBar, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const drawerWidth = 220;
const miniWidth = 64;

const MainLayout = ({ children, handleLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'background-color 0.4s',
        overflow: 'hidden'
      }}
    >
      <Sidebar
        open={isMobile ? false : sidebarOpen}
        setOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        variant={isMobile ? 'temporary' : 'persistent'}
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ml: { xs: 0, md: collapsed ? '64px' : '240px' },
          transition: 'margin-left 0.2s'
        }}
      >
        {/* Render Header directly so it can control its own margin/width */}
        <Header
          onMobileMenuClick={() => isMobile ? setMobileOpen(true) : setSidebarOpen(true)}
          handleLogout={handleLogout}
          isMobile={isMobile}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 1, sm: 2, md: 4 },
            overflow: 'auto',
            width: '100%',
            minHeight: 400,
            transition: 'padding 0.3s',
            bgcolor: 'background.default'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;