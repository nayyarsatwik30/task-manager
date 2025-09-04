import React, { useEffect } from 'react';
import { Box, Typography, Backdrop } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CelebrationOverlay = ({ open, onClose, headline = 'Well done!', subcopy = 'Task completed', duration = 1500 }) => {
  const theme = useTheme();

  useEffect(() => {
    if (!open) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let timeoutId;
    let removeListener;

    // Auto dismiss
    timeoutId = window.setTimeout(() => {
      onClose?.();
    }, duration);

    // Esc to close
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    removeListener = () => window.removeEventListener('keydown', onKeyDown);

    // Fire confetti if allowed
    if (!prefersReducedMotion) {
      import('canvas-confetti')
        .then((mod) => {
          const confetti = mod.default || mod;
          const colors = theme.palette.mode === 'dark'
            ? ['#90caf9', '#ce93d8', '#80cbc4', '#fff59d']
            : ['#1976d2', '#7b1fa2', '#43a047', '#fbc02d'];

          confetti({
            particleCount: 140,
            spread: 90,
            angle: 60,
            origin: { x: 0, y: 0.4 },
            colors,
          });
          confetti({
            particleCount: 140,
            spread: 90,
            angle: 120,
            origin: { x: 1, y: 0.4 },
            colors,
          });
        })
        .catch(() => {/* ignore */});
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (removeListener) removeListener();
    };
  }, [open, duration, onClose, theme.palette.mode]);

  if (!open) return null;

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        zIndex: (t) => t.zIndex.modal + 1,
        background: theme.palette.mode === 'dark'
          ? 'rgba(15,18,24,0.7)'
          : 'rgba(243, 246, 251, 0.7)'
      }}
      aria-live="polite"
      role="dialog"
      aria-label={`${headline}. ${subcopy}`}
    >
      <Box
        sx={{
          textAlign: 'center',
          color: theme.palette.mode === 'dark' ? '#e3f2fd' : '#0d1b2a',
          p: 3,
          userSelect: 'none',
        }}
      >
        <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          {headline}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          {subcopy}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default CelebrationOverlay;
