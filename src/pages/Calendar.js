// src/pages/Calendar.js
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Box, 
  useTheme, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTasks } from '../hooks/useTasks';

const CalendarPage = () => {
  const { tasks, createTask, loading } = useTasks();
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_time: ''
  });
  const theme = useTheme();

  // Convert tasks to calendar events
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const calendarEvents = tasks.map(task => {
        // Create event start datetime
        let eventStart = task.due_date;
        let isAllDay = true;
        
        if (task.due_time) {
          // Combine date and time for timed events
          const taskDate = new Date(task.due_date);
          const [hours, minutes] = task.due_time.split(':');
          taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          eventStart = taskDate.toISOString();
          isAllDay = false;
        }
        
        return {
          id: task.id.toString(),
          title: task.due_time ? 
            `${task.title} (${task.due_time})` : 
            task.title,
          start: eventStart,
          allDay: isAllDay,
          extendedProps: {
            description: task.description,
            priority: task.priority,
            status: task.status,
            due_time: task.due_time,
            taskId: task.id
          },
          backgroundColor: getPriorityColor(task.priority),
          borderColor: getPriorityColor(task.priority),
          textColor: '#ffffff',
          // Add status styling
          className: task.status === 'completed' ? 'completed-task' : ''
        };
      });
      
      setEvents(calendarEvents);
    }
  }, [tasks]);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setDialogOpen(true);
  };

  const handleEventClick = (info) => {
    const task = info.event.extendedProps;
    const taskTitle = info.event.title.replace(/ \(\d{2}:\d{2}\)$/, ''); // Remove time from title
    
    const message = `Task: ${taskTitle}\n` +
                   `Description: ${task.description || 'No description'}\n` +
                   `Priority: ${task.priority}\n` +
                   `Status: ${task.status}\n` +
                   `Due: ${task.due_time ? `${info.event.start.toDateString()} at ${task.due_time}` : info.event.start.toDateString()}`;
    
    alert(message);
  };

  const handleFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = async () => {
    if (taskForm.title.trim()) {
      try {
        // Create task using the real API
        const taskData = {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          status: taskForm.status,
          due_date: selectedDate,
          due_time: taskForm.due_time || null
        };
        
        await createTask(taskData);
        handleCloseDialog();
        // Events will be updated automatically via useEffect when tasks change
      } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'pending', due_time: '' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  return (
    <Box 
      sx={{ 
        padding: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.mode === 'dark' ? '#0f1218' : '#f3f6fb',
        backgroundImage: theme.palette.mode === 'dark' 
          ? 'radial-gradient(1200px 400px at 20% -20%, rgba(30, 144, 255, 0.08), transparent), radial-gradient(900px 300px at 110% 10%, rgba(156, 39, 176, 0.08), transparent)'
          : 'radial-gradient(1200px 400px at 20% -20%, rgba(25, 118, 210, 0.06), transparent), radial-gradient(900px 300px at 110% 10%, rgba(156, 39, 176, 0.04), transparent)',
        minHeight: '100vh',
        '& .fc': {
          backgroundColor: 'transparent',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        '& .fc-header-toolbar': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
          padding: { xs: '12px 16px', sm: '16px 20px' },
          marginBottom: '0px',
          borderRadius: '8px 8px 0 0',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
        },
        '& .fc-toolbar-title': {
          color: theme.palette.text.primary,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 700,
          letterSpacing: '-0.02em',
        },
        '& .fc-button': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f8f9fa',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e9ecef',
          color: theme.palette.text.primary,
          borderRadius: '6px',
          padding: { xs: '6px 12px', sm: '8px 16px' },
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: '36px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: '#ffffff',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          },
          '&:focus': {
            boxShadow: 'none',
          }
        },
        '& .fc-button-primary:not(:disabled).fc-button-active': {
          backgroundColor: theme.palette.primary.main,
          color: '#ffffff',
        },
        '& .fc-col-header': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
        },
        '& .fc-col-header-cell': {
          backgroundColor: 'transparent',
          color: theme.palette.text.secondary,
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '12px 8px',
          borderColor: theme.palette.divider,
        },
        '& .fc-daygrid-day': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef1f6',
          minHeight: { xs: '80px', sm: '100px' },
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)',
            transform: 'scale(1.01)',
          }
        },
        '& .fc-daygrid-day-number': {
          color: theme.palette.text.primary,
          fontWeight: 600,
          fontSize: { xs: '0.8rem', sm: '0.875rem' },
          padding: { xs: '6px', sm: '8px' },
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        },
        '& .fc-daygrid-day.fc-day-today': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.08)',
          border: theme.palette.mode === 'dark' ? '2px solid rgba(25, 118, 210, 0.4)' : '2px solid rgba(25, 118, 210, 0.3)',
          boxShadow: theme.palette.mode === 'dark' ? '0 0 20px rgba(25, 118, 210, 0.2)' : '0 0 20px rgba(25, 118, 210, 0.15)',
          '& .fc-daygrid-day-number': {
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }
        },
        '& .fc-event': {
          borderRadius: '4px',
          border: 'none',
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          fontWeight: 600,
          padding: { xs: '1px 4px', sm: '2px 6px' },
          margin: '1px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-1px) scale(1.02)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 10,
          }
        },
        '& .fc-daygrid-body': {
          backgroundColor: 'transparent',
        },
        '& .fc-scrollgrid': {
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
          borderTop: 'none',
        },
        '& .completed-task': {
          opacity: 0.6,
          textDecoration: 'line-through',
          '& .fc-event-title': {
            textDecoration: 'line-through',
          }
        },
        [theme.breakpoints.down('sm')]: {
          '& .fc-header-toolbar': {
            padding: '12px',
            flexDirection: 'column',
            gap: '8px'
          },
          '& .fc-toolbar-chunk': {
            display: 'flex',
            justifyContent: 'center',
            gap: '4px'
          },
          '& .fc-toolbar-title': {
            fontSize: '1.125rem',
            order: -1
          },
          '& .fc-daygrid-day': {
            minHeight: '70px'
          },
          '& .fc-button': {
            padding: '6px 8px',
            fontSize: '0.8rem'
          }
        }
      }}
    >
      <Box sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
        padding: { xs: '16px', sm: '20px' },
        borderRadius: '8px 8px 0 0',
        marginBottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <h1 style={{ 
            margin: 0, 
            color: theme.palette.text.primary,
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>📅 Calendar</h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: theme.palette.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 500
          }}>✨ Click any date to create tasks</p>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ 
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 700,
            padding: { xs: '10px 16px', sm: '12px 24px' },
            width: { xs: '100%', sm: 'auto' },
            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
              background: 'linear-gradient(135deg, #1565c0 0%, #6a1b9a 100%)',
            }
          }}
          onClick={() => setDialogOpen(true)}
        >
          ✨ New Task
        </Button>
      </Box>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
      />
      
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          Add New Task
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Description"
            value={taskForm.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={taskForm.priority}
                label="Priority"
                onChange={(e) => handleFormChange('priority', e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={taskForm.status}
                label="Status"
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {selectedDate && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.action.hover, borderRadius: 1 }}>
              <strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString()}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTask} 
            variant="contained" 
            color="primary"
            disabled={!taskForm.title.trim()}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
