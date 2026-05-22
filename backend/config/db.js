const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connects to MongoDB with automatic retry on failure.
 * Called once at server startup — Mongoose manages the connection pool internally.
 */
const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure stable behavior across environments
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      logger.warn(
        `MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000}s...`
      );
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    logger.error('MongoDB connection failed after max retries. Exiting.', { error: error.message });
    process.exit(1);
  }
};

// Mongoose global event listeners — useful for debugging in production
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = connectDB;
