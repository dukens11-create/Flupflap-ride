import { createApp } from './app';
import { env } from './config';
import { logger } from './utils';

console.log('🔍 [DIAGNOSTIC] Starting server initialization...');

try {
  console.log('🔍 [DIAGNOSTIC] Creating app...');
  const { httpServer } = createApp();
  console.log('🔍 [DIAGNOSTIC] App created successfully');

  console.log(`🔍 [DIAGNOSTIC] Binding to 0.0.0.0:${env.port}`);
  
  const server = httpServer.listen(env.port, '0.0.0.0', () => {
    console.log('🔍 [DIAGNOSTIC] listen() callback executed');
    logger.info('http server started', {
      port: env.port,
      nodeEnv: env.nodeEnv,
      dataStoreMode: env.dataStoreMode
    });
  });

  server.on('error', (err) => {
    console.error('🔍 [DIAGNOSTIC] Server error:', err);
    logger.error('server error', { message: err.message });
  });

  server.on('listening', () => {
    console.log('🔍 [DIAGNOSTIC] Server emitted "listening" event');
    const addr = server.address();
    console.log('🔍 [DIAGNOSTIC] Server bound to:', addr);
  });

  console.log('🔍 [DIAGNOSTIC] Server initialization complete, awaiting requests...');
} catch (err) {
  console.error('🔍 [DIAGNOSTIC] Fatal error during startup:', err);
  logger.error('startup error', { 
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  });
  process.exit(1);
}
