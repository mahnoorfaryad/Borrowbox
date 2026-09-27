const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

async function stats(req, res, next) {
  try {
    const usersRes = await pool.query('SELECT COUNT(*)::int AS total FROM users');
    const itemsRes = await pool.query('SELECT COUNT(*)::int AS total FROM items');
    const bookingsByStatus = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM bookings GROUP BY status`
    );
    const totalBookings = await pool.query('SELECT COUNT(*)::int AS total FROM bookings');
    res.json({
      success: true,
      data: {
        total_users: usersRes.rows[0].total,
        total_items: itemsRes.rows[0].total,
        total_bookings: totalBookings.rows[0].total,
        bookings_by_status: bookingsByStatus.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, area, role, is_active, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function setUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (Number(id) === req.user.id) throw new ApiError(400, 'You cannot deactivate your own account here.');
    const { rows } = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, is_active',
      [is_active, id]
    );
    if (!rows.length) throw new ApiError(404, 'User not found.');
    res.json({ success: true, data: rows[0], message: 'User status updated.' });
  } catch (err) {
    next(err);
  }
}

async function listItems(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.title, i.is_active, i.created_at, u.name AS owner_name, c.name AS category_name
       FROM items i JOIN users u ON u.id = i.owner_id JOIN categories c ON c.id = i.category_id
       ORDER BY i.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE items SET is_active = false WHERE id = $1', [id]);
    res.json({ success: true, message: 'Item removed from listings.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats, listUsers, setUserStatus, listItems, removeItem };
