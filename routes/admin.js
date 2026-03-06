const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Admin login form (GET)
router.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Admin Login' });
});

// Admin login (POST)
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('admin/login', {
      title: 'Admin Login',
      errors: errors.array()
    });
  }

  const { username, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).render('admin/login', {
        title: 'Admin Login',
        errors: [{ msg: 'Invalid username or password' }]
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).render('admin/login', {
        title: 'Admin Login',
        errors: [{ msg: 'Invalid username or password' }]
      });
    }

    // Store user in session
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/login', {
      title: 'Admin Login',
      errors: [{ msg: 'Server error. Please try again.' }]
    });
  }
});

// Admin dashboard (GET)
router.get('/dashboard', requireAuth, (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  const subscribers = db.prepare('SELECT COUNT(*) as count FROM subscribers').get();
  const draftCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE published = 0').get();

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    posts,
    subscriberCount: subscribers.count,
    draftCount: draftCount.count
  });
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    res.redirect('/');
  });
});

// Admin: Publish/unpublish post
router.post('/posts/:id/toggle-publish', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newStatus = post.published === 1 ? 0 : 1;
  db.prepare('UPDATE posts SET published = ? WHERE id = ?').run(newStatus, req.params.id);

  res.json({ success: true, published: newStatus });
});

// Admin: Delete post
router.post('/posts/:id/delete', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Admin: Export subscribers as CSV
router.get('/subscribers/export', requireAuth, (req, res) => {
  const subscribers = db.prepare('SELECT email, name, role, subscribed_at FROM subscribers ORDER BY subscribed_at DESC').all();

  // Create CSV header
  const header = 'Email,Name,Role,Subscribed At\n';

  // Create CSV rows
  const rows = subscribers.map(sub => {
    const name = sub.name ? `"${sub.name.replace(/"/g, '""')}"` : '';
    const role = sub.role || '';
    return `${sub.email},${name},${role},${sub.subscribed_at}`;
  }).join('\n');

  const csv = header + rows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
  res.send(csv);
});

module.exports = router;
