require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { globalErrorHandler } = require('./middlewares/errorHandler');

// Route modules
const healthRoutes       = require('./routes/healthRoutes');
const authRoutes         = require('./routes/authRoutes');
const grievanceRoutes    = require('./routes/grievanceRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const commentRoutes      = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const feedbackRoutes     = require('./routes/feedbackRoutes');
const userRoutes         = require('./routes/userRoutes');
const slaRoutes          = require('./routes/slaRoutes');
const exportRoutes       = require('./routes/exportRoutes');
const publicRoutes       = require('./routes/publicRoutes');

// Services
const { seedDefaultSLAs } = require('./models/SLAConfig');
const { runEscalationCheck } = require('./services/escalationService');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// ── Parsing Middleware ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health',            healthRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/grievances',    grievanceRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/sla',           slaRoutes);
app.use('/api/export',        exportRoutes);
app.use('/api/public',        publicRoutes);

// Nested routes — comments and feedback live under grievances
app.use('/api/grievances/:grievanceId/comments', commentRoutes);
app.use('/api/grievances/:grievanceId/feedback', feedbackRoutes);

// 404 catch-all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  // Seed default SLA configs on every startup (idempotent)
  await seedDefaultSLAs();
  logger.info('SLA configs ready');

  app.listen(PORT, () => {
    logger.info(`🚀 Backend running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV}`);
    logger.info(`   Health:      http://localhost:${PORT}/health`);
  });

  // Run SLA escalation check every hour
  if (process.env.NODE_ENV !== 'test') {
    const ESCALATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
    setInterval(async () => {
      try {
        await runEscalationCheck();
      } catch (err) {
        logger.error('Escalation check failed', { error: err.message });
      }
    }, ESCALATION_INTERVAL_MS);

    logger.info('Escalation cron scheduled every 1 hour');
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message });
  process.exit(1);
});

startServer();
module.exports = app;
