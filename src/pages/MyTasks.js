import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  Button, 
  Typography, 
  Alert,
  CircularProgress,
  Fab,
  Snackbar
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      setFormOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const columns = [
    { 
      field: 'title', 
      headerName: 'Task Title', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {params.row.description.length > 50 
                ? `${params.row.description.substring(0, 50)}...` 
                : params.row.description
              }
            </Typography>
          )}
        </Box>
      )
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      width: 120, 
      renderCell: (params) => {
        const priority = priorities.find(p => p.value === params.value);
        return (
          <Chip 
            label={priority?.label || params.value} 
            color={priority?.color || 'default'} 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'due_date', 
      headerName: 'Due Date', 
      width: 130, 
      renderCell: (params) => (
        params.value ? dayjs(params.value).format('MMM DD, YYYY') : 'No due date'
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      renderCell: (params) => {
        const status = statuses.find(s => s.value === params.value);
        return (
          <Chip 
            label={status?.label || params.value} 
            color={status?.color || 'default'} 
            size="small"
          />
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem 
          icon={<EditIcon />} 
          label="Edit" 
          onClick={() => handleEditTask(params.row)}
          sx={{ color: 'primary.main' }}
        />,
        <GridActionsCellItem 
          icon={<DeleteIcon />} 
          label="Delete" 
          onClick={() => handleDeleteTask(params.row.id)}
          sx={{ color: 'error.main' }}
        />,
      ]
    }
  ];

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
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={600} color="primary">
          My Tasks ({tasks.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          sx={{ borderRadius: 2 }}
        >
          Add Task
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ 
        height: 600, 
        width: '100%', 
        bgcolor: 'background.paper', 
        borderRadius: 3, 
        boxShadow: 2, 
        p: 2,
        position: 'relative'
      }}>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
            borderRadius: 3
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <DataGrid
          rows={tasks}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        onClick={handleAddTask}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: 4,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        task={editingTask}
        loading={loading}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyTasks; 