// Dashboard page with analytics cards and charts
import React, { useState, useEffect } from 'react';
import { Grid, Card, Typography, Box, LinearProgress, Chip, Avatar, Container, CircularProgress } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../hooks/useTasks';
import dayjs from 'dayjs';
import { Tooltip as MuiTooltip } from '@mui/material';
import { useTheme } from '@mui/material';

const lineData = [
  { day: 'Mon', completed: 2 },
  { day: 'Tue', completed: 4 },
  { day: 'Wed', completed: 3 },
  { day: 'Thu', completed: 5 },
  { day: 'Fri', completed: 6 },
  { day: 'Sat', completed: 4 },
  { day: 'Sun', completed: 4 },
];

const pieData = [
  { name: 'High', value: 10, color: '#e53935' },
  { name: 'Medium', value: 20, color: '#fbc02d' },
  { name: 'Low', value: 12, color: '#43a047' },
];

const barData = [
  { category: 'Work', tasks: 12 },
  { category: 'Personal', tasks: 8 },
  { category: 'Shopping', tasks: 6 },
  { category: 'Others', tasks: 16 },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 2, boxShadow: 2, minWidth: 120 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>{label}</Typography>
        {payload.map((entry, idx) => (
          <Typography key={idx} variant="body2" color="text.secondary">
            {entry.name || entry.dataKey}: <b>{entry.value}</b>
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const Dashboard = () => {
  const { tasks, loading } = useTasks();
  const [analytics, setAnalytics] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (tasks.length > 0) {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      const dueToday = tasks.filter(task => {
        if (!task.due_date) return false;
        return dayjs(task.due_date).isSame(dayjs(), 'day');
      }).length;

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setAnalytics([
        { 
          label: 'Total Tasks', 
          value: totalTasks, 
          icon: <AssignmentTurnedInIcon color="primary" />, 
          color: 'primary.main' 
        },
        { 
          label: 'Tasks Completed', 
          value: completedTasks, 
          icon: <CheckCircleIcon color="success" />, 
          color: 'success.main', 
          progress: completionRate 
        },
        { 
          label: 'Pending Tasks', 
          value: pendingTasks, 
          icon: <PendingActionsIcon color="warning" />, 
          color: 'warning.main' 
        },
        { 
          label: 'Tasks Due Today', 
          value: dueToday, 
          icon: <CalendarTodayIcon color="secondary" />, 
          color: 'secondary.main' 
        },
      ]);
    }
  }, [tasks]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100%',
      py: 2,
      bgcolor: theme => theme.palette.mode === 'dark' ? '#181a20' : '#f4f6fa',
    }}>
      <Container maxWidth="xl" sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <Typography variant="h4" fontWeight={700} mb={4} color="primary" textAlign="center">
          Dashboard Overview
        </Typography>
        {/* Analytics Cards Section */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: { xs: 1, sm: 0 } }}>
          <Box sx={{
            width: '100%',
            maxWidth: 950,
            mb: 4,
            px: { xs: 1.5, sm: 1 }, // add horizontal padding for mobile
            py: { xs: 1, sm: 2 },
            borderRadius: 4,
            boxShadow: 0,
            bgcolor: theme => theme.palette.mode === 'dark' ? '#23272f' : '#fff',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: { xs: 'center', md: 'center' },
            alignItems: { xs: 'center', md: 'stretch' },
            gap: { xs: 2, md: 2 },
            mx: 'auto',
          }}>
            {analytics.map((item, idx) => (
              <Box key={item.label} sx={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Card 
                  elevation={theme.palette.mode === 'dark' ? 5 : 8}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    height: '100%',
                    minHeight: 120,
                    borderRadius: 3,
                    transition: 'transform 0.22s cubic-bezier(.4,2,.6,1), box-shadow 0.22s cubic-bezier(.4,2,.6,1)',
                    width: '100%',
                    maxWidth: 220,
                    boxShadow: theme.palette.mode === 'dark' ? 2 : 6,
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
                    border: theme.palette.mode === 'dark' ? 'none' : '1px solid #e0e0e0',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.025)',
                      boxShadow: theme.palette.mode === 'dark' ? 7 : 12,
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#23272f' : '#fafbfc',
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: item.color, mb: 1, width: 40, height: 40, boxShadow: 1 }}>{item.icon}</Avatar>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom align="center" sx={{ fontSize: 13 }}>{item.label}</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary" align="center" sx={{ mb: 0.5 }}>{item.value}</Typography>
                  {item.progress !== undefined && (
                    <Box mt={0.5} sx={{ width: '100%' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 4,
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center', fontSize: 11 }}>
                        {item.progress}% completed
                      </Typography>
                    </Box>
                  )}
                  {item.label === 'Pending Tasks' && (
                    <Chip 
                      label="In Progress" 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1, fontWeight: 600, fontSize: 11 }} 
                    />
                  )}
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
        {/* Charts Section */}
        <Grid container spacing={3} sx={{ width: '100%', justifyContent: 'center' }}>
          <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              elevation={4} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 4,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                maxWidth: 420,
                bgcolor: 'background.paper',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: 8,
                  bgcolor: theme.palette.mode === 'dark' ? '#23272f' : 'grey.50',
                }
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                Task Completion (7 days)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#1976d2" 
                    strokeWidth={3} 
                    dot={{ r: 7, fill: '#1976d2', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 10, stroke: '#1976d2', strokeWidth: 3, fill: '#fff' }}
                  />
                  <RechartTooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              elevation={4} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 4,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                maxWidth: 420,
                bgcolor: 'background.paper',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: 8,
                  bgcolor: theme.palette.mode === 'dark' ? '#23272f' : 'grey.50',
                }
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                Tasks by Priority
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={90} 
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={12} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              elevation={4} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 4,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                maxWidth: 420,
                bgcolor: 'background.paper',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: 8,
                  bgcolor: theme.palette.mode === 'dark' ? '#23272f' : 'grey.50',
                }
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                Tasks by Category
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="category" />
                  <YAxis allowDecimals={false} />
                  <Bar 
                    dataKey="tasks" 
                    fill="#9c27b0" 
                    radius={[12, 12, 0, 0]}
                    barSize={44}
                  />
                  <RechartTooltip content={<CustomTooltip />} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 