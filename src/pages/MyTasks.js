import React, { useState } from 'react';
import { Box, Chip, TextField, MenuItem } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

const initialTasks = [
  { id: 1, title: 'Design UI', priority: 'High', dueDate: '2024-06-10', status: 'Pending' },
  { id: 2, title: 'Write API', priority: 'Medium', dueDate: '2024-06-12', status: 'In Progress' },
  { id: 3, title: 'Test App', priority: 'Low', dueDate: '2024-06-15', status: 'Completed' },
];

const priorities = [
  { value: 'High', color: 'error' },
  { value: 'Medium', color: 'warning' },
  { value: 'Low', color: 'success' },
];

const statuses = ['Pending', 'In Progress', 'Completed'];

const MyTasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState({});

  const handleEditClick = (id) => {
    setEditId(id);
    setEditRow(tasks.find(t => t.id === id));
  };

  const handleCancelClick = () => {
    setEditId(null);
    setEditRow({});
  };

  const handleSaveClick = () => {
    setTasks(tasks.map(t => (t.id === editId ? { ...editRow, id: editId } : t)));
    setEditId(null);
    setEditRow({});
  };

  const handleDeleteClick = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (editId === id) handleCancelClick();
  };

  const handleEditChange = (field, value) => {
    setEditRow(prev => ({ ...prev, [field]: value }));
  };

  const columns = [
    { field: 'title', headerName: 'Task Title', flex: 1, minWidth: 150, renderCell: (params) =>
      editId === params.row.id ? (
        <TextField size="small" value={editRow.title || ''} onChange={e => handleEditChange('title', e.target.value)} />
      ) : (
        params.value
      )
    },
    { field: 'priority', headerName: 'Priority', width: 120, renderCell: (params) =>
      editId === params.row.id ? (
        <TextField
          select
          size="small"
          value={editRow.priority || ''}
          onChange={e => handleEditChange('priority', e.target.value)}
        >
          {priorities.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.value}</MenuItem>)}
        </TextField>
      ) : (
        <Chip label={params.value} color={priorities.find(p => p.value === params.value)?.color} size="small" />
      )
    },
    { field: 'dueDate', headerName: 'Due Date', width: 130, renderCell: (params) =>
      editId === params.row.id ? (
        <TextField
          type="date"
          size="small"
          value={editRow.dueDate || ''}
          onChange={e => handleEditChange('dueDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      ) : (
        dayjs(params.value).format('YYYY-MM-DD')
      )
    },
    { field: 'status', headerName: 'Status', width: 130, renderCell: (params) =>
      editId === params.row.id ? (
        <TextField
          select
          size="small"
          value={editRow.status || ''}
          onChange={e => handleEditChange('status', e.target.value)}
        >
          {statuses.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
      ) : (
        <Chip label={params.value} color={params.value === 'Completed' ? 'success' : params.value === 'In Progress' ? 'warning' : 'default'} size="small" />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) =>
        editId === params.row.id ? [
          <GridActionsCellItem icon={<SaveIcon />} label="Save" onClick={handleSaveClick} />,
          <GridActionsCellItem icon={<CancelIcon />} label="Cancel" onClick={handleCancelClick} />,
        ] : [
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEditClick(params.row.id)} />,
          <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleDeleteClick(params.row.id)} />,
        ]
    }
  ];

  return (
    <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 2 }}>
      <DataGrid
        rows={tasks}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        autoHeight
      />
    </Box>
  );
};

export default MyTasks; 