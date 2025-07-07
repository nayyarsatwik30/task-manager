// src/theme/theme.js - MUI v6 custom theme setup for Task Management Dashboard
import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          background: { default: '#f4f6fa', paper: '#fff' },
          text: { primary: '#222', secondary: '#555' },
        }
      : {
          primary: { main: '#90caf9' },
          secondary: { main: '#ce93d8' },
          background: { default: '#181a20', paper: '#23272f' },
          text: { primary: '#fff', secondary: '#b0b0b0' },
        }),
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  shadows: Array(25).fill('none').map((_, i) =>
    i === 1
      ? '0px 2px 8px 0px rgba(60,60,60,0.08)'
      : 'none'
  ),
  // transitions: {
  //   create: ['background-color', 'color'],
  //   duration: 400,
  // },
});

export const getTheme = (mode) => createTheme(getDesignTokens(mode)); 