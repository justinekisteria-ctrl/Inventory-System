// backend/server.js
// Main Express server setup and route configuration

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import database initialization
const { initializeDatabase } = require('./db/database');

// Import routes
const uploadRoute = require('./routes/upload');
const scanRoute = require('./routes/scan');
const downloadRoute = require('./routes/download');
const assetsRoute = require('./routes/assets');
const usersRoute = require('./routes/users');
const activityHistoryRoute =
require('./routes/activityHistory');
const { getLastUpdated } = require('./utils/updateTracker');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 2026;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS (allows frontend to make requests to this backend)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// CREATE UPLOADS FOLDER IF IT DOESN'T EXIST
// ============================================

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Created uploads folder');
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

// Initialize SQLite database when server starts
initializeDatabase();

// ============================================
// ROUTES
// ============================================

// POST /api/upload - Upload and process Excel file
app.use('/api/upload', uploadRoute);

// POST /api/scan - Process QR code scan
app.use('/api/scan', scanRoute);

// GET /api/download - Download updated Excel file
app.use('/api/download', downloadRoute);

// GET /api/assets - Fetch all assets
app.use('/api/assets', assetsRoute);

// GET/POST/PUT/DELETE /api/users - Manage users
app.use('/api/users', usersRoute);

app.use(
  '/api/activity-history',
  activityHistoryRoute
);

// ============================================
// LIVE UPDATE CHECK ENDPOINT
// ============================================

app.get('/api/last-updated', (req, res) => {
  res.json({
    success: true,
    lastUpdated: getLastUpdated(),
  });
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

// GET / - Simple health check
app.get('/', (req, res) => {
  res.json({
    message: 'Asset Inventory System API is running',
    version: '1.0.0',
    status: 'active',
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    'TIMEZONE:',
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone
  );

  console.log(
    'LOCAL TIME:',
    new Date().toString()
  );

  console.log(
    'MONTH:',
    new Date().getMonth() + 1
  );

  console.log(`
╔════════════════════════════════════════════╗
║  Asset Inventory System - Backend Running  ║
║  Server: http://localhost:${PORT}          ║
║  Status: Ready to accept requests          ║
╚════════════════════════════════════════════╝
  `);

});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✅ Asset Inventory Server shutting down gracefully');
  process.exit(0);
});
