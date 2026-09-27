const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Verifies the Bearer token and attaches req.user = { id, role }
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not logged in.' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [payload.id]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// Optional auth: attaches req.user if a valid token is present, otherwise continues
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [payload.id]
    );
    if (rows[0] && rows[0].is_active) req.user = rows[0];
  } catch (_) {
    /* ignore invalid token for optional auth */
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
