import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const { httpServer } = createApp();

httpServer.listen(env.port, () => {
  logger.info('http server started', {
    port: env.port,
    nodeEnv: env.nodeEnv,
    dataStoreMode: env.dataStoreMode
  });
});
