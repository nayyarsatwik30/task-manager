import React from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';

export default function CopilotAssistant() {
  const apiKey = process.env.REACT_APP_COPILOTKIT_API_KEY;
  if (!apiKey) return null;

  return (
    <CopilotKit publicApiKey={apiKey}>
      <div
        style={{
          position: 'fixed',
          right: 28,
          bottom: 80, // clear bottom cards/FAB
          width: 'clamp(320px, 36vw, 460px)',
          zIndex: 1600,
        }}
      >
        <CopilotPopup
          labels={{ title: 'Assistant', initial: 'How can I help?' }}
          defaultOpen={false}
          clickOutsideToClose
          style={{
            display: 'block',
            width: '100%',
            minWidth: 320,
            maxWidth: 480,
            maxHeight: 'clamp(48vh, 60vh, 70vh)',
            borderRadius: 16,
            background: 'rgba(24, 28, 35, 0.96)',
            color: '#e6e9ef',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            backdropFilter: 'saturate(120%) blur(8px)',
            padding: 10,
            overflow: 'hidden',
            boxShadow:
              '0 16px 40px rgba(0,0,0,0.35), 0 2px 10px rgba(0,0,0,0.18)',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        />
      </div>
    </CopilotKit>
  );
}
