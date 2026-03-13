const express = require('express');
const router = express.Router();
const {
  getAllTags,
  getTagCurrentValue,
  getMultipleTagsCurrentValue,
  getTagHistory,
  getTagAggregate,
} = require('../services/dataparcService');

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const tags = await getAllTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tags/:tagName/current
router.get('/:tagName/current', async (req, res) => {
  try {
    const data = await getTagCurrentValue(req.params.tagName);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tags/current/batch
// Body: { "tags": ["OEE", "Clinker_Production"] }
router.post('/current/batch', async (req, res) => {
  const { tags } = req.body;
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ success: false, message: '"tags" array required' });
  }
  try {
    const data = await getMultipleTagsCurrentValue(tags);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tags/:tagName/history?start=...&end=...
router.get('/:tagName/history', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ success: false, message: '"start" and "end" required' });
  }
  try {
    const data = await getTagHistory(req.params.tagName, start, end);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tags/:tagName/aggregate?start=...&end=...&type=average
router.get('/:tagName/aggregate', async (req, res) => {
  const { start, end, type } = req.query;
  if (!start || !end) {
    return res.status(400).json({ success: false, message: '"start" and "end" required' });
  }
  try {
    const data = await getTagAggregate(req.params.tagName, start, end, type || 'average');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;