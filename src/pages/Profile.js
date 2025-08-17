import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Button, Divider, TextField, IconButton, Paper, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { deepPurple } from '@mui/material/colors';
import axios from 'axios';
import { useTasks } from '../hooks/useTasks';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [avatarEdit, setAvatarEdit] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);
  // Tasks hook for accurate counts
  const { tasks, loading: tasksLoading } = useTasks();

  useEffect(() => {
    // Replace with actual logic to get the logged-in user's email (e.g., from auth context or localStorage)
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    axios.get(`http://localhost:5000/api/auth/me?email=${email}`)
      .then(res => {
        const u = res.data.user;
        const storedAvatar = localStorage.getItem('userAvatar') || '';
        setUser({
          avatar: storedAvatar,
          fullName: u.name,
          username: u.name?.split(' ')[0]?.toLowerCase() || '',
          email: u.email,
          phone: u.phone || '',
          role: 'Member',
          totalTasksCompleted: u.totalTasksCompleted || 0,
          lastLogin: u.lastLogin || '',
          joined: u.created_at,
        });
        setEditData({ fullName: u.name, email: u.email, phone: u.phone || '' });
      })
      .catch(err => console.error(err));
  }, []);

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

  // Avatar upload handlers
  const openAvatarDialog = () => {
    setAvatarPreview('');
    setAvatarError('');
    setAvatarEdit(true);
  };
  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setAvatarError('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleAvatarSave = () => {
    const dataUrl = avatarPreview;
    if (!dataUrl) {
      setAvatarError('Please choose an image first.');
      return;
    }
    // Persist locally; optionally call backend later
    localStorage.setItem('userAvatar', dataUrl);
    setUser(prev => ({ ...prev, avatar: dataUrl }));
    setAvatarEdit(false);
    setSnackbar({ open: true, message: 'Profile photo updated', severity: 'success' });
    // Notify header to refresh avatar
    window.dispatchEvent(new Event('avatar-updated'));
  };
  const handleAvatarRemove = () => {
    localStorage.removeItem('userAvatar');
    setUser(prev => ({ ...prev, avatar: '' }));
    setAvatarPreview('');
    setAvatarError('');
    setAvatarEdit(false);
    setSnackbar({ open: true, message: 'Profile photo removed', severity: 'info' });
    window.dispatchEvent(new Event('avatar-updated'));
  };
  const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  // Password change logic (dummy)
  const passwordStrength = getPasswordStrength(passwords.new);
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const passwordStrengthColors = ['error', 'warning', 'info', 'success', 'success'];

  if (!user) return <div>Loading...</div>;

  // Compute completed tasks from tasks list as the source of truth
  const completedCount = Array.isArray(tasks)
    ? tasks.filter(t => t?.status === 'completed').length
    : (user.totalTasksCompleted || 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonOutlineOutlinedIcon color="primary" />
        <Typography variant="h4" fontWeight={700} color="primary">
          My Profile
        </Typography>
      </Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Manage your personal info, profile photo, and password settings
      </Typography>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {/* User Card */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 4,
              height: '100%',
              bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
              boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.24)' : '0 8px 32px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 112, height: 112, bgcolor: deepPurple[500], fontSize: 44, boxShadow: 3 }}
                alt={user.fullName}
              >
                {user.fullName[0]}
              </Avatar>
              <IconButton
                size="small"
                sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}
                onClick={openAvatarDialog}
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
            <Typography variant="body2">
              Tasks Completed: <b>{tasksLoading ? '...' : completedCount}</b>
            </Typography>
            <Typography variant="body2">Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</Typography>
            <Typography variant="body2">Joined: {user.joined ? new Date(user.joined).toLocaleDateString() : 'N/A'}</Typography>
          </Card>
        </Grid>
        {/* Edit Profile & Change Password */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
              boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.24)' : '0 8px 32px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>Edit Profile</Typography>
              {!editMode ? (
                <Button startIcon={<EditIcon />} onClick={handleEdit} variant="outlined" sx={{ width: { xs: '100%', sm: 'auto' } }}>Edit</Button>
              ) : (
                <>
                  <Button startIcon={<SaveIcon />} onClick={handleSave} variant="contained" sx={{ mr: { sm: 1, xs: 0 }, width: { xs: '100%', sm: 'auto' } }}>Save</Button>
                  <Button startIcon={<CancelIcon />} onClick={handleCancel} variant="outlined" color="error" sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
              border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
              boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.24)' : '0 8px 32px rgba(0,0,0,0.08)'
            }}
          >
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
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>Change Password</Button>
              <Button variant="outlined" color="secondary" sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
            </Box>
          </Paper>

        </Grid>
        </Grid>
      </Box>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarEdit} onClose={() => setAvatarEdit(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
            <Avatar src={avatarPreview || user.avatar} sx={{ width: 144, height: 144 }}>
              {user.fullName?.[0]}
            </Avatar>
            {avatarError && (
              <Typography variant="caption" color="error">{avatarError}</Typography>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={onPickFile}>Choose Photo</Button>
              <Button variant="contained" onClick={handleAvatarSave} disabled={!avatarPreview}>Save</Button>
              {user.avatar && (
                <Button color="error" onClick={handleAvatarRemove}>Remove</Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarEdit(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Profile;