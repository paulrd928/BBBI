// Middleware to require admin authentication
function requireAuth(req, res, next) {
  // Bypass auth in development mode for testing
  if (process.env.NODE_ENV === 'development') {
    req.session.user = { id: 1, username: 'admin' };
    return next();
  }

  if (!req.session.user || !req.session.user.id) {
    return res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

module.exports = { requireAuth };
