const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const preferencesRoutes = require('./routes/preferences');
const feedbackRoutes = require('./routes/feedback');
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const activityLogRoutes = require('./routes/activityLog');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/preferences', preferencesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Village Service Platform API running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// DB + Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/village-service';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });