// src/components/Sidebar.js - Modern, collapsible sidebar like Toolpad
import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, IconButton, Box, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 220;
const miniWidth = 64;
const HEADER_HEIGHT = 64;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'My Tasks', icon: <ChecklistIcon />, path: '/tasks' },
  { label: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
];

const Sidebar = ({ open, setOpen, mobileOpen, setMobileOpen, collapsed = false, setCollapsed, variant = 'persistent' }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(false);
  // Remove collapse logic for now (single open/close)

  const isPersistent = variant === 'persistent';
  const drawerIsOpen = isPersistent ? open : mobileOpen;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        {/* Collapse/Expand Button at the top */}
        <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', alignItems: 'center', p: 1 }}>
          <IconButton onClick={() => setCollapsed && setCollapsed(!collapsed)} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
        <List sx={{ mt: 2 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Tooltip key={item.label} title={collapsed ? item.label : ''} placement="right">
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="sidebar-accent"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 8,
                          bottom: 8,
                          width: 6,
                          borderRadius: 6,
                          background: '#1976d2',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <ListItemButton
                    selected={active}
                    onClick={() => {
                      navigate(item.path);
                      if (!isPersistent) setMobileOpen(false);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 0 : 3,
                      borderRadius: 2,
                      my: 0.5,
                      color: active
                        ? theme.palette.primary.main
                        : theme => theme.palette.mode === 'light' ? 'black' : theme.palette.text.primary,
                      background: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      fontWeight: active ? 700 : 500,
                      '&:hover': {
                        background: theme => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                        color: theme.palette.primary.main,
                      },
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    {active && (
                      <Box sx={{
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 4,
                        borderRadius: 4,
                        bgcolor: theme.palette.primary.main,
                        zIndex: 1,
                      }} />
                    )}
                    <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center', color: active ? theme.palette.primary.main : (theme.palette.mode === 'light' ? 'black' : 'white') }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={item.label} sx={{ fontWeight: active ? 700 : 500, color: active ? theme.palette.primary.main : theme => theme.palette.mode === 'light' ? 'black' : theme.palette.text.primary }} />}
                  </ListItemButton>
                </Box>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={drawerIsOpen}
      onClose={isPersistent ? () => setOpen(false) : handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: drawerIsOpen ? (collapsed ? miniWidth : drawerWidth) : 0,
          bgcolor: theme => theme.palette.mode === 'light' ? '#fff' : theme.palette.background.default,
          background: theme => theme.palette.mode === 'light' ? '#fff' : theme.palette.background.default,
          borderRight: 0,
          color: theme => theme.palette.mode === 'light' ? 'black' : theme.palette.text.primary,
          transition: 'width 0.3s',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 