const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Caregiver posts listing
router.get('/', (req, res) => {
  const posts = db
    .prepare('SELECT * FROM posts WHERE published = 1 AND author_type = ? ORDER BY created_at DESC')
    .all('caregiver');

  res.render('caregivers', {
    title: 'For Caregivers',
    posts
  });
});

module.exports = router;
