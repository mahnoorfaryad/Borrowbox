const pool = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const PAGE_SIZE = 6;

// GET /api/items?search=&category=&from=&to=&page=
async function list(req, res, next) {
  try {
    const { search, category, from, to } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const offset = (page - 1) * PAGE_SIZE;

    const conditions = ['i.is_active = true', 'u.is_active = true'];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(i.title ILIKE $${params.length} OR i.description ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conditions.push(`i.category_id = $${params.length}`);
    }
    if (from && to) {
      params.push(from, to);
      const p1 = params.length - 1;
      const p2 = params.length;
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.item_id = i.id
          AND b.status IN ('APPROVED','PICKED_UP')
          AND b.start_date <= $${p2}
          AND b.end_date >= $${p1}
      )`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM items i JOIN users u ON u.id = i.owner_id ${whereClause}`,
      params
    );
    const total = countRes.rows[0].total;

    params.push(PAGE_SIZE, offset);
    const dataRes = await pool.query(
      `SELECT i.id, i.title, i.description, i.condition, i.max_days, i.pickup_area, i.image_url,
              i.created_at, c.name AS category_name, c.id AS category_id,
              u.id AS owner_id, u.name AS owner_name,
              COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewee_id = u.id), 0)::numeric(3,2) AS owner_rating
       FROM items i
       JOIN categories c ON c.id = i.category_id
       JOIN users u ON u.id = i.owner_id
       ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      success: true,
      data: dataRes.rows,
      meta: { total, page, pageSize: PAGE_SIZE, totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1) },
    });
  } catch (err) {
    next(err);
  }
}

async function mine(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, c.name AS category_name,
              (SELECT COUNT(*)::int FROM bookings b WHERE b.item_id = i.id) AS booking_count
       FROM items i JOIN categories c ON c.id = i.category_id
       WHERE i.owner_id = $1 ORDER BY i.created_at DESC`,
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
      `SELECT i.*, c.name AS category_name,
              u.id AS owner_id, u.name AS owner_name, u.area AS owner_area,
              COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewee_id = u.id), 0)::numeric(3,2) AS owner_rating,
              (SELECT COUNT(*)::int FROM reviews WHERE reviewee_id = u.id) AS owner_review_count
       FROM items i
       JOIN categories c ON c.id = i.category_id
       JOIN users u ON u.id = i.owner_id
       WHERE i.id = $1`,
      [id]
    );
    if (!rows.length) throw new ApiError(404, 'Item not found.');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function availability(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT start_date, end_date, status FROM bookings
       WHERE item_id = $1 AND status IN ('APPROVED','PICKED_UP')
       ORDER BY start_date ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, category_id, condition, max_days, pickup_area, image_url } = req.body;
    if (!title || !category_id || !max_days) {
      throw new ApiError(400, 'Title, category and max days are required.');
    }
    if (max_days <= 0) throw new ApiError(400, 'Max days must be greater than zero.');
    const { rows } = await pool.query(
      `INSERT INTO items (owner_id, category_id, title, description, condition, max_days, pickup_area, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        req.user.id,
        category_id,
        title,
        description || '',
        condition || 'good',
        max_days,
        pickup_area || null,
        image_url || null,
      ]
    );
    res.status(201).json({ success: true, data: rows[0], message: 'Item listed.' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    if (!existing.rows.length) throw new ApiError(404, 'Item not found.');
    const item = existing.rows[0];
    if (item.owner_id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Only the owner can edit this item.');
    }
    const {
      title, description, category_id, condition, max_days, pickup_area, image_url, is_active,
    } = req.body;
    const { rows } = await pool.query(
      `UPDATE items SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category_id = COALESCE($3, category_id),
        condition = COALESCE($4, condition),
        max_days = COALESCE($5, max_days),
        pickup_area = COALESCE($6, pickup_area),
        image_url = COALESCE($7, image_url),
        is_active = COALESCE($8, is_active)
       WHERE id = $9 RETURNING *`,
      [title, description, category_id, condition, max_days, pickup_area, image_url, is_active, id]
    );
    res.json({ success: true, data: rows[0], message: 'Item updated.' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    if (!existing.rows.length) throw new ApiError(404, 'Item not found.');
    const item = existing.rows[0];
    if (item.owner_id !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Only the owner can delete this item.');
    }
    const openBooking = await pool.query(
      `SELECT 1 FROM bookings WHERE item_id = $1 AND status IN ('REQUESTED','APPROVED','PICKED_UP') LIMIT 1`,
      [id]
    );
    if (openBooking.rows.length) throw new ApiError(409, 'Item has open bookings and cannot be deleted.');

    const anyBooking = await pool.query('SELECT 1 FROM bookings WHERE item_id = $1 LIMIT 1', [id]);
    if (anyBooking.rows.length) {
      await pool.query('UPDATE items SET is_active = false WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Item has booking history, so it was deactivated instead of deleted.' });
    }
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, mine, getOne, availability, create, update, remove };
