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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../hooks/useTasks';
import dayjs from 'dayjs';
import { Tooltip as MuiTooltip } from '@mui/material';
import { useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Progress Ring Component
const ProgressRing = ({ value, max, size = 80, strokeWidth = 6, color = '#1976d2' }) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? (value / max) * 100 : 0;
  const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

  // Theme-aware background stroke color
  const backgroundStroke = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.08)';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundStroke}
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
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [analytics, setAnalytics] = useState([]);
  const [chartData, setChartData] = useState({
    lineData: [],
    pieData: [],
    barData: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
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

      // Compute WoW deltas and micro-trends
      const sum = (arr) => arr.reduce((a, b) => a + b, 0);
      // Previous 7 days for completed
      const prev7CompletedCounts = [];
      for (let i = 13; i >= 7; i--) {
        const date = dayjs().subtract(i, 'day');
        const cnt = tasks.filter(t => t.status === 'completed' && t.updated_at && dayjs(t.updated_at).isSame(date, 'day')).length;
        prev7CompletedCounts.push(cnt);
      }
      const last7CompletedCounts = last7Days.map(d => d.completed);
      const completedWoW = (() => {
        const prev = sum(prev7CompletedCounts);
        const curr = sum(last7CompletedCounts);
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100);
      })();

      // Created tasks 7-day trend if created_at exists
      const hasCreatedAt = tasks.some(t => !!t.created_at);
      const last7Created = [];
      const prev7Created = [];
      if (hasCreatedAt) {
        for (let i = 6; i >= 0; i--) {
          const date = dayjs().subtract(i, 'day');
          const cnt = tasks.filter(t => t.created_at && dayjs(t.created_at).isSame(date, 'day')).length;
          last7Created.push(cnt);
        }
        for (let i = 13; i >= 7; i--) {
          const date = dayjs().subtract(i, 'day');
          const cnt = tasks.filter(t => t.created_at && dayjs(t.created_at).isSame(date, 'day')).length;
          prev7Created.push(cnt);
        }
      }
      const totalWoW = hasCreatedAt ? (() => {
        const prev = sum(prev7Created);
        const curr = sum(last7Created);
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100);
      })() : null;

      // Pending WoW approximation: compare pending snapshot today vs 7 days ago if created_at/updated_at available
      // Fallback: use difference between pending today and average pending added in last7Created (best-effort)
      const pendingWoW = (() => {
        if (!hasCreatedAt) return null;
        // Approximation using created counts: more created than completed tends to increase pending
        const createdCurr = sum(last7Created);
        const completedCurr = sum(last7CompletedCounts);
        const createdPrev = sum(prev7Created);
        const completedPrev = sum(prev7CompletedCounts);
        const deltaPrev = createdPrev - completedPrev;
        const deltaCurr = createdCurr - completedCurr;
        if (deltaPrev === 0) return deltaCurr !== 0 ? (deltaCurr > 0 ? 100 : -100) : 0;
        return Math.round(((deltaCurr - deltaPrev) / Math.abs(deltaPrev)) * 100);
      })();

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
          color: 'primary.main',
          sparkData: hasCreatedAt ? last7Created.map((v, idx) => ({ i: idx, v })) : undefined,
          delta: totalWoW,
          deltaLabel: totalWoW === null ? undefined : `${totalWoW >= 0 ? '+' : ''}${totalWoW}% WoW`
        },
        {
          label: 'Tasks Completed',
          value: completedTasks,
          icon: <CheckCircleIcon color="success" />,
          color: 'success.main',
          max: totalTasks,
          sparkData: last7CompletedCounts.map((v, idx) => ({ i: idx, v })),
          delta: completedWoW,
          deltaLabel: `${completedWoW >= 0 ? '+' : ''}${completedWoW}% WoW`
        },
        {
          label: 'Pending Tasks',
          value: pendingTasks,
          icon: <PendingActionsIcon color="warning" />,
          color: 'warning.main',
          delta: pendingWoW,
          deltaLabel: pendingWoW === null ? undefined : `${pendingWoW >= 0 ? '+' : ''}${pendingWoW}% WoW`
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
        {/* Mobile Analytics Cards Slider */}
        {isMobile && tasks.length > 0 && (
          <Box sx={{ mb: 3, px: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
              📊 Your Overview
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                gap: 2,
                pb: 1
              }}>
                {analytics.map((item, index) => (
                  <Box key={item.label} sx={{
                    minWidth: 280,
                    scrollSnapAlign: 'start',
                    flexShrink: 0
                  }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: 120,
                        borderRadius: 3,
                        border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e6e8ef',
                        bgcolor: theme => theme.palette.mode === 'dark' ? '#151922' : '#ffffff',
                        backdropFilter: 'saturate(140%) blur(6px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.12)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}15`,
                          color: item.color,
                          flexShrink: 0
                        }}>
                          {item.icon}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{
                          fontSize: '0.7rem',
                          textAlign: 'right',
                          flexShrink: 0,
                          ml: 1
                        }}>
                          {item.trend}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', textAlign: 'left' }}>
                        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{
                          lineHeight: 1.2,
                          mb: 0.5
                        }}>
                          {item.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          fontSize: '0.75rem',
                          lineHeight: 1.2
                        }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Slider Indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 0.5 }}>
                {analytics.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      opacity: 0.3,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Desktop Analytics Cards Section */}
        {!isMobile && tasks.length > 0 && (
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: 3 }}>
            <Grid container spacing={2.5} justifyContent="center">
              {analytics.map((item) => (
                <Grid key={item.label} item xs={12} sm={6} lg={3}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.12)'
                        : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 24px rgba(0,0,0,0.4)'
                        : '0 2px 16px rgba(0,0,0,0.06)',
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : '#ffffff',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                        opacity: 0.8
                      },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme => theme.palette.mode === 'dark'
                          ? '0 8px 40px rgba(0,0,0,0.5)'
                          : '0 8px 32px rgba(0,0,0,0.12)',
                        '&::before': {
                          height: 4,
                          opacity: 1
                        }
                      }
                    }}
                    onClick={() => {
                      // Navigate to appropriate task filter based on card type
                      if (item.label === 'Total Tasks') {
                        navigate('/tasks');
                      } else if (item.label === 'Tasks Completed') {
                        navigate('/tasks?filter=completed');
                      } else if (item.label === 'Pending Tasks') {
                        navigate('/tasks?filter=pending');
                      } else if (item.label === 'Tasks Due Today') {
                        navigate('/tasks?filter=due-today');
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.5 }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 0.5
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            fontSize: '2rem',
                            lineHeight: 1.2
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: `${item.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {item.icon && React.cloneElement(item.icon, {
                          sx: {
                            fontSize: 24,
                            color: item.color
                          }
                        })}
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 'auto' }}>
                      {item.deltaLabel && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: theme => theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.02)'
                        }}>
                          <Chip
                            label={item.deltaLabel}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              bgcolor: (item.delta ?? 0) >= 0 ? '#4caf5015' : '#f4433615',
                              color: (item.delta ?? 0) >= 0 ? '#4caf50' : '#f44336',
                              border: (item.delta ?? 0) >= 0 ? '1px solid #4caf5030' : '1px solid #f4433630'
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            vs last week
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        )}
        {/* Quick Insights */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: 'text.primary',
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            Quick Insights
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {(() => {
              // Compute insights
              const now = dayjs();
              const next24 = now.add(24, 'hour');
              const tasksDueNext24 = tasks.filter(t => t.due_date && dayjs(t.due_date).isAfter(now) && dayjs(t.due_date).isBefore(next24) && t.status !== 'completed');
              const overdueHigh = tasks.filter(t => t.due_date && dayjs(t.due_date).isBefore(now) && t.status !== 'completed' && t.priority === 'high');
              const hours = new Array(24).fill(0);
              tasks.forEach(t => {
                if (t.status === 'completed' && t.updated_at) {
                  const h = dayjs(t.updated_at).hour();
                  hours[h] += 1;
                }
              });
              const bestHourIdx = hours.reduce((best, val, idx, arr) => (val > arr[best] ? idx : best), 0);
              const bestHourLabel = `${String(bestHourIdx).padStart(2, '0')}:00`;

              const items = [
                {
                  title: 'Tasks due in next 24h',
                  value: tasksDueNext24.length,
                  color: 'info',
                  desc: tasksDueNext24.length > 0 ? `${tasksDueNext24.length} task(s) approaching deadline` : 'All clear for the next 24h',
                },
                {
                  title: 'Overdue high‑priority',
                  value: overdueHigh.length,
                  color: 'error',
                  desc: overdueHigh.length > 0 ? 'Tackle these first' : 'No critical overdue tasks',
                },
                {
                  title: 'Best productivity hour',
                  value: bestHourLabel,
                  color: 'success',
                  desc: hours[bestHourIdx] > 0 ? `${hours[bestHourIdx]} completion(s) historically` : 'No pattern yet — keep completing!',
                },
              ];
              return items.map((ins) => (
                <Grid key={ins.title} item xs={12} sm={6} lg={4}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.12)'
                        : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 24px rgba(0,0,0,0.4)'
                        : '0 2px 16px rgba(0,0,0,0.06)',
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : '#ffffff',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${theme.palette[ins.color]?.main || '#1976d2'}, ${theme.palette[ins.color]?.main || '#1976d2'}88)`,
                        opacity: 0.8
                      },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme => theme.palette.mode === 'dark'
                          ? '0 8px 40px rgba(0,0,0,0.5)'
                          : '0 8px 32px rgba(0,0,0,0.12)',
                        '&::before': {
                          height: 4,
                          opacity: 1
                        }
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.5 }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 0.5
                          }}
                        >
                          {ins.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            fontSize: '2rem',
                            lineHeight: 1.2
                          }}
                        >
                          {ins.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: `${theme.palette[ins.color]?.main || '#1976d2'}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {ins.color === 'info' && <AccessTimeIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />}
                        {ins.color === 'error' && <PriorityHighIcon sx={{ fontSize: 24, color: theme.palette.error.main }} />}
                        {ins.color === 'success' && <TrendingUpIcon sx={{ fontSize: 24, color: theme.palette.success.main }} />}
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)'
                      }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            fontWeight: 500
                          }}
                        >
                          {ins.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ));
            })()}
          </Grid>
        </Container>
        {/* Analytics Charts */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              color: 'text.primary',
              textAlign: { xs: 'center', md: 'left' },
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            📈 Analytics Overview
          </Typography>

          {/* Mobile Chart Slider */}
          {isMobile && (
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Box sx={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                gap: 2,
                pb: 1,
                px: 1
              }}>
                {/* Line Chart */}
                <Box sx={{
                  minWidth: 320,
                  maxWidth: 320,
                  scrollSnapAlign: 'center',
                  flexShrink: 0
                }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e6e8ef',
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#151922' : '#ffffff',
                      backdropFilter: 'saturate(140%) blur(6px)',
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: 320,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{
                      mb: 2,
                      color: 'text.primary',
                      textAlign: 'center',
                      fontSize: '0.95rem'
                    }}>
                      📊 Task Completion (7 days)
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData.lineData}>
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke="#1976d2"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#1976d2', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2, fill: '#fff' }}
                          />
                          <RechartTooltip content={<CustomTooltip />} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>
                </Box>

                {/* Pie Chart */}
                <Box sx={{
                  minWidth: 320,
                  maxWidth: 320,
                  scrollSnapAlign: 'center',
                  flexShrink: 0
                }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e6e8ef',
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#151922' : '#ffffff',
                      backdropFilter: 'saturate(140%) blur(6px)',
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: 320,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{
                      mb: 2,
                      color: 'text.primary',
                      textAlign: 'center',
                      fontSize: '0.95rem'
                    }}>
                      🎯 Tasks by Priority
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={chartData.pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={75}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {chartData.pieData.map((entry, idx) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>
                </Box>

                {/* Bar Chart */}
                <Box sx={{
                  minWidth: 320,
                  maxWidth: 320,
                  scrollSnapAlign: 'center',
                  flexShrink: 0
                }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e6e8ef',
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#151922' : '#ffffff',
                      backdropFilter: 'saturate(140%) blur(6px)',
                      boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: 320,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} sx={{
                      mb: 2,
                      color: 'text.primary',
                      textAlign: 'center',
                      fontSize: '0.95rem'
                    }}>
                      📊 Tasks by Status
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData.barData}>
                          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Bar
                            dataKey="tasks"
                            fill="#1976d2"
                            radius={[8, 8, 0, 0]}
                            barSize={35}
                          />
                          <RechartTooltip content={<CustomTooltip />} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>
                </Box>
              </Box>

              {/* Mobile Chart Indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                {['Completion', 'Priority', 'Status'].map((label, index) => (
                  <Box
                    key={label}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: '12px',
                      bgcolor: currentChartIndex === index ? 'primary.main' : 'grey.300',
                      color: currentChartIndex === index ? 'white' : 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setCurrentChartIndex(index)}
                  >
                    {label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Desktop Chart Navigation */}
          {!isMobile && (
            <Box sx={{ width: '100%' }}>
              {/* Chart Navigation - Always visible */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                px: { xs: 1, sm: 2 }
              }}>
                <IconButton
                  onClick={() => setCurrentChartIndex(prev => prev > 0 ? prev - 1 : 2)}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>

                <Tabs
                  value={currentChartIndex}
                  onChange={(e, newValue) => setCurrentChartIndex(newValue)}
                  variant="fullWidth"
                  sx={{
                    minWidth: { xs: 200, sm: 300, md: 400 },
                    maxWidth: { xs: 200, sm: 300, md: 400 },
                    mx: 'auto'
                  }}>
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
                    display: { xs: 'none', sm: 'flex' }
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
                      p: 4,
                      borderRadius: 3,
                      border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.06)',
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : '#ffffff',
                      backdropFilter: 'saturate(140%) blur(6px)',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 24px rgba(0,0,0,0.4)'
                        : '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                      Task Completion (7 days)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.lineData}>
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#1976d2"
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#1976d2', stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 8, stroke: '#1976d2', strokeWidth: 2, fill: '#fff' }}
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
                      p: 4,
                      borderRadius: 3,
                      border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.06)',
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : '#ffffff',
                      backdropFilter: 'saturate(140%) blur(6px)',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 24px rgba(0,0,0,0.4)'
                        : '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                      Tasks by Priority
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
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
                      p: 4,
                      borderRadius: 3,
                      border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.06)',
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : '#ffffff',
                      backdropFilter: 'saturate(140%) blur(6px)',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 24px rgba(0,0,0,0.4)'
                        : '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                      Tasks by Status
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.barData}>
                        <XAxis dataKey="category" />
                        <YAxis allowDecimals={false} />
                        <Bar
                          dataKey="tasks"
                          fill="#9c27b0"
                          radius={[8, 8, 0, 0]}
                          barSize={50}
                        />
                        <RechartTooltip content={<CustomTooltip />} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </Container>
    </Box>
  );
};

export default Dashboard;