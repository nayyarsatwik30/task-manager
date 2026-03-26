import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTasks } from '../hooks/useTasks';

const Settings = ({ handleLogout }) => {
  // Tasks for CSV export
  const { tasks } = useTasks();
  // State for toggles and dialogs
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');
  const [reminders, setReminders] = useState(true);
  const [assignments, setAssignments] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem('emailNotifications');
    return saved === null ? true : saved === 'true';
  });
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState('30');
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [clearDialog, setClearDialog] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  // Basic translations for a few labels (en, es, de)
  const i18n = useMemo(() => ({
    en: {
      settings: 'Settings',
      general: 'General Preferences',
      language: 'Language',
      notifications: 'Notifications',
      privacy: 'Privacy & Security',
      data: 'Data Management',
      downloadCsv: 'Download Task Data (CSV)',
      clearAll: 'Clear All Tasks',
      reminderTime: 'Reminder Time (minutes before due)',
      account: 'Account Actions',
    },
    es: {
      settings: 'Configuración',
      general: 'Preferencias generales',
      language: 'Idioma',
      notifications: 'Notificaciones',
      privacy: 'Privacidad y seguridad',
      data: 'Gestión de datos',
      downloadCsv: 'Descargar tareas (CSV)',
      clearAll: 'Borrar todas las tareas',
      reminderTime: 'Tiempo de recordatorio (minutos antes)',
      account: 'Acciones de la cuenta',
    },
    de: {
      settings: 'Einstellungen',
      general: 'Allgemeine Einstellungen',
      language: 'Sprache',
      notifications: 'Benachrichtigungen',
      privacy: 'Datenschutz & Sicherheit',
      data: 'Datenverwaltung',
      downloadCsv: 'Aufgaben herunterladen (CSV)',
      clearAll: 'Alle Aufgaben löschen',
      reminderTime: 'Erinnerungszeit (Minuten vor Fälligkeit)',
      account: 'Kontohandlungen',
    }
  }), []);

  // Persist language + set document lang
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { language } }));
  }, [language]);

  // Load user preferences from API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        const response = await fetch(`https://task-manager-back-emez.onrender.com/api/preferences/${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.preferences) {
            setEmailNotifications(data.preferences.emailNotifications);
            setReminderNotifications(data.preferences.reminderNotifications);
            setReminderTime(data.preferences.reminderTime.toString());
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Helper: convert tasks to CSV
  const toCsv = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return 'id,title,description,status,priority,dueDate,createdAt,updatedAt\n';
    const header = ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt'];
    const escape = (val) => {
      if (val === undefined || val === null) return '';
      const s = String(val).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = rows.map(r => header.map(h => escape(r[h] ?? r[h === 'id' ? '_id' : h])).join(','));
    return header.join(',') + '\n' + lines.join('\n');
  };

  const handleDownloadCsv = () => {
    const csv = toCsv(tasks || []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `tasks_export_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        {i18n[language].settings}
      </Typography>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{i18n[language].general}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>{i18n[language].language}</InputLabel>
                <Select value={language} onChange={e => setLanguage(e.target.value)} label={i18n[language].language}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{i18n[language].notifications}</Typography>
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
          <FormControlLabel
            control={<Switch checked={emailNotifications} onChange={async (e) => {
              setEmailNotifications(e.target.checked);
              try {
                const userEmail = localStorage.getItem('userEmail');
                await fetch(`https://task-manager-back-emez.onrender.com/api/preferences/${encodeURIComponent(userEmail)}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ emailNotifications: e.target.checked })
                });
              } catch (error) {
                console.error('Error updating preferences:', error);
              }
            }} />}
            label="Task Creation & Completion Email Notifications"
          />
          <FormControlLabel
            control={<Switch checked={reminderNotifications} onChange={async (e) => {
              setReminderNotifications(e.target.checked);
              try {
                const userEmail = localStorage.getItem('userEmail');
                await fetch(`https://task-manager-back-emez.onrender.com/api/preferences/${encodeURIComponent(userEmail)}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reminderNotifications: e.target.checked })
                });
              } catch (error) {
                console.error('Error updating preferences:', error);
              }
            }} />}
            label="Task Reminder Notifications"
          />
          <FormControl fullWidth sx={{ mt: 2, maxWidth: 300 }}>
            <InputLabel>{i18n[language].reminderTime}</InputLabel>
            <Select
              value={reminderTime}
              onChange={async (e) => {
                setReminderTime(e.target.value);
                try {
                  const userEmail = localStorage.getItem('userEmail');
                  await fetch(`https://task-manager-back-emez.onrender.com/api/preferences/${encodeURIComponent(userEmail)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reminderTime: parseInt(e.target.value) })
                  });
                } catch (error) {
                  console.error('Error updating preferences:', error);
                }
              }}
              label="Reminder Time"
              disabled={!reminderNotifications}
            >
              <MenuItem value="5">5 minutes</MenuItem>
              <MenuItem value="15">15 minutes</MenuItem>
              <MenuItem value="30">30 minutes</MenuItem>
              <MenuItem value="60">1 hour</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{i18n[language].privacy}</Typography>
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
          <Typography variant="h6">{i18n[language].data}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button onClick={handleDownloadCsv} startIcon={<DownloadIcon />} variant="outlined" sx={{ mr: { sm: 2, xs: 0 }, width: { xs: '100%', sm: 'auto' } }}>
              {i18n[language].downloadCsv}
            </Button>
            <Button startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => setClearDialog(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {i18n[language].clearAll}
            </Button>
          </Box>
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
          <Typography variant="h6">{i18n[language].account}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button color="warning" variant="outlined" sx={{ mr: { sm: 2, xs: 0 }, width: { xs: '100%', sm: 'auto' } }} onClick={() => setDeactivateDialog(true)}>
              Deactivate Account
            </Button>
            <Button startIcon={<DeleteIcon />} color="error" variant="contained" onClick={() => setDeleteDialog(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Delete Account
            </Button>
          </Box>
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
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Settings; 