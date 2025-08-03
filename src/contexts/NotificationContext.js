import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert, Box, Typography, Button } from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon 
} from '@mui/icons-material';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Check for due tasks every minute
  useEffect(() => {
    const checkDueTasks = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        const response = await fetch(`http://localhost:5000/api/tasks?userEmail=${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const tasks = await response.json();
          const now = new Date();
          
          // Find tasks due within the next 30 minutes
          const dueTasks = tasks.filter(task => {
            if (task.status === 'completed') return false;
            
            const dueDate = new Date(task.dueDate);
            const timeUntilDue = dueDate - now;
            const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));
            
            return minutesUntilDue <= 30 && minutesUntilDue > 0;
          });

          // Create notifications for due tasks
          dueTasks.forEach(task => {
            const dueDate = new Date(task.dueDate);
            const timeUntilDue = dueDate - now;
            const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));
            
            const notification = {
              id: `task-${task.id}-${Date.now()}`,
              type: 'task-reminder',
              title: 'Task Due Soon!',
              message: `"${task.title}" is due in ${minutesUntilDue} minute${minutesUntilDue > 1 ? 's' : ''}`,
              taskId: task.id,
              priority: task.priority,
              dueDate: task.dueDate,
              severity: minutesUntilDue <= 5 ? 'error' : minutesUntilDue <= 15 ? 'warning' : 'info'
            };

            // Check if this notification already exists
            const exists = notifications.find(n => n.taskId === task.id);
            if (!exists) {
              setNotifications(prev => [...prev, notification]);
              setCurrentNotification(notification);
              setOpen(true);
            }
          });
        }
      } catch (error) {
        console.error('Error checking due tasks:', error);
      }
    };

    // Check immediately on mount
    checkDueTasks();

    // Check every minute
    const interval = setInterval(checkDueTasks, 60000);

    return () => clearInterval(interval);
  }, [notifications]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setOpen(false);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <PriorityHighIcon sx={{ color: '#e74c3c' }} />;
      case 'medium':
        return <ScheduleIcon sx={{ color: '#f39c12' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#27ae60' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      default:
        return '#27ae60';
    }
  };

  const value = {
    notifications,
    addNotification: (notification) => {
      setNotifications(prev => [...prev, notification]);
      setCurrentNotification(notification);
      setOpen(true);
    },
    removeNotification: dismissNotification,
    clearAll: () => setNotifications([])
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Task Reminder Notification */}
      {currentNotification && (
        <Snackbar
          open={open}
          autoHideDuration={10000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={handleClose}
            severity={currentNotification.severity}
            sx={{
              width: '100%',
              minWidth: 350,
              backgroundColor: currentNotification.severity === 'error' ? '#fdeded' : 
                            currentNotification.severity === 'warning' ? '#fff4e5' : '#e8f5e8',
              border: `1px solid ${getPriorityColor(currentNotification.priority)}`,
              '& .MuiAlert-icon': {
                color: getPriorityColor(currentNotification.priority)
              }
            }}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => dismissNotification(currentNotification.id)}
                  sx={{ 
                    color: getPriorityColor(currentNotification.priority),
                    fontSize: '0.75rem'
                  }}
                >
                  Dismiss
                </Button>
              </Box>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {getPriorityIcon(currentNotification.priority)}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {currentNotification.title}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {currentNotification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Due: {new Date(currentNotification.dueDate).toLocaleString()}
            </Typography>
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}; 