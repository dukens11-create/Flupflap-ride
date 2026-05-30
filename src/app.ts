import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/error-handler';
import { registerTrackingSocket } from './websocket/tracking.socket';

import authRoutes from './routes/auth.routes';
import ridesRoutes from './routes/rides.routes';
import driversRoutes from './routes/drivers.routes';
import paymentsRoutes from './routes/payments.routes';
import walletRoutes from './routes/wallet.routes';
import kycRoutes from './routes/kyc.routes';
import safetyRoutes from './routes/safety.routes';
import supportRoutes from './routes/support.routes';
import merchantRoutes from './routes/merchant.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import adminRoutes from './routes/admin.routes';
import scheduledRoutes from './routes/scheduled.routes';
import subscriptionRoutes from './routes/subscription.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import corporateRoutes from './routes/corporate.routes';
import carpoolRoutes from './routes/carpool.routes';
import fraudRoutes from './routes/fraud.routes';
import analyticsRoutes from './routes/analytics.routes';
import twofaRoutes from './routes/twofa.routes';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 300 }));

  app.get('/health', (_, res) => res.json({ ok: true, service: 'flupflap-ride-v7' }));
  app.get('/livez', (_, res) => res.json({ ok: true }));
  app.get('/readyz', (_, res) => res.json({ ok: true, uptimeSeconds: parseFloat(process.uptime().toFixed(3)) }));

  app.use('/api/auth', authRoutes);
  app.use('/api/rides', ridesRoutes);
  app.use('/api/drivers', driversRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/kyc', kycRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/merchant', merchantRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/scheduled', scheduledRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/loyalty', loyaltyRoutes);
  app.use('/api/corporate', corporateRoutes);
  app.use('/api/carpool', carpoolRoutes);
  app.use('/api/fraud', fraudRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/2fa', twofaRoutes);

  registerTrackingSocket(io);
  app.use(errorHandler);

  return { app, httpServer, io };
}
