// src/layout/MainLayout.js - Main layout wrapper for dashboard (Sidebar + Header)
import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, IconButton } from '@mui/material';
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', transition: 'background-color 0.4s' }}>
      <Sidebar
        open={isMobile ? false : sidebarOpen}
        setOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        variant={isMobile ? 'temporary' : 'persistent'}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, ml: !isMobile && sidebarOpen ? (collapsed ? `${miniWidth}px` : `${drawerWidth}px`) : 0, transition: 'margin-left 0.3s' }}>
        <Header
          onMobileMenuClick={() => isMobile ? setMobileOpen(true) : setSidebarOpen(true)}
          handleLogout={handleLogout}
          sx={{ width: '100%', boxShadow: 'none' }}
          isMobile={isMobile}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        {/* Floating open button for desktop when sidebar is closed */}
        {!isMobile && !sidebarOpen && (
          <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1300 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', boxShadow: 3 }}>
              <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: 'white' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </IconButton>
            </Box>
          </Box>
        )}
        <Box component="main" sx={{ flex: 1, p: { xs: 1, sm: 2, md: 4 }, overflow: 'auto', width: '100%', minHeight: 400, transition: 'padding 0.3s' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 