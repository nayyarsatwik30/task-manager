import React, { useMemo, useState } from 'react';
import { Box, Fab, TextField, IconButton, Typography, Paper, Divider } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useTasks } from '../hooks/useTasks';

const panelWidth = 360;

export default function AIChatWidget() {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can create, update, complete, or delete tasks. Try: "create task Buy milk" or "complete task 123"' }
  ]);
  const tasksByTitle = useMemo(() => {
    const map = new Map();
    tasks.forEach(t => map.set(String(t.title || '').toLowerCase(), t));
    return map;
  }, [tasks]);

  const findTaskByIdOrTitle = (idOrTitle) => {
    if (!idOrTitle) return null;
    const trimmed = String(idOrTitle).trim();
    const byId = tasks.find(t => String(t.id) === trimmed);
    if (byId) return byId;
    const byTitle = tasksByTitle.get(trimmed.toLowerCase());
    return byTitle || null;
  };

  const handleAction = async (action) => {
    if (!action || action.type === 'none') return null;
    try {
      switch (action.type) {
        case 'create': {
          const title = action.payload?.title || 'Untitled Task';
          await createTask({ title });
          await fetchTasks();
          return `Created task: ${title}`;
        }
        case 'complete': {
          const target = findTaskByIdOrTitle(action.payload?.idOrTitle);
          if (!target) return 'I could not find that task to complete.';
          await updateTask(target.id, { status: 'completed' });
          await fetchTasks();
          return `Marked task as completed: ${target.title}`;
        }
        case 'update': {
          const id = action.payload?.id;
          let target = null;
          if (id) target = findTaskByIdOrTitle(id);
          if (!target && action.payload?.idOrTitle) target = findTaskByIdOrTitle(action.payload.idOrTitle);
          if (!target) return 'I could not find that task to update.';
          const updates = {};
          if (action.payload?.title) updates.title = action.payload.title;
          if (action.payload?.status) updates.status = action.payload.status;
          if (Object.keys(updates).length === 0) return 'Please tell me what to update (e.g., title to … or status to …).';
          await updateTask(target.id, updates);
          await fetchTasks();
          return `Updated task ${target.id}${updates.title ? `, new title: ${updates.title}` : ''}${updates.status ? `, status: ${updates.status}` : ''}`;
        }
        case 'delete': {
          const target = findTaskByIdOrTitle(action.payload?.idOrTitle);
          if (!target) return 'I could not find that task to delete.';
          await deleteTask(target.id);
          await fetchTasks();
          return `Deleted task: ${target.title}`;
        }
        default:
          return null;
      }
    } catch (e) {
      console.error('AI action error:', e);
      return 'Something went wrong while performing that action.';
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);

    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/copilot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: { page: window.location.pathname } })
      });
      const data = await resp.json();
      let replyText = data.reply || 'Okay.';

      if (data.action) {
        const outcome = await handleAction(data.action);
        if (outcome) replyText = `${replyText}\n${outcome}`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (e) {
      console.error('Copilot request failed:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I could not reach the AI service. Please try again.' }]);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <Fab color="primary" aria-label="chat" onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
          <ChatIcon />
        </Fab>
      )}

      {/* Side panel */}
      {open && (
        <Paper elevation={6}
          sx={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: panelWidth, zIndex: 1300, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
            <Typography variant="subtitle1" sx={{ flex: 1 }}>Task Assistant</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ mb: 1.5, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ maxWidth: '80%', p: 1, borderRadius: 1.5, bgcolor: m.role === 'user' ? 'primary.main' : 'grey.300', color: m.role === 'user' ? 'primary.contrastText' : 'text.primary' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.content}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider />
          <Box sx={{ display: 'flex', p: 1 }}>
            <TextField size="small" fullWidth placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
            <IconButton color="primary" onClick={sendMessage} sx={{ ml: 1 }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
