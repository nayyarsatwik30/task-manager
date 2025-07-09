import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Button, Divider, TextField, IconButton, Paper, LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import { deepPurple } from '@mui/material/colors';

// Dummy user data (replace with real data from backend or context)
const initialUser = {
  avatar: '',
  fullName: 'Satwik Kumar',
  username: 'satwik',
  email: 'satwik@gmail.com',
  phone: '+91 9876543210',
  role: 'Member',
  totalTasksCompleted: 42,
  lastLogin: '2024-07-09T10:00:00Z',
  joined: '2023-01-15T09:00:00Z',
};

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const Profile = () => {
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [avatarEdit, setAvatarEdit] = useState(false);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setEditData({ fullName: user.fullName, email: user.email, phone: user.phone });
  };
  const handleSave = () => {
    setUser(prev => ({ ...prev, ...editData }));
    setEditMode(false);
  };
  const handleEditChange = (field) => (e) => setEditData(prev => ({ ...prev, [field]: e.target.value }));

  // Password change logic (dummy)
  const passwordStrength = getPasswordStrength(passwords.new);
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const passwordStrengthColors = ['error', 'warning', 'info', 'success', 'success'];

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        My Profile
      </Typography>
      <Grid container spacing={3}>
        {/* User Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 96, height: 96, bgcolor: deepPurple[500], fontSize: 40 }}
                alt={user.fullName}
              >
                {user.fullName[0]}
              </Avatar>
              <IconButton
                size="small"
                sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}
                onClick={() => setAvatarEdit(true)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h6" fontWeight={600}>{user.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">@{user.username}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{user.email}</Typography>
            <Typography variant="body2" color="text.secondary">{user.phone}</Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 600 }}>{user.role}</Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle2" color="text.secondary">Stats</Typography>
            <Typography variant="body2">Tasks Completed: <b>{user.totalTasksCompleted}</b></Typography>
            <Typography variant="body2">Last Login: {new Date(user.lastLogin).toLocaleString()}</Typography>
            <Typography variant="body2">Joined: {new Date(user.joined).toLocaleDateString()}</Typography>
          </Card>
        </Grid>
        {/* Edit Profile & Change Password */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>Edit Profile</Typography>
              {!editMode ? (
                <Button startIcon={<EditIcon />} onClick={handleEdit} variant="outlined">Edit</Button>
              ) : (
                <>
                  <Button startIcon={<SaveIcon />} onClick={handleSave} variant="contained" sx={{ mr: 1 }}>Save</Button>
                  <Button startIcon={<CancelIcon />} onClick={handleCancel} variant="outlined" color="error">Cancel</Button>
                </>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  value={editData.fullName}
                  onChange={handleEditChange('fullName')}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={editData.email}
                  onChange={handleEditChange('email')}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  value={editData.phone}
                  onChange={handleEditChange('phone')}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>Change Password</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Old Password"
                  type="password"
                  value={passwords.old}
                  onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="New Password"
                  type="password"
                  value={passwords.new}
                  onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                  fullWidth
                  helperText={passwords.new && `Strength: ${passwordStrengthLabels[passwordStrength]}`}
                />
                {passwords.new && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, passwordStrength * 25)}
                    color={passwordStrengthColors[passwordStrength]}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">Change Password</Button>
              <Button variant="outlined" color="secondary">Cancel</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 