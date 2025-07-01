const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Start Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // Issue JWT
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, name: req.user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Force HTML content type and send script
    res.set('Content-Type', 'text/html');
    res.send(`
      <script>
        window.opener.postMessage({ token: "${token}" }, "http://localhost:3001");
        window.close();
      </script>
    `);
  }
);

// Start Facebook OAuth login
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook OAuth callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, name: req.user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.set('Content-Type', 'text/html');
    res.send(`
      <script>
        window.opener.postMessage({ token: "${token}" }, "http://localhost:3001");
        window.close();
      </script>
    `);
  }
);

// Start GitHub OAuth login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, name: req.user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.set('Content-Type', 'text/html');
    res.send(`
      <script>
        window.opener.postMessage({ token: "${token}" }, "http://localhost:3001");
        window.close();
      </script>
    `);
  }
);

module.exports = router;