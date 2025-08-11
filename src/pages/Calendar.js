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
        padding: 0,
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        minHeight: '100vh',
        '& .fc': {
          backgroundColor: 'transparent',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        '& .fc-header-toolbar': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
          padding: '20px',
          marginBottom: '0px',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        '& .fc-toolbar-title': {
          color: theme.palette.text.primary,
          fontSize: '1.5rem',
          fontWeight: 600,
        },
        '& .fc-button': {
          backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#e0e0e0',
          borderColor: 'transparent',
          color: theme.palette.text.primary,
          borderRadius: '8px',
          padding: '8px 16px',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: '#ffffff',
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
          backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
          borderColor: theme.palette.mode === 'dark' ? '#404040' : '#e0e0e0',
          minHeight: '120px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#353535' : '#f8f9fa',
          }
        },
        '& .fc-daygrid-day-number': {
          color: theme.palette.text.primary,
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px',
        },
        '& .fc-daygrid-day.fc-day-today': {
          backgroundColor: theme.palette.mode === 'dark' ? '#263238' : '#f0f8ff',
          border: theme.palette.mode === 'dark' ? '1px solid #37474f' : '1px solid #b3d9ff',
        },
        '& .fc-event': {
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '2px 6px',
          margin: '1px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }
        },
        '& .fc-daygrid-body': {
          backgroundColor: 'transparent',
        },
        '& .fc-scrollgrid': {
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
            padding: '12px'
          },
          '& .fc-toolbar-title': {
            fontSize: '1.125rem'
          },
          '& .fc-daygrid-day': {
            minHeight: '80px'
          },
          '& .fc-button': {
            padding: '6px 10px'
          }
        }
      }}
    >
      <Box sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
        padding: { xs: '12px', sm: '20px' },
        borderRadius: '12px 12px 0 0',
        marginBottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        flexWrap: 'wrap',
        gap: 1,
      }}>
        <Box>
          <h1 style={{ 
            margin: 0, 
            color: theme.palette.text.primary,
            fontSize: '1.75rem',
            fontWeight: 600
          }}>Calendar</h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: theme.palette.text.secondary,
            fontSize: '0.875rem'
          }}>Click on any date to add a new task</p>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            width: { xs: '100%', sm: 'auto' }
          }}
          onClick={() => setDialogOpen(true)}
        >
          + New Task
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
