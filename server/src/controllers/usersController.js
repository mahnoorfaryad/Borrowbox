const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

async function updateMe(req, res, next) {
  try {
    const { name, phone, area } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), area = COALESCE($3, area)
       WHERE id = $4
       RETURNING id, name, email, phone, area, role, is_active, created_at`,
      [name, phone, area, req.user.id]
    );
    res.json({ success: true, data: rows[0], message: 'Profile updated.' });
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    const openBookings = await pool.query(
      `SELECT 1 FROM bookings b
       JOIN items i ON i.id = b.item_id
       WHERE (b.borrower_id = $1 OR i.owner_id = $1)
         AND b.status IN ('REQUESTED','APPROVED','PICKED_UP')
       LIMIT 1`,
      [req.user.id]
    );
    if (openBookings.rows.length) {
      throw new ApiError(409, 'Cannot delete account while you have open bookings.');
    }
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: 'Account deactivated.' });
  } catch (err) {
    next(err);
  }
}

async function getPublicProfile(req, res, next) {
  try {
    const { id } = req.params;
    const userRes = await pool.query(
      'SELECT id, name, area, role, created_at FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    if (!userRes.rows.length) throw new ApiError(404, 'User not found.');

    const ratingRes = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating, COUNT(*)::int AS review_count
       FROM reviews WHERE reviewee_id = $1`,
      [id]
    );
    const reviewsRes = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS reviewer_name
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
      [id]
    );
    const itemsRes = await pool.query(
      `SELECT id, title, condition, max_days, image_url FROM items
       WHERE owner_id = $1 AND is_active = true ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: userRes.rows[0],
        rating: ratingRes.rows[0],
        reviews: reviewsRes.rows,
        items: itemsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateMe, deleteMe, getPublicProfile };
