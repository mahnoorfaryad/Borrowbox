const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const ALLOWED_TRANSITIONS = {
  approve: { from: ['REQUESTED'], to: 'APPROVED', actor: 'owner' },
  reject: { from: ['REQUESTED'], to: 'REJECTED', actor: 'owner' },
  cancel: { from: ['REQUESTED', 'APPROVED'], to: 'CANCELLED', actor: 'borrower' },
  pickup: { from: ['APPROVED'], to: 'PICKED_UP', actor: 'owner' },
  return: { from: ['PICKED_UP'], to: 'RETURNED', actor: 'owner' },
};

// Core overlap check used both when creating a request and re-checked on approval
async function hasOverlap(client, itemId, startDate, endDate, excludeBookingId = null) {
  const params = [itemId, startDate, endDate];
  let sql = `SELECT 1 FROM bookings
             WHERE item_id = $1
               AND status IN ('APPROVED', 'PICKED_UP')
               AND start_date <= $3
               AND end_date >= $2`;
  if (excludeBookingId) {
    params.push(excludeBookingId);
    sql += ` AND id != $${params.length}`;
  }
  const { rows } = await client.query(sql, params);
  return rows.length > 0;
}

async function createBooking(borrowerId, { item_id, start_date, end_date, message }) {
  if (!item_id || !start_date || !end_date) {
    throw new ApiError(400, 'Item, start date and end date are required.');
  }
  const today = new Date().toISOString().slice(0, 10);
  if (start_date < today) throw new ApiError(400, 'Start date cannot be in the past.');
  if (end_date < start_date) throw new ApiError(400, 'End date must be on or after start date.');

  const itemRes = await pool.query(
    `SELECT i.*, u.is_active AS owner_active FROM items i JOIN users u ON u.id = i.owner_id WHERE i.id = $1`,
    [item_id]
  );
  const item = itemRes.rows[0];
  if (!item) throw new ApiError(404, 'Item not found.');
  if (!item.is_active || !item.owner_active) throw new ApiError(400, 'This item is not currently available.');
  if (item.owner_id === borrowerId) throw new ApiError(400, 'You cannot borrow your own item.');

  const days = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24) + 1;
  if (days > item.max_days) {
    throw new ApiError(400, `This item can be borrowed for at most ${item.max_days} day(s).`);
  }

  const openCountRes = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM bookings
     WHERE borrower_id = $1 AND status IN ('REQUESTED','APPROVED','PICKED_UP')`,
    [borrowerId]
  );
  if (openCountRes.rows[0].cnt >= 3) {
    throw new ApiError(400, 'You already have 3 open bookings. Finish or cancel one before requesting more.');
  }

  const overlap = await hasOverlap(pool, item_id, start_date, end_date);
  if (overlap) throw new ApiError(409, 'Those dates are no longer available for this item.');

  const { rows } = await pool.query(
    `INSERT INTO bookings (item_id, borrower_id, start_date, end_date, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [item_id, borrowerId, start_date, end_date, message || null]
  );
  return rows[0];
}

async function changeStatus(bookingId, actorUser, action, extra = {}) {
  const transition = ALLOWED_TRANSITIONS[action];
  if (!transition) throw new ApiError(400, 'Unknown action.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingRes = await client.query(
      `SELECT b.*, i.owner_id, i.max_days FROM bookings b
       JOIN items i ON i.id = b.item_id
       WHERE b.id = $1 FOR UPDATE`,
      [bookingId]
    );
    const booking = bookingRes.rows[0];
    if (!booking) throw new ApiError(404, 'Booking not found.');

    // Role check
    const isOwner = booking.owner_id === actorUser.id;
    const isBorrower = booking.borrower_id === actorUser.id;
    if (transition.actor === 'owner' && !isOwner && actorUser.role !== 'admin') {
      throw new ApiError(403, 'Only the item owner can do this.');
    }
    if (transition.actor === 'borrower' && !isBorrower && actorUser.role !== 'admin') {
      throw new ApiError(403, 'Only the borrower can do this.');
    }

    // Status transition check
    if (!transition.from.includes(booking.status)) {
      throw new ApiError(409, `Cannot ${action} a booking that is currently ${booking.status}.`);
    }

    // Re-lock item row for the approve step and re-check overlap
    if (action === 'approve') {
      await client.query('SELECT id FROM items WHERE id = $1 FOR UPDATE', [booking.item_id]);
      const overlap = await hasOverlap(client, booking.item_id, booking.start_date, booking.end_date, booking.id);
      if (overlap) throw new ApiError(409, 'These dates now clash with another approved booking.');
    }

    const updateFields = { status: transition.to, updated_at: new Date() };
    if (action === 'reject' && extra.reject_reason) updateFields.reject_reason = extra.reject_reason;

    const setSql = Object.keys(updateFields)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(', ');
    const updateRes = await client.query(
      `UPDATE bookings SET ${setSql} WHERE id = $1 RETURNING *`,
      [bookingId, ...Object.values(updateFields)]
    );
    const updated = updateRes.rows[0];

    // Auto-reject conflicting REQUESTED bookings on approval, inside the same transaction
    if (action === 'approve') {
      await client.query(
        `UPDATE bookings SET status = 'REJECTED', reject_reason = 'Dates no longer available (another request was approved).', updated_at = NOW()
         WHERE item_id = $1 AND status = 'REQUESTED' AND id != $2
           AND start_date <= $4 AND end_date >= $3`,
        [booking.item_id, booking.id, booking.start_date, booking.end_date]
      );
    }

    // Condition log for pickup / return
    if (action === 'pickup' || action === 'return') {
      const stage = action === 'pickup' ? 'handover' : 'return';
      await client.query(
        `INSERT INTO condition_logs (booking_id, stage, condition, note, logged_by)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (booking_id, stage) DO UPDATE SET condition = EXCLUDED.condition, note = EXCLUDED.note`,
        [bookingId, stage, extra.condition || 'good', extra.note || null, actorUser.id]
      );
    }

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createBooking, changeStatus };
