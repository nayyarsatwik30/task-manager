import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Settings = ({ handleLogout }) => {
  // State for toggles and dialogs
  const [language, setLanguage] = useState('en');
  const [reminders, setReminders] = useState(true);
  const [assignments, setAssignments] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [clearDialog, setClearDialog] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        Settings
      </Typography>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">General Preferences</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select value={language} onChange={e => setLanguage(e.target.value)} label="Language">
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Notifications</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={<Switch checked={reminders} onChange={e => setReminders(e.target.checked)} />}
            label="Task Reminders"
          />
          <FormControlLabel
            control={<Switch checked={assignments} onChange={e => setAssignments(e.target.checked)} />}
            label="Task Assignments"
          />
          <FormControlLabel
            control={<Switch checked={weeklySummary} onChange={e => setWeeklySummary(e.target.checked)} />}
            label="Weekly Summary Emails"
          />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Privacy & Security</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={<Switch checked={twoFA} onChange={e => setTwoFA(e.target.checked)} />}
            label="Enable 2FA"
          />
          <FormControlLabel
            control={<Switch checked={loginAlerts} onChange={e => setLoginAlerts(e.target.checked)} />}
            label="Login Alerts"
          />
          <FormControl fullWidth sx={{ mt: 2, maxWidth: 300 }}>
            <InputLabel>Session Timeout (minutes)</InputLabel>
            <Select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} label="Session Timeout">
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={60}>60</MenuItem>
              <MenuItem value={120}>120</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Data Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button startIcon={<DownloadIcon />} variant="outlined" sx={{ mr: 2 }}>
            Download Task Data (CSV)
          </Button>
          <Button startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => setClearDialog(true)}>
            Clear All Tasks
          </Button>
          <Dialog open={clearDialog} onClose={() => setClearDialog(false)}>
            <DialogTitle>Clear All Tasks</DialogTitle>
            <DialogContent>
              <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                This will permanently delete all your tasks. This action cannot be undone.
              </Alert>
              Are you sure you want to clear all tasks?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setClearDialog(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={() => setClearDialog(false)}>Clear All</Button>
            </DialogActions>
          </Dialog>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Account Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button startIcon={<LogoutIcon />} variant="outlined" sx={{ mr: 2 }} onClick={() => setLogoutDialog(true)}>
            Logout
          </Button>
          <Button color="warning" variant="outlined" sx={{ mr: 2 }} onClick={() => setDeactivateDialog(true)}>
            Deactivate Account
          </Button>
          <Button startIcon={<DeleteIcon />} color="error" variant="contained" onClick={() => setDeleteDialog(true)}>
            Delete Account
          </Button>
          {/* Deactivate Dialog */}
          <Dialog open={deactivateDialog} onClose={() => setDeactivateDialog(false)}>
            <DialogTitle>Deactivate Account</DialogTitle>
            <DialogContent>
              <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                Your account will be deactivated. You can reactivate by logging in again.
              </Alert>
              Are you sure you want to deactivate your account?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeactivateDialog(false)}>Cancel</Button>
              <Button color="warning" variant="contained" onClick={() => setDeactivateDialog(false)}>Deactivate</Button>
            </DialogActions>
          </Dialog>
          {/* Delete Dialog */}
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Delete Account Permanently</DialogTitle>
            <DialogContent>
              <Alert severity="error" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                This will permanently delete your account and all data. This action cannot be undone!
              </Alert>
              Are you absolutely sure you want to delete your account?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={() => setDeleteDialog(false)}>Delete Permanently</Button>
            </DialogActions>
          </Dialog>
          {/* Logout Dialog */}
          <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>Are you sure you want to logout?</DialogContent>
            <DialogActions>
              <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={() => { setLogoutDialog(false); handleLogout && handleLogout(); }}>Logout</Button>
            </DialogActions>
          </Dialog>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Settings; 