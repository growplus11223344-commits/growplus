import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Request } from 'express';
import {
  IPaymentGateway,
  PaymentProvider,
  GatewayCapability,
  CreatePaymentParams,
  PaymentSessionResult,
  VerifyPaymentParams,
  NormalizedPaymentResult,
  RefundParams,
  RefundResult,
  WebhookVerificationResult,
} from './types';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export class RazorpayAdapter implements IPaymentGateway {
  readonly name: PaymentProvider = 'razorpay';
  readonly displayName = 'Razorpay (India)';

  private getClient(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new AppError(503, 'Razorpay gateway not configured. Please supply RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  getCapabilities(): GatewayCapability {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const isLive = keyId.startsWith('rzp_live_');
    const isTest = keyId.startsWith('rzp_test_');

    return {
      provider: 'razorpay',
      displayName: this.displayName,
      supportsINR: true,
      supportsEUR: false,
      supportedCurrencies: ['INR'],
      gatewayType: 'sdk',
      requiresKYCApproval: true,
      isLiveReady: isLive,
      readinessReason: isLive
        ? 'Live Production Keys Active.'
        : isTest
        ? 'Running in Razorpay Test Sandbox (rzp_test_). Live real-money processing requires production merchant activation.'
        : 'Razorpay keys not configured in environment.',
    };
  }

  isAvailable(): { available: boolean; reason?: string } {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return { available: false, reason: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in server environment.' };
    }

    const enabled = process.env.RAZORPAY_ENABLED !== 'false';
    if (!enabled) {
      return { available: false, reason: 'Razorpay is disabled by server configuration (RAZORPAY_ENABLED=false).' };
    }

    return { available: true };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentSessionResult> {
    const client = this.getClient();
    const amountInPaise = Math.round(params.amount * 100);

    if (amountInPaise < 100) {
      throw new AppError(400, 'Minimum payment amount is ₹1.00');
    }

    if (params.currency && params.currency.toUpperCase() !== 'INR') {
      throw new AppError(400, `Razorpay configuration currently only supports INR transactions (received ${params.currency})`);
    }

    const razorpayOrder = await client.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: params.orderNumber,
      notes: {
        order_id: params.orderId,
        user_id: params.userId,
        ...(params.notes || {}),
      },
    });

    return {
      provider: 'razorpay',
      gatewayType: 'sdk',
      gatewayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      instructions: 'Open native Razorpay SDK checkout or web iframe using keyId and gatewayOrderId.',
      metadata: {
        receipt: params.orderNumber,
        notes: razorpayOrder.notes,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<NormalizedPaymentResult> {
    const { gatewayOrderId, gatewayPaymentId, gatewaySignature } = params;

    if (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
      throw new AppError(400, 'Missing Razorpay signature verification parameters (order_id, payment_id, signature).');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new AppError(503, 'RAZORPAY_KEY_SECRET not configured on server.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== gatewaySignature) {
      logger.warn(`[Razorpay] Invalid payment signature for order ${gatewayOrderId}. Signature mismatch.`);
      throw new AppError(400, 'Invalid payment signature from Razorpay');
    }

    return {
      success: true,
      status: 'captured',
      amount: 0, // In standard verification, amount is confirmed from order record
      currency: 'INR',
      gatewayOrderId,
      gatewayPaymentId,
      metadata: {
        verifiedAt: new Date().toISOString(),
        method: 'hmac_sha256',
      },
    };
  }

  async getPaymentStatus(gatewayPaymentId: string): Promise<NormalizedPaymentResult> {
    const client = this.getClient();
    const payment = await client.payments.fetch(gatewayPaymentId);

    let status: 'created' | 'attempted' | 'captured' | 'failed' | 'refunded' = 'created';
    if (payment.status === 'captured') status = 'captured';
    else if (payment.status === 'failed') status = 'failed';
    else if (payment.status === 'refunded') status = 'refunded';
    else if (payment.status === 'authorized') status = 'attempted';

    return {
      success: payment.status === 'captured',
      status,
      amount: Number(payment.amount) / 100,
      currency: payment.currency,
      gatewayPaymentId: payment.id,
      gatewayOrderId: payment.order_id,
      failureReason: payment.error_description || undefined,
      metadata: {
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
      },
    };
  }

  async verifyWebhook(req: Request): Promise<WebhookVerificationResult> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { valid: false, error: 'RAZORPAY_WEBHOOK_SECRET not configured' };
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return { valid: false, error: 'Missing x-razorpay-signature header' };
    }

    const rawBody = (req as any).rawBody
      ? (req as any).rawBody.toString('utf8')
      : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return { valid: false, error: 'Invalid HMAC signature' };
    }

    const event = typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody);

    const eventId = (req.headers['x-razorpay-event-id'] as string) || event.id;
    const paymentEntity = event.payload?.payment?.entity;

    let status: 'captured' | 'failed' | 'refunded' | undefined;
    if (event.event === 'payment.captured') status = 'captured';
    else if (event.event === 'payment.failed') status = 'failed';
    else if (event.event === 'refund.processed') status = 'refunded';

    return {
      valid: true,
      eventId,
      eventType: event.event,
      orderId: paymentEntity?.notes?.order_id,
      gatewayOrderId: paymentEntity?.order_id,
      gatewayPaymentId: paymentEntity?.id,
      status,
      amount: paymentEntity?.amount ? Number(paymentEntity.amount) / 100 : undefined,
      currency: paymentEntity?.currency,
      payload: event,
    };
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    const client = this.getClient();
    const refundOptions: any = {};
    if (params.amount) {
      refundOptions.amount = Math.round(params.amount * 100);
    }
    if (params.reason) {
      refundOptions.notes = { reason: params.reason };
    }

    const refund = await client.payments.refund(params.gatewayPaymentId, refundOptions);

    return {
      success: true,
      refundId: refund.id,
      amountRefunded: Number(refund.amount) / 100,
      status: refund.status || 'processed',
    };
  }
}
