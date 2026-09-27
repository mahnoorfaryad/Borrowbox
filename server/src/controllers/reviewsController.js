const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

async function create(req, res, next) {
  try {
    const { id: bookingId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be between 1 and 5.');

    const bookingRes = await pool.query(
      `SELECT b.*, i.owner_id FROM bookings b JOIN items i ON i.id = b.item_id WHERE b.id = $1`,
      [bookingId]
    );
    const booking = bookingRes.rows[0];
    if (!booking) throw new ApiError(404, 'Booking not found.');
    if (booking.status !== 'RETURNED') throw new ApiError(409, 'Reviews open only after the item is returned.');

    const reviewerId = req.user.id;
    let revieweeId;
    if (reviewerId === booking.borrower_id) revieweeId = booking.owner_id;
    else if (reviewerId === booking.owner_id) revieweeId = booking.borrower_id;
    else throw new ApiError(403, 'Only participants of this booking can leave a review.');

    const { rows } = await pool.query(
      `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [bookingId, reviewerId, revieweeId, rating, comment || null]
    );
    res.status(201).json({ success: true, data: rows[0], message: 'Review submitted.' });
  } catch (err) {
    if (err.code === '23505') return next(new ApiError(409, 'You already reviewed this booking.'));
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const existing = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    const review = existing.rows[0];
    if (!review) throw new ApiError(404, 'Review not found.');
    if (review.reviewer_id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Only the author can edit this review.');
    }
    const { rows } = await pool.query(
      `UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) WHERE id = $3 RETURNING *`,
      [rating, comment, id]
    );
    res.json({ success: true, data: rows[0], message: 'Review updated.' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    const review = existing.rows[0];
    if (!review) throw new ApiError(404, 'Review not found.');
    if (review.reviewer_id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Only the author or an admin can delete this review.');
    }
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, update, remove };
