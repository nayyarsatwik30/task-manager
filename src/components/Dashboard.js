// src/components/Dashboard.js - Dashboard page with analytics cards and charts
import React, { useState, useEffect } from 'react';
import { Grid, Card, Typography, Box, LinearProgress, Chip, Avatar, Container, CircularProgress } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../hooks/useTasks';
import dayjs from 'dayjs';

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

const Dashboard = () => {
  const { tasks, loading } = useTasks();
  const [analytics, setAnalytics] = useState([]);

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
      py: 2
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
        
        {/* Analytics Cards */}
        <Grid container spacing={3} sx={{ mb: 4, width: '100%', justifyContent: 'center' }}>
          {analytics.map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={item.label} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card 
                elevation={3} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  width: '100%',
                  maxWidth: 300,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}
              >
                <Avatar sx={{ bgcolor: item.color, mr: 3, width: 56, height: 56 }}>{item.icon}</Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{item.label}</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">{item.value}</Typography>
                  {item.progress !== undefined && (
                    <Box mt={2}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {item.progress}% completed
                      </Typography>
                    </Box>
                  )}
                  {item.label === 'Pending Tasks' && (
                    <Chip 
                      label="In Progress" 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 2, fontWeight: 600 }} 
                    />
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ width: '100%', justifyContent: 'center' }}>
          <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                maxWidth: 400,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
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
                  <RechartTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#1976d2" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: '#1976d2' }}
                    activeDot={{ r: 8, stroke: '#1976d2', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                maxWidth: 400,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
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
                    outerRadius={80} 
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={12} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                maxWidth: 400,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
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
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                  />
                  <RechartTooltip />
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