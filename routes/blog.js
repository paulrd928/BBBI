const express = require('express');
const router = express.Router();
const db = require('../database/db');

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

module.exports = router;
