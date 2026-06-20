import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { disconnectPrisma } from './lib/prisma.js';

const server = app.listen(env.PORT, () => {
  logger.info(`FORGE backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Shutdown complete');
    process.exit(0);
  });
  // Force-exit if shutdown hangs for any reason.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});
