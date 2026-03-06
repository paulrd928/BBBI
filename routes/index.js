const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Homepage
router.get('/', (req, res) => {
  // Get 3 latest published posts
  const featured = db
    .prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3')
    .all();

  res.render('home', {
    title: 'Welcome to BBBI',
    featured
  });
});

module.exports = router;
