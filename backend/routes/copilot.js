const express = require('express');
const axios = require('axios');

const router = express.Router();

// POST /api/copilot/ask
// Body: { message: string, context?: any }
router.post('/ask', async (req, res) => {
  try {
    const { message, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    const apiKey = process.env.COPILOTKIT_API_KEY;
    const apiUrl = process.env.COPILOTKIT_API_URL; // optional override

    let aiResponse = null;
    if (apiKey && apiUrl) {
      try {
        const resp = await axios.post(`${apiUrl.replace(/\/$/, '')}/v1/chat`, {
          message,
          context,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          }
        });
        aiResponse = resp.data;
      } catch (e) {
        // Log and proceed with fallback intent parsing
        console.warn('CopilotKit call failed, using fallback intent parsing:', e.message);
      }
    }

    // Optional: map CopilotKit response to an action shape { type, payload }
    let action = null;
    if (aiResponse && aiResponse.action) {
      action = aiResponse.action; // expect backend-friendly action from CopilotKit if configured
    } else {
      // Fallback lightweight intent parsing so the feature still works without external API
      action = fallbackParseIntent(message);
    }

    return res.json({ success: true, reply: aiResponse?.reply || null, action });
  } catch (err) {
    console.error('Error in /api/copilot/ask:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

function fallbackParseIntent(text) {
  const t = String(text || '').toLowerCase();

  // create task: "create task <title> [due <date>]"
  if (/^(create|add)\s+task\b/.test(t)) {
    const title = text.replace(/^(create|add)\s+task\s*/i, '').trim();
    return { type: 'create', payload: { title: title || 'Untitled Task' } };
  }

  // complete task: "complete task <id|title>" or "mark .* completed"
  if (/\b(complete|finish|done|mark).*task\b/.test(t) || /\bmark .* completed\b/.test(t)) {
    const idOrTitle = text.replace(/.*task/i, '').trim();
    return { type: 'complete', payload: { idOrTitle } };
  }

  // update task: "update task <id> title to <new title>"
  if (/^update\s+task\b/.test(t)) {
    const m = text.match(/^update\s+task\s+(\S+)\s+(.+)$/i);
    if (m) {
      const [, id, rest] = m;
      const titleMatch = rest.match(/title\s+to\s+(.+)$/i);
      const statusMatch = rest.match(/status\s+to\s+(\w+)$/i);
      const payload = { id };
      if (titleMatch) payload.title = titleMatch[1];
      if (statusMatch) payload.status = statusMatch[1];
      return { type: 'update', payload };
    }
  }

  // delete task: "delete task <id|title>"
  if (/^(delete|remove)\s+task\b/.test(t)) {
    const idOrTitle = text.replace(/^(delete|remove)\s+task\s*/i, '').trim();
    return { type: 'delete', payload: { idOrTitle } };
  }

  return { type: 'none', payload: {} };
}

module.exports = router;
