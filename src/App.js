import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Login from './Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import MainLayout from './layout/MainLayout';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import MyTasks from './pages/MyTasks';
import { Box, Typography, CircularProgress } from '@mui/material';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CalendarPage from './pages/Calendar';
import { verifyEmailToken } from './utils/authUtils';

// Create a component that uses useSearchParams inside Router context
const AppContent = () => {
  const [searchParams] = useSearchParams();
  // Initialize with token check from localStorage
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => !!localStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for email token on mount and when URL changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for existing token in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // If we have a token, we're authenticated
          setIsAuthenticated(true);
        } else if (searchParams.has('token')) {
          // If we have a token in the URL, verify it
          const result = await verifyEmailToken();
          if (result && result.token) {
            setIsAuthenticated(true);
            // Redirect to dashboard after successful verification
            window.location.href = '/dashboard';
            return;
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [searchParams]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/verify-email" element={<VerifyEmail setIsAuthenticated={setIsAuthenticated} />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MainLayout handleLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<React.Suspense fallback={null}><Dashboard /></React.Suspense>} />
                <Route path="/dashboard" element={<React.Suspense fallback={null}><Dashboard /></React.Suspense>} />
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<Settings handleLogout={handleLogout} />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

const Dashboard = React.lazy(() => import('./components/Dashboard'));

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
