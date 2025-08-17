import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  Box, 
  Button, 
  IconButton,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '../hooks/useTasks';
import dayjs from 'dayjs';

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

const Analytics = () => {
  const { tasks, loading } = useTasks();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [chartData, setChartData] = useState({
    lineData: [],
    pieData: [],
    barData: []
  });

  useEffect(() => {
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      const dueToday = tasks.filter(task => {
        if (!task.due_date) return false;
        return dayjs(task.due_date).isSame(dayjs(), 'day');
      }).length;

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

      setChartData({
        lineData: last7Days,
        pieData: [
          { name: 'High', value: highPriorityTasks, color: '#e53935' },
          { name: 'Medium', value: mediumPriorityTasks, color: '#fbc02d' },
          { name: 'Low', value: lowPriorityTasks, color: '#43a047' }
        ].filter(item => item.value > 0),
        barData: statusData.filter(item => item.tasks > 0)
      });
    }
  }, [tasks]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" align="center">Loading Analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => navigate('/dashboard')} 
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Analytics Overview
        </Typography>
      </Box>

      {/* Mobile Charts */}
      {isMobile ? (
        <Box sx={{ width: '100%', mb: 4 }}>
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
              <Card elevation={0} sx={{ p: 3, borderRadius: 3 }}>
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
              <Card elevation={0} sx={{ p: 3, borderRadius: 3 }}>
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
                      cy="45%"
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
              <Card elevation={0} sx={{ p: 3, borderRadius: 3 }}>
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
        /* Desktop Charts */
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ p: 4, borderRadius: 3 }}>
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
                    dot={{ r: 7, fill: '#1976d2', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 10, stroke: '#1976d2', strokeWidth: 3, fill: '#fff' }}
                  />
                  <RechartTooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
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
                    cy="45%"
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
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
  );
};

export default Analytics;
