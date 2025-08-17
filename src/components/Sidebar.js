// src/components/Sidebar.js - Modern, collapsible sidebar like Toolpad
import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, IconButton, Box, useTheme, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ListItem } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 220;
const miniWidth = 64;
const HEADER_HEIGHT = 64;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'My Tasks', icon: <ChecklistIcon />, path: '/tasks' },
  { label: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
];

const projects = ['Home', 'Education', 'My Work'];

const Sidebar = ({ open, setOpen, mobileOpen, setMobileOpen, collapsed = false, setCollapsed, variant = 'persistent' }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedFilter = params.get('filter');
  const [tasksOpen, setTasksOpen] = React.useState(true); // expanded by default
  const taskFilters = [
    { name: "Today's Tasks", value: 'today', icon: '📅' },
    { name: 'Upcoming', value: 'upcoming', icon: '⏰' },
    { name: 'Completed', value: 'completed', icon: '✅' }
  ];

  const handleCollapse = () => setCollapsed && setCollapsed(!collapsed);

  const isPersistent = variant === 'persistent';
  const drawerIsOpen = isPersistent ? open : mobileOpen;

  const blueHover = theme => theme.palette.mode === 'light' ? '#e3f2fd' : '#1565c0';

  const NavContent = (
    <Box sx={{ 
      width: collapsed ? 64 : 280, 
      bgcolor: 'background.paper', 
      p: 2,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* App title and hamburger */}
      <Box sx={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'space-between',
        alignItems: 'center',
        mb: 4,
        mt: 1,
        px: collapsed ? 0 : 2,
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 'none',
        minHeight: 48
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleCollapse} 
            size="large"
            sx={{ 
              color: theme.palette.mode === 'light' ? 'black' : 'white',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              '&:hover': { 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                transform: 'scale(1.05)' 
              },
              transition: 'all 0.2s',
              borderRadius: 2
            }}
          >
            <MenuIcon />
          </IconButton>
          {!collapsed && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Task Manager
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Main Navigation */}
        <Typography 
          variant="overline" 
          sx={{ 
            px: collapsed ? 0 : 2, 
            mb: 2, 
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.5px',
            display: collapsed ? 'none' : 'block'
          }}
        >
          Navigation
        </Typography>
        <List sx={{ mb: 3 }}>
        <ListItemButton
          selected={location.pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')}
          sx={{
            borderRadius: 3,
            my: 1,
            minHeight: 56,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 3,
            mx: collapsed ? 1 : 0,
            '&:hover': { 
              bgcolor: blueHover,
              transform: 'translateX(4px)'
            },
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main + '15',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: theme.palette.primary.main + '20'
              }
            },
            fontWeight: location.pathname === '/dashboard' ? 700 : 500,
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: collapsed ? 0 : 3, 
            justifyContent: 'center',
            color: location.pathname === '/dashboard' ? theme.palette.primary.main : 'inherit'
          }}>
            <DashboardIcon sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{
                fontWeight: location.pathname === '/dashboard' ? 600 : 500,
                fontSize: '0.95rem'
              }}
            />
          )}
        </ListItemButton>
        <ListItemButton
          selected={location.pathname === '/tasks'}
          onClick={() => { navigate('/tasks'); if (!collapsed) setTasksOpen(o => !o); }}
          sx={{
            borderRadius: 3,
            my: 1,
            minHeight: 56,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 3,
            mx: collapsed ? 1 : 0,
            '&:hover': { 
              bgcolor: blueHover,
              transform: 'translateX(4px)'
            },
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main + '15',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: theme.palette.primary.main + '20'
              }
            },
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: collapsed ? 0 : 3, 
            justifyContent: 'center',
            color: location.pathname === '/tasks' ? theme.palette.primary.main : 'inherit'
          }}>
            <AssignmentIcon sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText 
              primary="My Tasks" 
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            />
          )}
          {!collapsed && (
            <Box sx={{ 
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center'
            }}>
              {tasksOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </ListItemButton>
        {!collapsed && tasksOpen && (
          <Box sx={{ ml: 2, mb: 2 }}>
            {taskFilters.map(filter => (
              <ListItemButton
                key={filter.value}
                selected={selectedFilter === filter.value}
                onClick={() => navigate(`/tasks?filter=${filter.value}`)}
                sx={{
                  pl: 4,
                  borderRadius: 2,
                  my: 0.8,
                  minHeight: 44,
                  bgcolor: selectedFilter === filter.value ? theme.palette.primary.main + '10' : undefined,
                  border: selectedFilter === filter.value ? `1px solid ${theme.palette.primary.main}30` : '1px solid transparent',
                  '&:hover': { 
                    bgcolor: blueHover,
                    transform: 'translateX(2px)'
                  },
                  fontWeight: selectedFilter === filter.value ? 600 : 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0, 
                  mr: 2, 
                  justifyContent: 'center',
                  opacity: 0.8
                }}>
                  <Typography sx={{ fontSize: '18px' }}>{filter.icon}</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary={filter.name} 
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: selectedFilter === filter.value ? 600 : 500
                  }}
                />
              </ListItemButton>
            ))}
          </Box>
        )}
        <ListItemButton
          selected={location.pathname === '/calendar'}
          onClick={() => navigate('/calendar')}
          sx={{
            borderRadius: 3,
            my: 1,
            minHeight: 56,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 3,
            mx: collapsed ? 1 : 0,
            '&:hover': { 
              bgcolor: blueHover,
              transform: 'translateX(4px)'
            },
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main + '15',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              '&:hover': {
                bgcolor: theme.palette.primary.main + '20'
              }
            },
            fontWeight: location.pathname === '/calendar' ? 700 : 500,
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: collapsed ? 0 : 3, 
            justifyContent: 'center',
            color: location.pathname === '/calendar' ? theme.palette.primary.main : 'inherit'
          }}>
            <CalendarTodayIcon sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText 
              primary="Calendar" 
              primaryTypographyProps={{
                fontWeight: location.pathname === '/calendar' ? 600 : 500,
                fontSize: '0.95rem'
              }}
            />
          )}
        </ListItemButton>
        </List>
      </Box>
    </Box>
  );

  if (isPersistent) {
    return (
      <Box sx={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        height: '100vh', 
        width: collapsed ? 64 : 280, 
        bgcolor: 'background.paper', 
        transition: 'width 0.3s ease', 
        zIndex: 1202, 
        boxShadow: theme.palette.mode === 'dark' ? '4px 0 20px rgba(0,0,0,0.3)' : '4px 0 20px rgba(0,0,0,0.08)', 
        overflow: 'hidden',
        borderRight: `1px solid ${theme.palette.divider}`
      }}>
        {NavContent}
      </Box>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={drawerIsOpen}
      onClose={() => setMobileOpen && setMobileOpen(false)}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { width: 240, bgcolor: 'background.paper' } }}
    >
      {NavContent}
    </Drawer>
  );
}
;

export default Sidebar; 