/**
 * FleetNest API — Main Entry Point
 * Bootstraps the Express server and Socket.io
 */

import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { initSocket } from './socket';
import { logger } from './config/logger';
import { prisma } from './config/database';

const PORT = parseInt(process.env.PORT || process.env.API_PORT || '5000', 10);

const server = http.createServer(app);

// Initialize Socket.io for real-time features
initSocket(server);

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 FleetNest API running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
      logger.info(`💳 Payment mode: ${process.env.STRIPE_MOCK_MODE === 'true' ? 'MOCK' : 'STRIPE'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server shut down.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});

bootstrap();
