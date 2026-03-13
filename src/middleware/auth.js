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
