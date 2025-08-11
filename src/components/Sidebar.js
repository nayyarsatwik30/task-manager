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
    <Box sx={{ width: collapsed ? 64 : 240, bgcolor: 'background.paper', p: 1 }}>
      {/* App title and hamburger */}
      <Box sx={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'space-between',
        alignItems: 'center',
        mb: 2,
        mt: 2,
        px: collapsed ? 0 : 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 'none',
        minHeight: 40
      }}>
        <IconButton 
          onClick={handleCollapse} 
          size="large"
          sx={{ 
            color: theme.palette.mode === 'light' ? 'black' : 'white',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.05)' },
            transition: 'all 0.2s'
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <List>
        <ListItemButton
          selected={location.pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')}
          sx={{
            borderRadius: 2,
            my: 0.5,
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 3,
            '&:hover': { bgcolor: blueHover },
            fontWeight: location.pathname === '/dashboard' ? 700 : 500,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
            <DashboardIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Dashboard" />}
        </ListItemButton>
        <ListItemButton
          selected={location.pathname === '/tasks'}
          onClick={() => { navigate('/tasks'); if (!collapsed) setTasksOpen(o => !o); }}
          sx={{
            borderRadius: 2,
            my: 0.5,
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 3,
            '&:hover': { bgcolor: blueHover },
            fontWeight: 700,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
            <AssignmentIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="My Tasks" />}
          {!collapsed && (tasksOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        {!collapsed && tasksOpen && taskFilters.map(filter => (
          <ListItemButton
            key={filter.value}
            selected={selectedFilter === filter.value}
            onClick={() => navigate(`/tasks?filter=${filter.value}`)}
            sx={{
              pl: 6,
              borderRadius: 2,
              my: 0.5,
              minHeight: 40,
              bgcolor: selectedFilter === filter.value ? 'action.selected' : undefined,
              '&:hover': { bgcolor: blueHover },
              fontWeight: selectedFilter === filter.value ? 700 : 500,
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 1, justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '16px' }}>{filter.icon}</Typography>
            </ListItemIcon>
            <ListItemText primary={filter.name} />
          </ListItemButton>
        ))}
        <ListItemButton
          selected={location.pathname === '/calendar'}
          onClick={() => navigate('/calendar')}
          sx={{
            borderRadius: 2,
            my: 0.5,
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 3,
            '&:hover': { bgcolor: blueHover },
            fontWeight: location.pathname === '/calendar' ? 700 : 500,
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
            <CalendarTodayIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Calendar" />}
        </ListItemButton>
      </List>
    </Box>
  );

  if (isPersistent) {
    return (
      <Box sx={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: collapsed ? 64 : 240, bgcolor: 'background.paper', transition: 'width 0.2s', zIndex: 1202, boxShadow: 1, overflow: 'hidden' }}>
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