require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./database/db');

// Get database path for session store
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database', 'bbbi.db');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    store: new SQLiteStore({ filename: dbPath }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Make user available in templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/blog', require('./routes/blog'));
app.use('/caregivers', require('./routes/caregivers'));
app.use('/signup', require('./routes/signup'));
app.use('/admin', require('./routes/admin'));

// Health check endpoint (for Railway)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ BBBI Community Platform running on http://localhost:${PORT}`);
  console.log(`✓ Admin dashboard: http://localhost:${PORT}/admin/login`);
});
