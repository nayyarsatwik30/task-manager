// Dashboard page with analytics cards and charts
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, Typography, Box, LinearProgress, Chip, Avatar, Container, CircularProgress, Button, Stack, Divider, useMediaQuery, IconButton, Tabs, Tab } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../hooks/useTasks';
import dayjs from 'dayjs';
import { Tooltip as MuiTooltip } from '@mui/material';
import { useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Progress Ring Component
const ProgressRing = ({ value, max, size = 80, strokeWidth = 6, color = '#1976d2' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? (value / max) * 100 : 0;
  const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 0.8s ease-in-out',
          }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          of {max}
        </Typography>
      </Box>
    </Box>
  );
};

// Helper functions for time-based greetings and motivational messages
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

const getMotivationalMessage = (tasks) => {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  if (completionRate >= 80) {
    return "🎉 Incredible work! You're absolutely crushing your goals today!";
  } else if (completionRate >= 60) {
    return "🚀 Great progress! You're well on your way to an amazing day!";
  } else if (completionRate >= 40) {
    return "💪 Keep going! Every completed task brings you closer to success!";
  } else if (completionRate >= 20) {
    return "🌟 You've got this! Small steps lead to big achievements!";
  } else if (totalTasks > 0) {
    return "✨ Fresh start! Today is full of possibilities - let's make it count!";
  } else {
    return "🎯 Ready to conquer the day? Add some tasks and let's get started!";
  }
};

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
  const { tasks, loading, error } = useTasks();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [analytics, setAnalytics] = useState([]);
  const [chartData, setChartData] = useState({
    lineData: [],
    pieData: [],
    barData: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const refreshTimeoutRef = useRef(null);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const lastCelebratedRef = useRef(null);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    // Trigger re-fetch of tasks (this would normally call your API)
    window.location.reload();
  };

  // Initialize greetings and motivational messages
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setMotivationalMessage(getMotivationalMessage(tasks));
  }, [tasks]);

  // Compute streaks from tasks (client-side)
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setStreak({ current: 0, best: 0 });
      return;
    }

    // Collect unique completion dates (local) using updated_at when status is completed
    const completedDates = new Set();
    tasks.forEach(t => {
      if (t.status === 'completed' && t.updated_at) {
        const d = dayjs(t.updated_at).format('YYYY-MM-DD');
        completedDates.add(d);
      }
    });

    if (completedDates.size === 0) {
      setStreak({ current: 0, best: 0 });
      return;
    }

    // Helper to check if a date string exists in the set
    const has = (d) => completedDates.has(dayjs(d).format('YYYY-MM-DD'));

    // Current streak: count back from today
    let cur = 0;
    let cursor = dayjs();
    while (has(cursor)) {
      cur += 1;
      cursor = cursor.subtract(1, 'day');
    }

    // Best streak: scan through sorted dates and count consecutive runs
    const sorted = Array.from(completedDates).sort(); // asc YYYY-MM-DD
    let best = 1;
    let run = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = dayjs(sorted[i - 1]);
      const curr = dayjs(sorted[i]);
      if (curr.diff(prev, 'day') === 1) {
        run += 1;
      } else {
        best = Math.max(best, run);
        run = 1;
      }
    }
    best = Math.max(best, run);

    setStreak({ current: cur, best });

    // Confetti on milestones (client-side persisted)
    try {
      const key = 'lastCelebratedStreak';
      const lastCelebrated = parseInt(localStorage.getItem(key) || '0', 10);
      lastCelebratedRef.current = lastCelebrated;
      const milestones = [1, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200];
      const isMilestone = milestones.includes(cur);
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isMilestone && cur > lastCelebrated && !prefersReducedMotion) {
        // Lazy-load confetti (works only if dependency exists, otherwise no-op)
        import('canvas-confetti')
          .then((mod) => {
            const confetti = mod.default || mod;
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.2 },
            });
            // Update after a short delay to avoid double-fire on strict mode
            setTimeout(() => localStorage.setItem(key, String(cur)), 300);
          })
          .catch(() => {
            // If library not installed, silently ignore
            localStorage.setItem(key, String(cur));
          });
      }
    } catch (_) {
      // Ignore storage access errors
    }
  }, [tasks]);

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

      // Calculate priority distribution for pie chart
      const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
      const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
      const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

      // Calculate task completion over last 7 days
      const last7Days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        const dayTasks = tasks.filter(task =>
          task.status === 'completed' &&
          task.updated_at &&
          dayjs(task.updated_at).isSame(date, 'day')
        ).length;

        last7Days.push({
          day: dayNames[date.day()],
          completed: dayTasks
        });
      }

      // Calculate status distribution for bar chart
      const statusData = [
        { category: 'Pending', tasks: pendingTasks },
        { category: 'In Progress', tasks: inProgressTasks },
        { category: 'Completed', tasks: completedTasks },
        { category: 'Due Today', tasks: dueToday }
      ];

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

      // Set real chart data
      setChartData({
        lineData: last7Days,
        pieData: [
          { name: 'High', value: highPriorityTasks, color: '#e53935' },
          { name: 'Medium', value: mediumPriorityTasks, color: '#fbc02d' },
          { name: 'Low', value: lowPriorityTasks, color: '#43a047' }
        ].filter(item => item.value > 0), // Only show priorities that have tasks
        barData: statusData.filter(item => item.tasks > 0) // Only show statuses that have tasks
      });
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
      alignItems: 'flex-start',
      minHeight: '100vh',
      height: '100%',
      p: 0,
      m: 0,
      overflowX: 'hidden',
      bgcolor: theme => theme.palette.mode === 'dark' ? '#0f1218' : '#f3f6fb',
      backgroundImage: theme => theme.palette.mode === 'dark'
        ? 'radial-gradient(1200px 400px at 20% -20%, rgba(30, 144, 255, 0.12), transparent), radial-gradient(900px 300px at 110% 10%, rgba(156, 39, 176, 0.12), transparent)'
        : 'radial-gradient(1200px 400px at 20% -20%, rgba(25, 118, 210, 0.10), transparent), radial-gradient(900px 300px at 110% 10%, rgba(156, 39, 176, 0.08), transparent)'
    }}>
      <Container maxWidth={false} disableGutters sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%'
      }}>
        {/* Hero Header */}
        <Box sx={{
          width: '100%',
          borderRadius: 0,
          mt: 0,
          mb: 3,
          p: { xs: 3, md: 4 },
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
          boxShadow: theme => theme.palette.mode === 'dark' ? 8 : 6,
        }}>
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 20% 10%, #fff 0, transparent 40%), radial-gradient(circle at 80% 30%, #fff 0, transparent 30%)' }} />
          {/* Pull to refresh indicator */}
          {isMobile && (
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: isRefreshing ? 'block' : 'none'
            }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  color: '#1976d2',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                }}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Pull to Refresh'}
              </Button>
            </Box>
          )}
          
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} justifyContent="space-between" sx={{ position: 'relative' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 0.2 }}>
                {greeting} 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5, mb: 1 }}>
                {motivationalMessage}
              </Typography>
              <Stack direction="row" spacing={1.2} mt={2}>
                <Chip color="default" label={`Today: ${dayjs().format('ddd, MMM D')}`} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }} />
                <Chip color="default" label={`Tasks: ${tasks.length}`} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }} />
                <MuiTooltip title={`Best: ${streak.best} day${streak.best === 1 ? '' : 's'}`} placement="bottom">
                  <Chip
                    icon={<WhatshotIcon sx={{ color: 'inherit' }} />}
                    color="default"
                    label={`Streak: ${streak.current} day${streak.current === 1 ? '' : 's'}`}
                    sx={{
                      color: 'white',
                      bgcolor: streak.current > 0 ? 'rgba(255,128,64,0.35)' : 'rgba(255,255,255,0.18)',
                      border: '1px solid rgba(255,255,255,0.25)'
                    }}
                  />
                </MuiTooltip>
              </Stack>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={{ xs: 2, md: 0 }}>
              <Button variant="contained" color="secondary" startIcon={<AddCircleOutlineIcon />} onClick={() => navigate('/tasks')} sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                New Task
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<CalendarMonthIcon />} onClick={() => navigate('/calendar')} sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.55)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.10)' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                Open Calendar
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card elevation={0} sx={{
            width: '100%',
            maxWidth: 900,
            py: 6,
            px: 3,
            mb: 4,
            textAlign: 'center',
            borderRadius: 4,
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e6e8ef',
            bgcolor: theme => theme.palette.mode === 'dark' ? '#151922' : '#ffffff',
            backdropFilter: 'saturate(140%) blur(6px)'
          }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.light' }}>
              <AssignmentTurnedInIcon />
            </Avatar>
            <Typography variant="h5" fontWeight={700} gutterBottom>Get started by creating your first task</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
              Plan your day, set priorities, and track progress visually. Your insights will appear here as you add tasks.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} href="/tasks" sx={{ width: { xs: '100%', sm: 'auto' } }}>Create Task</Button>
              <Button variant="outlined" startIcon={<CalendarMonthIcon />} href="/calendar" sx={{ width: { xs: '100%', sm: 'auto' } }}>Open Calendar</Button>
            </Stack>
          </Card>
        )}
        {/* Analytics Cards Section */}
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'stretch' },
          gap: { xs: 2, md: 2 },
          mb: 4,
          px: { xs: 1.5, sm: 2, md: 3 }
        }}>
          {analytics.map((item, idx) => (
            <Box key={item.label} sx={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Card
                  elevation={theme.palette.mode === 'dark' ? 0 : 0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    height: '100%',
                    minHeight: 120,
                    borderRadius: 1,
                    transition: 'transform 0.22s cubic-bezier(.4,2,.6,1), box-shadow 0.22s cubic-bezier(.4,2,.6,1), background-color 0.2s ease',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 220 },
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 4px 18px rgba(0,0,0,0.08)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.025)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.45)' : '0 14px 30px rgba(37, 99, 235, 0.18)',
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fafbfc',
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: item.color, mb: 1, width: 40, height: 40, boxShadow: 1 }}>{item.icon}</Avatar>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom align="center" sx={{ fontSize: 13 }}>{item.label}</Typography>
                  <Box sx={{ mb: 1 }}>
                    <ProgressRing 
                      value={item.value} 
                      max={item.max || Math.max(item.value * 1.5, 10)} 
                      size={70} 
                      strokeWidth={5}
                      color={item.color}
                    />
                  </Box>
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
        {/* Charts Section */}
        {isMobile ? (
          <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', mb: 4 }}>
            <Typography variant="h5" fontWeight={600} mb={2} textAlign="center" color="primary">
              Analytics Charts
            </Typography>
            
            {/* Mobile Chart Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <IconButton 
                onClick={() => setCurrentChartIndex(prev => prev > 0 ? prev - 1 : 2)}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  mr: 2
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              
              <Tabs 
                value={currentChartIndex} 
                onChange={(e, newValue) => setCurrentChartIndex(newValue)}
                variant="fullWidth"
                sx={{ minWidth: 200 }}
              >
                <Tab label="Completion" />
                <Tab label="Priority" />
                <Tab label="Status" />
              </Tabs>
              
              <IconButton 
                onClick={() => setCurrentChartIndex(prev => prev < 2 ? prev + 1 : 0)}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  ml: 2
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>

            {/* Chart Display */}
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              {/* Line Chart */}
              {currentChartIndex === 0 && (
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 1,
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                    Task Completion (7 days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData.lineData}>
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
              )}
              
              {/* Pie Chart */}
              {currentChartIndex === 1 && (
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 1,
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                    Tasks by Priority
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData.pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.pieData.map((entry, idx) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
              
              {/* Bar Chart */}
              {currentChartIndex === 2 && (
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 1,
                    border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                    boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                    Tasks by Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.barData}>
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
              )}
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ width: '100%', justifyContent: 'center', maxWidth: '1400px', mx: 'auto' }}>
          <Grid item xs={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                height: '100%',
                borderRadius: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: theme => theme.palette.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.45)' : '0 14px 30px rgba(37, 99, 235, 0.18)',
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
                }
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                Task Completion (7 days)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.lineData}>
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

          <Grid item xs={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                height: '100%',
                borderRadius: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: theme => theme.palette.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.45)' : '0 14px 30px rgba(37, 99, 235, 0.18)',
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
                }
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                Tasks by Priority
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.pieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                height: '100%',
                borderRadius: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef1f6',
                boxShadow: theme => theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: theme => theme.palette.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.45)' : '0 14px 30px rgba(37, 99, 235, 0.18)',
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
                }
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                Tasks by Status
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.barData}>
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
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;