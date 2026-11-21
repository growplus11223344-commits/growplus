import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../utils/logger';

export interface IEventLog extends Document {
  userId?: string;
  eventType: string;
  sourceApp: 'growplus_rewards' | 'growplus_shopping' | 'admin_dashboard' | 'backend_system';
  payload: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const EventLogSchema = new Schema<IEventLog>({
  userId: { type: String, index: true },
  eventType: { type: String, required: true, index: true },
  sourceApp: {
    type: String,
    enum: ['growplus_rewards', 'growplus_shopping', 'admin_dashboard', 'backend_system'],
    required: true,
  },
  payload: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const EventLogModel = mongoose.model<IEventLog>('EventLog', EventLogSchema);

export class MongoAnalyticsService {
  private static isConnected = false;

  static async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      logger.info('[MongoAnalytics] MONGODB_URI not set. Analytics event logging will run in memory/noop mode.');
      return;
    }

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      this.isConnected = true;
      logger.info('[MongoAnalytics] Connected successfully to MongoDB analytics database.');
    } catch (err: any) {
      logger.warn(`[MongoAnalytics] MongoDB connection failed: ${err.message}. Proceeding without Mongo analytics.`);
      this.isConnected = false;
    }
  }

  /**
   * Log an event asynchronously without blocking requests
   */
  static async logEvent(
    eventType: string,
    sourceApp: 'growplus_rewards' | 'growplus_shopping' | 'admin_dashboard' | 'backend_system',
    payload: Record<string, any> = {},
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    if (!this.isConnected) return;

    try {
      await EventLogModel.create({
        userId,
        eventType,
        sourceApp,
        payload,
        ipAddress,
        userAgent,
      });
    } catch (err) {
      logger.error('[MongoAnalytics] Failed to log event:', err);
    }
  }

  /**
   * Aggregate events for analytics dashboard
   */
  static async getEventMetrics(days: number = 30): Promise<any> {
    if (!this.isConnected) return { connected: false, metrics: [] };

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const metrics = await EventLogModel.aggregate([
      { $match: { createdAt: { $gte: sinceDate } } },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            sourceApp: '$sourceApp',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { connected: true, metrics };
  }
}
