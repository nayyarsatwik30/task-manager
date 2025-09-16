import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import { useTasks } from '../hooks/useTasks';
import '../styles/copilot.css';

export default function CopilotAssistant() {
  const apiKey = process.env.REACT_APP_COPILOTKIT_API_KEY;
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isDark = (theme?.palette?.mode || 'dark') === 'dark';
  const { createTask } = useTasks();

  // Toggle a body class so we can hide any external Copilot floating widgets via global CSS
  useEffect(() => {
    const cls = 'assistant-open';
    if (open) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Best-effort: hide any stray Copilot floating controls injected outside our box
  useEffect(() => {
    if (!open) return;

    const hideCopilotControls = () => {
      // Hide top-left floating buttons (Help, Debug, etc.)
      const selectors = [
        '[class*="copilot-kit-floating-button"]',
        '[class*="copilot-kit-help-button"]',
        '[class*="copilot-kit-debug-button"]',
        '[class*="copilot-kit-toolbar"]',
        '[class*="copilot-kit-reactions"]',
        'button[aria-label*="Help"]',
        'button[aria-label*="Debug"]',
        'button[aria-label*="Settings"]',
        '.copilot-kit-floating-button',
        '.copilot-kit-help-button',
        '.copilot-kit-debug-button',
        '.copilot-kit-toolbar',
        '.copilot-kit-reactions'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el && el.style) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
        });
      });
    };

    // Run immediately and set up MutationObserver
    hideCopilotControls();
    const observer = new MutationObserver(hideCopilotControls);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [open]);

  // Handle Copilot actions
  const handleCopilotAction = async (action) => {
    if (!action || !action.type) return;

    try {
      switch (action.type) {
        case 'create':
          if (action.payload && action.payload.title) {
            await createTask({
              title: action.payload.title,
              description: action.payload.description || '',
              status: 'pending',
              priority: action.payload.priority || 'medium',
              dueDate: action.payload.dueDate || null
            });
            console.log('Task created successfully');
          }
          break;
        case 'complete':
          // Handle task completion
          console.log('Complete task action:', action.payload);
          break;
        case 'update':
          // Handle task update
          console.log('Update task action:', action.payload);
          break;
        case 'delete':
          // Handle task deletion
          console.log('Delete task action:', action.payload);
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Error executing Copilot action:', error);
    }
  };

  if (!apiKey) return null;

  return (
    <CopilotKit publicApiKey={apiKey}>
      {/* Launcher button */}
      {!open && (
        <button
          aria-label="Open assistant"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '1px solid rgba(148,163,184,0.25)',
            background:
              'linear-gradient(135deg, #7c3aed 0%, #6366f1 60%, #3b82f6 100%)',
            color: 'white',
            boxShadow: '0 10px 24px rgba(59,130,246,0.35)',
            cursor: 'pointer',
            zIndex: 1700,
          }}
        >
          {/* chat bubble icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12c0 3.866-3.582 7-8 7-1.1 0-2.147-.184-3.102-.515L4 20l1.6-3.2C5.22 15.63 5 14.84 5 14c0-3.866 3.582-7 8-7s7 3.134 7 7Z" stroke="white" strokeWidth="1.6" fill="none"/>
          </svg>
        </button>
      )}

      {/* Popup when open (boxed at bottom-right) */}
      {open && (
        <div
          id="assistant-panel"
          className={`assistant-panel ${isDark ? 'dark' : 'light'}`}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            width: 'clamp(380px, 40vw, 520px)',
            zIndex: 1700,
            background: isDark ? '#11161e' : '#ffffff',
            borderRadius: 16,
            border: isDark
              ? '1px solid rgba(148,163,184,0.18)'
              : '1px solid rgba(2, 6, 23, 0.08)',
            boxShadow: isDark
              ? '0 20px 50px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.22)'
              : '0 16px 40px rgba(2, 6, 23, 0.10), 0 2px 10px rgba(2,6,23,0.08)',
            overflow: 'hidden',
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            color: isDark ? '#e9eef5' : '#0b1220',
          }}
        >
          {/* Custom header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 52,
              padding: '0 12px 0 14px',
              background: isDark
                ? 'linear-gradient(180deg, rgba(22,26,33,0.98) 0%, rgba(17,22,30,0.98) 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
              borderBottom: isDark
                ? '1px solid rgba(148,163,184,0.14)'
                : '1px solid rgba(2, 6, 23, 0.06)',
              position: 'sticky',
              top: 0,
              zIndex: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'grid', placeItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12c0 3.866-3.582 7-8 7-1.1 0-2.147-.184-3.102-.515L4 20l1.6-3.2C5.22 15.63 5 14.84 5 14c0-3.866 3.582-7 8-7s7 3.134 7 7Z" stroke="white" strokeWidth="1.6" fill="none"/>
                </svg>
              </div>
              <span style={{ color: isDark ? '#e9eef5' : '#0b1220', fontWeight: 700 }}>Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: isDark ? '1px solid rgba(148,163,184,0.18)' : '1px solid rgba(2,6,23,0.12)',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(2,6,23,0.06)',
                color: isDark ? '#e9eef5' : '#0b1220',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                zIndex: 10,
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(2,6,23,0.1)',
                position: 'relative',
              }}
            >
              ✕
            </button>
          </div>

          {/* Content below header */}
          <div style={{ paddingTop: 0, flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <CopilotPopup
              className="copilot-popup"
              labels={{ title: 'Assistant', initial: 'How can I help?' }}
              defaultOpen={true}
              clickOutsideToClose={false}
              onClose={() => setOpen(false)}
              onAction={handleCopilotAction}
              style={{
                display: 'block',
                width: '100%',
                borderRadius: 0,
                border: 'none',
                boxShadow: 'none',
                background: 'transparent',
              }}
              instructions="You are a helpful task management assistant. When users ask you to create, update, complete, or delete tasks, respond naturally and confirm the action."
            />
          </div>
        </div>
      )}
    </CopilotKit>
  );
}
