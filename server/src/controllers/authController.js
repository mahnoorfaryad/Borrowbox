const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitize(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { name, email, password, phone, area } = req.body;
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required.');
    }
    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      throw new ApiError(400, 'An account with this email already exists.');
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, area)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, area, role, is_active, created_at`,
      [name, email.toLowerCase(), hash, phone || null, area || null]
    );
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ success: true, data: { user, token }, message: 'Account created.' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required.');
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user) throw new ApiError(400, 'Invalid email or password.');
    if (!user.is_active) throw new ApiError(403, 'This account has been deactivated.');
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new ApiError(400, 'Invalid email or password.');
    const token = signToken(user);
    res.json({ success: true, data: { user: sanitize(user), token }, message: 'Logged in.' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
