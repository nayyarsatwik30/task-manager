// src/pages/Calendar.js
import React, { useState } from "react";
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


const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });
  const theme = useTheme();

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setDialogOpen(true);
  };

  const handleEventClick = (info) => {
    const confirmDelete = window.confirm(`Delete task: "${info.event.title}"?`);
    if (confirmDelete) {
      setEvents(events.filter(event => event.id !== info.event.id));
    }
  };

  const handleFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = () => {
    if (taskForm.title.trim()) {
      const newEvent = {
        id: Date.now().toString(),
        title: taskForm.title,
        start: selectedDate,
        allDay: true,
        extendedProps: {
          description: taskForm.description,
          priority: taskForm.priority,
          status: taskForm.status
        },
        backgroundColor: getPriorityColor(taskForm.priority),
        borderColor: getPriorityColor(taskForm.priority),
        textColor: '#ffffff'
      };
      setEvents([...events, newEvent]);
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'pending' });
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
          backgroundColor: theme.palette.mode === 'dark' ? '#1a237e' : '#e3f2fd',
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
        }
      }}
    >
      <Box sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
        padding: '20px',
        borderRadius: '12px 12px 0 0',
        marginBottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
            padding: '10px 20px'
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
