<<<<<<< ours
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token is required'
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const expectedToken = process.env.API_AUTH_TOKEN;

  if (!expectedToken) {
    console.warn('API_AUTH_TOKEN is not configured. Blocking authenticated routes by default.');
    return res.status(503).json({
      success: false,
      error: 'Authentication service is not configured'
    });
  }

  if (token !== expectedToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }

  return next();
};

module.exports = { requireAuth };
=======
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token is required'
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const expectedToken = process.env.API_AUTH_TOKEN;

  if (!expectedToken) {
    console.warn('API_AUTH_TOKEN is not configured. Blocking authenticated routes by default.');
    return res.status(503).json({
      success: false,
      error: 'Authentication service is not configured'
    });
  }

  if (token !== expectedToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }

  return next();
};

module.exports = { requireAuth };
>>>>>>> theirs
