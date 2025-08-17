import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Chip,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  TextField,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Container,
  Stack,
  useTheme,
  Fade,
  Grow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';
import CelebrationOverlay from '../components/CelebrationOverlay';

const priorities = [
  { value: 'high', color: 'error', label: 'High' },
  { value: 'medium', color: 'warning', label: 'Medium' },
  { value: 'low', color: 'success', label: 'Low' },
];

const statuses = [
  { value: 'pending', color: 'default', label: 'Pending' },
  { value: 'in-progress', color: 'warning', label: 'In Progress' },
  { value: 'completed', color: 'success', label: 'Completed' },
];

const groupTasks = (tasks) => {
  const today = dayjs().startOf('day');
  const todayTasks = [];
  const upcomingTasks = [];
  const completedTasks = [];
  tasks.forEach(task => {
    if (task.status === 'completed') {
      completedTasks.push(task);
    } else if (task.due_date && dayjs(task.due_date).isSame(today, 'day')) {
      todayTasks.push(task);
    } else if (task.due_date && dayjs(task.due_date).isAfter(today, 'day')) {
      upcomingTasks.push(task);
    } else {
      // No due date, treat as today
      todayTasks.push(task);
    }
  });
  return { todayTasks, upcomingTasks, completedTasks };
};



const MyTasks = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentFilter = params.get('filter');

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    clearError
  } = useTasks();

  // Theme must be used before any early returns to comply with React hooks rules
  const theme = useTheme();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    taskId: null,
    taskTitle: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [addTaskTitle, setAddTaskTitle] = useState('');
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const handleAddTask = () => {
    // If there's text in the input, use it as the title
    if (addTaskTitle.trim()) {
      setEditingTask({ title: addTaskTitle });
    } else {
      setEditingTask(null);
    }
    setFormOpen(true);
  };

  const handleQuickAdd = () => {
    if (addTaskTitle.trim()) {
      const taskData = {
        title: addTaskTitle.trim(),
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: null,
        due_time: null
      };

      createTask(taskData)
        .then(() => {
          setSnackbar({ open: true, message: 'Task added successfully!', severity: 'success' });
          setAddTaskTitle('');
        })
        .catch((error) => {
          setSnackbar({ open: true, message: error.message, severity: 'error' });
        });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (taskData) => {
    try {
      const isCompleting = editingTask
        ? (editingTask.status !== 'completed' && taskData.status === 'completed')
        : (taskData.status === 'completed');
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
      } else {
        await createTask(taskData);
        setSnackbar({ open: true, message: 'Task created successfully!', severity: 'success' });
      }
      if (isCompleting) {
        setCelebrationOpen(true);
      }
      setAddTaskTitle('');
      setFormOpen(false); // Close the modal after successful submission
      setEditingTask(null); // Reset editing state
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleDeleteTask = (task) => {
    setDeleteConfirm({
      open: true,
      taskId: task.id,
      taskTitle: task.title
    });
  };

  const confirmDeleteTask = () => {
    if (deleteConfirm.taskId) {
      deleteTask(deleteConfirm.taskId);
      setSnackbar({
        open: true,
        message: `Task "${deleteConfirm.taskTitle}" has been deleted.`,
        severity: 'info'
      });
    }
    setDeleteConfirm({ open: false, taskId: null, taskTitle: null });
  };

  const cancelDeleteTask = () => {
    setDeleteConfirm({ open: false, taskId: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Toggle task completion status via the check icon
  const handleToggleComplete = async (task) => {
    const isCompleting = task.status !== 'completed';
    const newStatus = isCompleting ? 'completed' : 'pending';
    try {
      await updateTask(task.id, { status: newStatus });
      setSnackbar({
        open: true,
        message: isCompleting ? 'Task marked as completed' : 'Task marked as pending',
        severity: 'success'
      });
      if (isCompleting) {
        setCelebrationOpen(true);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to update task', severity: 'error' });
    }
  };

  const { todayTasks, upcomingTasks, completedTasks } = groupTasks(tasks);

  // Filter tasks based on current filter
  const getFilteredTasks = () => {
    switch (currentFilter) {
      case 'today':
        return { todayTasks, upcomingTasks: [], completedTasks: [] };
      case 'upcoming':
        return { todayTasks: [], upcomingTasks, completedTasks: [] };
      case 'completed':
        return { todayTasks: [], upcomingTasks: [], completedTasks };
      default:
        return { todayTasks, upcomingTasks, completedTasks };
    }
  };

  const filteredTasks = getFilteredTasks();
  const displayTitle = currentFilter ?
    (currentFilter === 'today' ? "Today's Tasks" :
      currentFilter === 'upcoming' ? 'Upcoming Tasks' :
        currentFilter === 'completed' ? 'Completed Tasks' : 'My Tasks') : 'My Tasks';

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // moved above

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.palette.mode === 'dark' ? '#0f1218' : '#f3f6fb',
      backgroundImage: theme.palette.mode === 'dark'
        ? 'radial-gradient(1200px 400px at 20% -20%, rgba(30, 144, 255, 0.08), transparent), radial-gradient(900px 300px at 110% 10%, rgba(156, 39, 176, 0.08), transparent)'
        : 'radial-gradient(1200px 400px at 20% -20%, rgba(25, 118, 210, 0.06), transparent), radial-gradient(900px 300px at 110% 10%, rgba(156, 39, 176, 0.04), transparent)',
      py: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Modern Header */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(25, 118, 210, 0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
              ✅ {displayTitle}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              {tasks.length === 0 ? '🚀 Ready to get productive? Add your first task!' :
                `📊 ${tasks.filter(t => t.status === 'completed').length} of ${tasks.length} tasks completed`}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={`Total: ${tasks.length}`}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 600
                }}
              />
              <Chip
                label={`Today: ${filteredTasks.todayTasks.length}`}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 600
                }}
              />
              <Chip
                label={`Completed: ${filteredTasks.completedTasks.length}`}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 600
                }}
              />
            </Stack>
          </Box>
        </Card>
        {/* Enhanced Add Task Section */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'dark' ? '0 12px 40px rgba(0,0,0,0.3)' : '0 12px 40px rgba(25, 118, 210, 0.15)',
            }
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            ⚡ Quick Add Task
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              value={addTaskTitle}
              onChange={e => setAddTaskTitle(e.target.value)}
              onClick={() => setFormOpen(true)}
              placeholder="What needs to be done? ✨"
              fullWidth
              onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
              sx={{
                cursor: 'pointer',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafbfc',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f6f7',
                  },
                  '&.Mui-focused': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                  }
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addTaskTitle.trim() ? handleQuickAdd : handleAddTask}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                width: { xs: '100%', sm: 'auto' },
                background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                  background: 'linear-gradient(135deg, #1565c0 0%, #6a1b9a 100%)',
                }
              }}
            >
              Add Task
            </Button>
          </Box>
        </Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tasks.length === 0 && (
              <Fade in={true}>
                <Card
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                    boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.08)',
                  }}
                >
                  <Box sx={{ mb: 3, fontSize: '4rem' }}>🎯</Box>
                  <Typography variant="h5" fontWeight={700} mb={2} color="primary">
                    Ready to Get Started?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    You haven't created any tasks yet. Add your first task above to begin your productivity journey!
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setFormOpen(true)}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                      }
                    }}
                  >
                    ✨ Create Your First Task
                  </Button>
                </Card>
              </Fade>
            )}

            {/* Today's Tasks */}
            {filteredTasks.todayTasks.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📅 Today's Tasks
                  <Chip
                    label={filteredTasks.todayTasks.length}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                </Typography>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                    boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {filteredTasks.todayTasks.map(task => (
                      <React.Fragment key={task.id}>
                        <ListItem
                          alignItems="flex-start"
                          secondaryAction={
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                              <IconButton edge="end" aria-label="edit" onClick={() => handleEditTask(task)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeleteTask(task)}
                                sx={task.status === 'completed' ? { opacity: 0.7 } : {}}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <IconButton aria-label={task.status === 'completed' ? 'mark as pending' : 'mark as completed'} onClick={() => handleToggleComplete(task)} sx={{ mr: 1.5, mt: 0.5 }}>
                            <CheckCircleIcon sx={{ color: task.status === 'completed' ? 'success.main' : 'grey.400' }} />
                          </IconButton>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" fontWeight={500} sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                  {task.title}
                                </Typography>
                                {task.priority && (
                                  <Chip
                                    label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    color={priorities.find(p => p.value === task.priority)?.color || 'default'}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                                {task.status && (
                                  <Chip
                                    label={statuses.find(s => s.value === task.status)?.label || task.status}
                                    color={statuses.find(s => s.value === task.status)?.color || 'default'}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <>
                                {task.description && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {task.due_date ? `Due: ${dayjs(task.due_date).format('MMM DD, YYYY')}` : ''}
                                </Typography>
                                {/* Mobile actions */}
                                <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 1 }}>
                                  <IconButton size="small" aria-label="edit" onClick={() => handleEditTask(task)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    aria-label="delete"
                                    onClick={() => handleDeleteTask(task)}
                                    sx={task.status === 'completed' ? { opacity: 0.7 } : {}}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              </Box>
            )}

            {/* Upcoming Tasks */}
            {filteredTasks.upcomingTasks.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                  ⏰ Upcoming Tasks ({filteredTasks.upcomingTasks.length})
                </Typography>
                <List sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 0, mb: 2 }}>
                  {filteredTasks.upcomingTasks.map(task => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleEditTask(task)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteTask(task)}
                              sx={task.status === 'completed' ? { opacity: 0.7 } : {}}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <IconButton aria-label={task.status === 'completed' ? 'mark as pending' : 'mark as completed'} onClick={() => handleToggleComplete(task)} sx={{ mr: 1.5, mt: 0.5 }}>
                          <CheckCircleIcon sx={{ color: task.status === 'completed' ? 'success.main' : 'grey.400' }} />
                        </IconButton>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={500} sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                {task.title}
                              </Typography>
                              {task.priority && (
                                <Chip
                                  label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  color={priorities.find(p => p.value === task.priority)?.color || 'default'}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {task.status && (
                                <Chip
                                  label={statuses.find(s => s.value === task.status)?.label || task.status}
                                  color={statuses.find(s => s.value === task.status)?.color || 'default'}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              {task.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {task.due_date ? `Due: ${dayjs(task.due_date).format('MMM DD, YYYY')}` : ''}
                              </Typography>
                              {/* Mobile actions */}
                              <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 1 }}>
                                <IconButton size="small" aria-label="edit" onClick={() => handleEditTask(task)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  aria-label="delete"
                                  onClick={() => handleDeleteTask(task)}
                                  sx={task.status === 'completed' ? { opacity: 0.7 } : {}}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Completed Tasks */}
            {filteredTasks.completedTasks.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                  ✅ Completed Tasks ({filteredTasks.completedTasks.length})
                </Typography>
                <List sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 0, mb: 2 }}>
                  {filteredTasks.completedTasks.map(task => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                            {/* Edit disabled for completed tasks */}
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteTask(task)}
                              sx={task.status === 'completed' ? { opacity: 0.7 } : {}}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <IconButton aria-label={task.status === 'completed' ? 'mark as pending' : 'mark as completed'} onClick={() => handleToggleComplete(task)} sx={{ mr: 1.5, mt: 0.5 }}>
                          <CheckCircleIcon sx={{ color: task.status === 'completed' ? 'success.main' : 'grey.400' }} />
                        </IconButton>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={500} sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                {task.title}
                              </Typography>
                              {task.priority && (
                                <Chip
                                  label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  color={priorities.find(p => p.value === task.priority)?.color || 'default'}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {task.status && (
                                <Chip
                                  label={statuses.find(s => s.value === task.status)?.label || task.status}
                                  color={statuses.find(s => s.value === task.status)?.color || 'default'}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              {task.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {task.due_date ? `Due: ${dayjs(task.due_date).format('MMM DD, YYYY')}` : ''}
                              </Typography>
                              {/* Mobile actions */}
                              <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, mt: 1 }}>
                                {/* Edit disabled for completed tasks (mobile) */}
                                <IconButton
                                  size="small"
                                  aria-label="delete"
                                  onClick={() => handleDeleteTask(task)}
                                  sx={task.status === 'completed' ? { opacity: 0.7 } : {}}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
        {/* Edit Task Dialog */}
        {formOpen && (
          <TaskForm
            open={formOpen}
            onClose={() => { setFormOpen(false); setEditingTask(null); }}
            onSubmit={handleFormSubmit}
            initialData={editingTask}
            mode={editingTask ? 'edit' : 'add'}
          />
        )}
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirm.open}
          onClose={cancelDeleteTask}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
            Delete Task
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DeleteIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight={500}>
                  Delete "{deleteConfirm.taskTitle}"?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This action cannot be undone. The task will be permanently deleted.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={cancelDeleteTask}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTask}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete Task
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
        <CelebrationOverlay
          open={celebrationOpen}
          onClose={() => setCelebrationOpen(false)}
          headline="Well done!"
          subcopy="Task completed"
          duration={1500}
        />
      </Container>
    </Box>
  );
};

export default MyTasks; 