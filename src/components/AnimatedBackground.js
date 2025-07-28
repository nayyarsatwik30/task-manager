import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0% { 
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0.6;
  }
  20% { 
    transform: translate(100px, -80px) rotate(72deg) scale(1.1);
    opacity: 0.7;
  }
  40% { 
    transform: translate(200px, 20px) rotate(144deg) scale(0.95);
    opacity: 0.8;
  }
  60% { 
    transform: translate(150px, 120px) rotate(216deg) scale(1.05);
    opacity: 0.7;
  }
  80% { 
    transform: translate(50px, 150px) rotate(288deg) scale(0.9);
    opacity: 0.6;
  }
  100% { 
    transform: translate(0, 0) rotate(360deg) scale(1);
    opacity: 0.6;
  }
`;

const AnimatedBackground = ({ children }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Generate larger balls with dynamic movement properties
    const shapes = Array(8).fill().map((_, i) => {
        const size = Math.random() * 150 + 50; // Larger balls (50-200px)
        return {
            id: i,
            size: size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `30s`, // Consistent speed for all balls
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            opacity: Math.random() * 0.3 + 0.3, // More visible opacity
            blur: Math.random() * 15 + 5, // More blur for a softer look
            rotate: Math.random() * 360, // Random starting rotation
            xMovement: (Math.random() - 0.5) * 2 * 200, // Increased movement range
            yMovement: (Math.random() - 0.5) * 2 * 200  // Increased movement range
        };
    });

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                overflow: 'hidden',
                background: isDark
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                    : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
            }}
        >
            {shapes.map((shape) => (
                <Box
                    key={shape.id}
                    sx={{
                        position: 'absolute',
                        width: shape.size,
                        height: shape.size,
                        left: shape.left,
                        top: shape.top,
                        background: isDark 
              ? 'radial-gradient(circle, rgba(135,206,250,0.7) 0%, rgba(70,130,180,0.4) 50%, transparent 100%)'
              : 'radial-gradient(circle, rgba(135,206,250,0.8) 0%, rgba(100,149,237,0.5) 50%, transparent 100%)',
                        borderRadius: '50%',
                        filter: `blur(${shape.blur}px)`,
                        animation: `${float} ${shape.animationDuration}s ease-in-out ${shape.animationDelay} infinite`,
                        opacity: shape.opacity,
                        zIndex: 0,
                        transform: `rotate(${shape.rotate}deg)`,
                        '&:hover': {
                            opacity: shape.opacity * 1.5,
                            filter: `blur(${shape.blur * 0.7}px)`,
                        },
                        transition: 'all 0.5s ease',
                    }}
                />
            ))}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {children}
            </Box>
        </Box>
    );
};

export default AnimatedBackground;
