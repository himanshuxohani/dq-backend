// const express = require('express');
// const router = express.Router();
// const {
//   getAllTags,
//   getTagCurrentValue,
//   getMultipleTagsCurrentValue,
//   getTagHistory,
//   getTagAggregate,
//   getTagInterpolated,
// } = require('../services/dataparcService');

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/tags
// // Returns list of all available tags in the dataPARC Historian
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/', async (req, res) => {
//   try {
//     const tags = await getAllTags();
//     res.json({ success: true, data: tags });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/tags/:tagName/current
// // Returns the latest value for a specific tag
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/:tagName/current', async (req, res) => {
//   try {
//     const data = await getTagCurrentValue(req.params.tagName);
//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/tags/current/batch
// // Returns latest values for multiple tags at once
// // Body: { "tags": ["Tag1", "Tag2", "Tag3"] }
// // ─────────────────────────────────────────────────────────────────────────────
// router.post('/current/batch', async (req, res) => {
//   const { tags } = req.body;
//   if (!tags || !Array.isArray(tags) || tags.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: 'Request body must include a "tags" array',
//     });
//   }
//   try {
//     const data = await getMultipleTagsCurrentValue(tags);
//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/tags/:tagName/history?start=2024-01-01T00:00:00Z&end=2024-01-02T00:00:00Z
// // Returns raw historical data for a tag within a time range
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/:tagName/history', async (req, res) => {
//   const { start, end } = req.query;
//   if (!start || !end) {
//     return res.status(400).json({
//       success: false,
//       message: '"start" and "end" query params are required (ISO 8601 format)',
//     });
//   }
//   try {
//     const data = await getTagHistory(req.params.tagName, start, end);
//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/tags/:tagName/aggregate?start=...&end=...&type=average
// // Returns aggregated stats (average, min, max, sum) for a tag over a range
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/:tagName/aggregate', async (req, res) => {
//   const { start, end, type } = req.query;
//   if (!start || !end) {
//     return res.status(400).json({
//       success: false,
//       message: '"start" and "end" query params are required (ISO 8601 format)',
//     });
//   }
//   try {
//     const data = await getTagAggregate(req.params.tagName, start, end, type || 'average');
//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/tags/:tagName/interpolated?start=...&end=...&interval=60
// // Returns sampled/interpolated data at regular intervals (in seconds)
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/:tagName/interpolated', async (req, res) => {
//   const { start, end, interval } = req.query;
//   if (!start || !end) {
//     return res.status(400).json({
//       success: false,
//       message: '"start" and "end" query params are required (ISO 8601 format)',
//     });
//   }
//   try {
//     const data = await getTagInterpolated(
//       req.params.tagName,
//       start,
//       end,
//       parseInt(interval) || 60
//     );
//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // TEMPORARY TEST ROUTE - remove after testing
// router.get('/test-auth', async (req, res) => {
//   try {
//     const tags = await getAllTags();
//     res.json({ success: true, message: 'Connected to dataPARC!', count: tags.length });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;


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