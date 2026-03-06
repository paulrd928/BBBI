const express = require('express');
const router = express.Router();
const db = require('../database/db');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

// Blog listing
router.get('/', (req, res) => {
  const posts = db
    .prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC')
    .all();

  res.render('blog/index', {
    title: 'Stories & Updates',
    posts
  });
});

// Individual post
router.get('/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);

  if (!post) {
    return res.status(404).render('404', { title: 'Post Not Found' });
  }

  res.render('blog/post', {
    title: post.title,
    post
  });
});

// Admin: New post form (GET)
router.get('/admin/new', requireAuth, (req, res) => {
  res.render('blog/new', {
    title: 'Create New Post'
  });
});

// Admin: Create post (POST)
router.post(
  '/admin/new',
  requireAuth,
  upload.single('video'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('author_name').trim().notEmpty().withMessage('Author name is required'),
    body('author_type')
      .isIn(['member', 'caregiver'])
      .withMessage('Author type must be member or caregiver')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('blog/new', {
        title: 'Create New Post',
        errors: errors.array()
      });
    }

    const { title, content, author_name, author_type, publish } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const video_url = req.file ? `/uploads/${req.file.filename}` : null;
    const published = publish === 'on' ? 1 : 0;

    try {
      db.prepare(
        'INSERT INTO posts (title, slug, content, author_name, author_type, video_url, published) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(title, slug, content, author_name, author_type, video_url, published);

      res.redirect(published ? `/blog/${slug}` : '/admin/dashboard?status=draft-saved');
    } catch (err) {
      console.error(err);
      res.status(500).render('blog/new', {
        title: 'Create New Post',
        errors: [{ msg: err.message }]
      });
    }
  }
);

module.exports = router;
