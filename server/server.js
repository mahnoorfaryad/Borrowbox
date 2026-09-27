require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const categoryRoutes = require('./src/routes/categories');
const itemRoutes = require('./src/routes/items');
const bookingRoutes = require('./src/routes/bookings');
const reviewRoutes = require('./src/routes/reviews');
const adminRoutes = require('./src/routes/admin');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ success: true, message: 'BorrowBox API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BorrowBox API listening on port ${PORT}`));
