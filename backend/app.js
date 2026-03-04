const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const studySessionRoutes = require('./src/routes/studySessionRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Study Habit Tracker API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study-sessions', studySessionRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

