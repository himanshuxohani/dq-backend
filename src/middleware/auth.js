/**
 * Optional: Simple API key middleware to protect your Node.js backend endpoints
 * so only your Next.js frontend can call them.
 *
 * Usage: add to any route  →  router.get('/secure', apiKeyAuth, handler)
 *
 * Set BACKEND_API_KEY in your .env file and pass it as
 * the "x-api-key" header from your Next.js frontend.
 */

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!process.env.BACKEND_API_KEY) {
    // No key configured — skip auth (development mode)
    return next();
  }

  if (!apiKey || apiKey !== process.env.BACKEND_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing API key',
    });
  }

  next();
}

module.exports = { apiKeyAuth };
