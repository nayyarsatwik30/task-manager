import React, { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';

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

// Helper to group tasks by project and section
const groupTasksByProjectAndSection = (tasks) => {
  const grouped = {};
  tasks.forEach(task => {
    const project = task.project || 'Other';
    const section = task.section || 'General';
    if (!grouped[project]) grouped[project] = {};
    if (!grouped[project][section]) grouped[project][section] = [];
    grouped[project][section].push(task);
  });
  return grouped;
};

const MyTasks = () => {
  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask, 
    clearError 
  } = useTasks();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, taskId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [addTaskTitle, setAddTaskTitle] = useState('');

  const handleAddTask = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
      } else {
        await createTask(taskData);
        setSnackbar({ open: true, message: 'Task created successfully!', severity: 'success' });
      }
      setAddTaskTitle('');
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleDeleteTask = (taskId) => {
    setDeleteConfirm({ open: true, taskId });
  };

  const confirmDeleteTask = () => {
    if (deleteConfirm.taskId) {
      deleteTask(deleteConfirm.taskId);
    }
    setDeleteConfirm({ open: false, taskId: null });
  };

  const cancelDeleteTask = () => {
    setDeleteConfirm({ open: false, taskId: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const groupedTasks = groupTasksByProjectAndSection(tasks);

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
  
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">
        My Tasks
        </Typography>
      <Divider sx={{ mb: 2 }} />
      {/* Inline Add Task */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <TextField
          value={addTaskTitle}
          onChange={e => setAddTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          size="small"
          fullWidth
          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          sx={{ borderRadius: 2, minWidth: 40, px: 2 }}
        >
          Add
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
      ) : (
        <>
          {Object.keys(groupedTasks).length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
              No tasks yet. Add your first task!
            </Typography>
          )}
          {Object.entries(groupedTasks).map(([project, sections]) => (
            <Box key={project} sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 1, mt: 3 }}>
                {project}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(sections).map(([section, sectionTasks]) => (
                <Box key={section} sx={{ mb: 2, ml: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    {section}
                  </Typography>
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 0, mb: 2 }}>
                    {sectionTasks.length === 0 && (
                      <ListItem><ListItemText primary={`No tasks in ${section}`} /></ListItem>
                    )}
                    {sectionTasks.map(task => (
                      <React.Fragment key={task.id}>
                        <ListItem
                          alignItems="flex-start"
                          secondaryAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton edge="end" aria-label="edit" onClick={() => handleEditTask(task)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <CheckCircleIcon sx={{ color: task.status === 'completed' ? 'success.main' : 'grey.400', mr: 2, mt: 0.5 }} />
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
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          ))}
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
      <Dialog open={deleteConfirm.open} onClose={cancelDeleteTask}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this task?</DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteTask}>Cancel</Button>
          <Button onClick={confirmDeleteTask} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default MyTasks; 