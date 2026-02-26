const express = require('express');
const router = express.Router();
const dataparcService = require('../services/dataparcService');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/historian/tags
// Alias route for browsing all historian tags (useful for dashboard dropdowns)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/tags', async (req, res) => {
  try {
    const tags = await dataparcService.getAllTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/historian/query
// Multi-tag query: fetch current values for a set of tags in one request
// Body: { "tags": ["Tag1", "Tag2"], "start": "...", "end": "..." }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/query', async (req, res) => {
  const { tags, start, end } = req.body;

  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body must include a "tags" array',
    });
  }

  try {
    // Fetch history for all tags in parallel
    const results = await Promise.all(
      tags.map(async (tag) => {
        try {
          let data;
          if (start && end) {
            data = await dataparcService.getTagHistory(tag, start, end);
          } else {
            data = await dataparcService.getTagCurrentValue(tag);
          }
          return { tag, success: true, data };
        } catch (err) {
          return { tag, success: false, error: err.message };
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/historian/dashboard
// Dashboard endpoint: fetches current value + 1hr trend for multiple tags
// Body: { "tags": ["Tag1", "Tag2"] }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/dashboard', async (req, res) => {
  const { tags } = req.body;

  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body must include a "tags" array',
    });
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    const results = await Promise.all(
      tags.map(async (tag) => {
        try {
          const [current, trend] = await Promise.all([
            dataparcService.getTagCurrentValue(tag),
            dataparcService.getTagInterpolated(
              tag,
              oneHourAgo.toISOString(),
              now.toISOString(),
              60 // 1-minute samples
            ),
          ]);
          return { tag, success: true, current, trend };
        } catch (err) {
          return { tag, success: false, error: err.message };
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
