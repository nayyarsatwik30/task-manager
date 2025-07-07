import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './pages/Signup';
import MainLayout from './layout/MainLayout';
import { ThemeProvider } from './context/ThemeContext';
import MyTasks from './pages/MyTasks';
import { Box, Typography } from '@mui/material';

// Placeholder pages
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Calendar = () => (
  <Box sx={{ p: 4, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography variant="h4" color="primary">Calendar Page</Typography>
  </Box>
);
const Settings = () => <div>Settings Page</div>;
const Profile = () => <div>Profile Page</div>;

function App() {
  // For demo: fake auth state. Replace with real auth logic later.
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleLogout = () => setIsAuthenticated(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <MainLayout handleLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<React.Suspense fallback={null}><Dashboard /></React.Suspense>} />
                    <Route path="/tasks" element={<MyTasks />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
