const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const bookingService = require('../services/bookingService');

async function create(req, res, next) {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, data: booking, message: 'Borrow request sent.' });
  } catch (err) {
    next(err);
  }
}

async function mine(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, i.title AS item_title, i.image_url, i.owner_id, u.name AS owner_name,
              CASE WHEN b.status = 'PICKED_UP' AND b.end_date < CURRENT_DATE THEN true ELSE false END AS overdue
       FROM bookings b
       JOIN items i ON i.id = b.item_id
       JOIN users u ON u.id = i.owner_id
       WHERE b.borrower_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function incoming(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, i.title AS item_title, i.image_url, u.name AS borrower_name, u.id AS borrower_id,
              CASE WHEN b.status = 'PICKED_UP' AND b.end_date < CURRENT_DATE THEN true ELSE false END AS overdue
       FROM bookings b
       JOIN items i ON i.id = b.item_id
       JOIN users u ON u.id = b.borrower_id
       WHERE i.owner_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT b.*, i.title AS item_title, i.image_url, i.owner_id, i.max_days,
              ow.name AS owner_name, br.name AS borrower_name
       FROM bookings b
       JOIN items i ON i.id = b.item_id
       JOIN users ow ON ow.id = i.owner_id
       JOIN users br ON br.id = b.borrower_id
       WHERE b.id = $1`,
      [id]
    );
    const booking = rows[0];
    if (!booking) throw new ApiError(404, 'Booking not found.');
    if (booking.owner_id !== req.user.id && booking.borrower_id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not allowed to view this booking.');
    }
    const logsRes = await pool.query(
      'SELECT * FROM condition_logs WHERE booking_id = $1 ORDER BY logged_at ASC',
      [id]
    );
    const reviewsRes = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [id]
    );
    res.json({ success: true, data: { ...booking, condition_logs: logsRes.rows, reviews: reviewsRes.rows } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { start_date, end_date, message } = req.body;
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    const booking = existing.rows[0];
    if (!booking) throw new ApiError(404, 'Booking not found.');
    if (booking.borrower_id !== req.user.id) throw new ApiError(403, 'Only the borrower can edit this booking.');
    if (booking.status !== 'REQUESTED') throw new ApiError(409, 'Only pending requests can be edited.');
    const { rows } = await pool.query(
      `UPDATE bookings SET start_date = COALESCE($1, start_date), end_date = COALESCE($2, end_date),
       message = COALESCE($3, message), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [start_date, end_date, message, id]
    );
    res.json({ success: true, data: rows[0], message: 'Booking updated.' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    const booking = existing.rows[0];
    if (!booking) throw new ApiError(404, 'Booking not found.');
    if (booking.borrower_id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not allowed to delete this booking.');
    }
    if (!['REJECTED', 'CANCELLED'].includes(booking.status)) {
      throw new ApiError(409, 'Only rejected or cancelled bookings can be removed.');
    }
    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.json({ success: true, message: 'Booking removed.' });
  } catch (err) {
    next(err);
  }
}

async function changeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { action, note, condition, reject_reason } = req.body;
    const updated = await bookingService.changeStatus(id, req.user, action, { note, condition, reject_reason });
    res.json({ success: true, data: updated, message: `Booking ${action}d successfully.` });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, mine, incoming, getOne, update, remove, changeStatus };
