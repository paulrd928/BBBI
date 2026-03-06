// Middleware to require admin authentication
function requireAuth(req, res, next) {
  if (!req.session.user || !req.session.user.id) {
    return res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

module.exports = { requireAuth };
