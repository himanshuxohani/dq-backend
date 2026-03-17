// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

// const tagsRouter = require('./routes/tags');
// const historianRouter = require('./routes/historian');

// const Anthropic = require("@anthropic-ai/sdk");
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// const app = express();

// // ─── Security Headers ────────────────────────────────────────────────────────
// app.use(helmet());

// // ─── CORS ─────────────────────────────────────────────────────────────────────
// // Restrict to your Next.js frontend domain in production
// // app.use(cors({
// //   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //   methods: ['GET', 'POST'],
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// // }));

// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'http://65.2.131.181',
//     'http://65.2.131.181:3000',
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // ─── Logging ─────────────────────────────────────────────────────────────────
// app.use(morgan('combined'));

// // ─── Body Parser ─────────────────────────────────────────────────────────────
// app.use(express.json());

// // ─── Health Check ─────────────────────────────────────────────────────────────
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });

// // ─── Routes ───────────────────────────────────────────────────────────────────
// app.use('/api/tags', tagsRouter);
// app.use('/api/historian', historianRouter);

// // ─── 404 Handler ─────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // ─── Global Error Handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err.message);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { error: err.message }),
//   });
// });

// // ── Aksha Chat Route (add BEFORE 404 handler) ──
// app.post("/api/aksha/chat", async (req, res) => {
//   const { messages } = req.body;
//   try {
//     const response = await client.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       system: `You are Aksha V5.0, the AI intelligence system for JK Cement's operations dashboard. You are an expert in cement manufacturing KPIs including OEE, clinker production, kiln utilization, heat/power consumption, CO2, quality parameters, and plant costs. Be concise, professional, and data-oriented. Use bullet points when listing items. Always respond as Aksha.`,
//       messages,
//     });
//     res.json({ reply: response.content?.[0]?.text || "No response." });
//   } catch (err) {
//     console.error("Aksha chat error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ── 404 handler (must stay at bottom) ──
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// module.exports = app;


// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

// const tagsRouter = require('./routes/tags');
// const historianRouter = require('./routes/historian');

// const Anthropic = require("@anthropic-ai/sdk");
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// const app = express();

// // ─── Security Headers ────────────────────────────────────────────────────────
// app.use(helmet());

// // ─── CORS ────────────────────────────────────────────────────────────────────
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'http://65.2.131.181',
//     'http://65.2.131.181:3000',
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // ─── Logging ─────────────────────────────────────────────────────────────────
// app.use(morgan('combined'));

// // ─── Body Parser ─────────────────────────────────────────────────────────────
// app.use(express.json());

// // ─── Health Check ────────────────────────────────────────────────────────────
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });

// // ─── Routes ──────────────────────────────────────────────────────────────────
// app.use('/api/tags', tagsRouter);
// app.use('/api/historian', historianRouter);

// // ─── Aksha Chat Route ────────────────────────────────────────────────────────
// app.post("/api/aksha/chat", async (req, res) => {
//   const { messages } = req.body;
//   try {
//     const response = await client.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 1000,
//       system: `You are Aksha V5.0, the AI intelligence system for JK Cement's operations dashboard. You are an expert in cement manufacturing KPIs including OEE, clinker production, kiln utilization, heat/power consumption, CO2, quality parameters, and plant costs. Be concise, professional, and data-oriented. Use bullet points when listing items. Always respond as Aksha.`,
//       messages,
//     });
//     res.json({ reply: response.content?.[0]?.text || "No response." });
//   } catch (err) {
//     console.error("Aksha chat error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ─── 404 Handler ─────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // ─── Global Error Handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err.message);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { error: err.message }),
//   });
// });

// module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const tagsRouter = require('./routes/tags');
const historianRouter = require('./routes/historian');

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://65.2.131.181',
    'http://65.2.131.181:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan('combined'));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/tags', tagsRouter);
app.use('/api/historian', historianRouter);

// ─── Ollama Config ───────────────────────────────────────────────────────────
// const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
// const OLLAMA_MODEL    = process.env.OLLAMA_MODEL || 'llama3.2';  // change to any pulled model

// const AKSHA_SYSTEM_PROMPT = `You are Aksha V5.0, the AI intelligence system for JK Cement's operations dashboard. 
// You are an expert in cement manufacturing KPIs including OEE, clinker production, kiln utilization, 
// heat/power consumption, CO2, quality parameters, and plant costs. 
// Be concise, professional, and data-oriented. Use bullet points when listing items. Always respond as Aksha.`;

// // ─── Aksha Chat Route ────────────────────────────────────────────────────────
// app.post('/api/aksha/chat', async (req, res) => {
//   const { messages } = req.body;

//   if (!messages || !Array.isArray(messages)) {
//     return res.status(400).json({ error: 'messages array is required' });
//   }

//   try {
//     const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: OLLAMA_MODEL,
//         stream: false,
//         messages: [
//           { role: 'system', content: AKSHA_SYSTEM_PROMPT },
//           ...messages,
//         ],
//       }),
//     });

//     if (!ollamaRes.ok) {
//       const errText = await ollamaRes.text();
//       console.error('Ollama error response:', errText);
//       return res.status(502).json({ error: `Ollama returned ${ollamaRes.status}: ${errText}` });
//     }

//     const data = await ollamaRes.json();
//     const reply = data?.message?.content || 'No response from Ollama.';
//     res.json({ reply });

//   } catch (err) {
//     console.error('Aksha chat error:', err.message);

//     // Friendly error if Ollama isn't running
//     if (err.code === 'ECONNREFUSED') {
//       return res.status(503).json({
//         error: 'Ollama is not running. Please start it with: ollama serve',
//       });
//     }

//     res.status(500).json({ error: err.message });
//   }
// });

// Remove ollama, use Groq (free)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant'; // free model

app.post('/api/aksha/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: AKSHA_SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    res.json({ reply });

  } catch (err) {
    console.error('Aksha chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

module.exports = app;
