require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ dataPARC API bridge running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 dataPARC Server: ${process.env.DATAPARC_BASE_URL}`);
});


// ── AKSHA Chat Route ──────────────────────────────────────────────
// Add this alongside your existing /api/tags routes
app.post("/api/aksha/chat", async (req, res) => {
  const { messages } = req.body;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // add to your .env
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are Aksha V5.0, the AI intelligence system for JK Cement's operations dashboard...`,
        messages,
      }),
    });
    const data = await response.json();
    res.json({ reply: data.content?.[0]?.text || "No response." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
