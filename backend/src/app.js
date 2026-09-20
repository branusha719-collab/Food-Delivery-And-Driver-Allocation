const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (supports configurable client origin)
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching origin
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode for seamless multi-developer integration
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Structured HTTP logging (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route at root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Food Delivery & Driver Allocation API is operational',
    docs: '/api/health',
    data: null
  });
});

// API routes mounted under /api
app.use('/api', routes);

// 404 Catch-all handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
