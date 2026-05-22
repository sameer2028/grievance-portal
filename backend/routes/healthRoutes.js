const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * GET /health
 * Returns service health status.
 * DB state: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'grievance-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    dependencies: {
      mongodb: dbStatus,
    },
  });
});

module.exports = router;
