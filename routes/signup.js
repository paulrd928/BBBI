const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { body, validationResult } = require('express-validator');

// Email sign-up form (POST)
router.post('/', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('name')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage('Name must not be empty'),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(['', 'member', 'caregiver', 'ally'])
    .withMessage('Invalid role')
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email, name, role } = req.body;

  try {
    db.prepare(
      'INSERT INTO subscribers (email, name, role) VALUES (?, ?, ?)'
    ).run(email, name || null, role || null);

    // TODO: Send welcome email via Nodemailer

    res.json({
      success: true,
      message: 'Thanks for signing up! Check your email for updates.'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed.'
      });
    }
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    });
  }
});

module.exports = router;
