import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { productsRouter } from './routes/products';
import { categoriesRouter } from './routes/categories';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { paymentsRouter } from './routes/payments';
import { walletRouter } from './routes/wallet';
import { rewardsRouter } from './routes/rewards';
import { referralsRouter } from './routes/referrals';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { supportRouter } from './routes/support';
import { webhooksRouter } from './routes/webhooks';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { MongoAnalyticsService } from './services/mongoAnalytics';
import { GoogleSheetsService } from './services/googleSheets';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map(o => o.trim());
    if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
      return callback(null, true);
    }
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/rewards', rewardsRouter);
app.use('/api/v1/referrals', referralsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/webhooks', webhooksRouter);

// Error handler
app.use(errorHandler);

// Initialize MongoDB for analytics (if configured)
if (process.env.NODE_ENV !== 'test') {
  MongoAnalyticsService.connect().catch(err => {
    logger.warn('Mongo analytics initialization bypassed:', err);
  });

  // Periodic automated reporting sync to Google Sheets (every 6 hours)
  cron.schedule('0 */6 * * *', () => {
    logger.info('[Cron] Triggering periodic Google Sheets report sync...');
    GoogleSheetsService.syncAllReports().catch(err => {
      logger.error('[Cron] Periodic Google Sheets sync error:', err);
    });
  });

  app.listen(PORT, () => {
    logger.info(`GrowPlus Backend running on port ${PORT}`);
  });
}

export { app };
export default app;
