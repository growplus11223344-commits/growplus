import axios from 'axios';
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

export class EuropepayAdapter implements IPaymentGateway {
  readonly name: PaymentProvider = 'europepay';
  readonly displayName = 'EuropeanPay (Open Banking / SEPA)';

  private getBaseUrl(): string {
    if (process.env.EUROPEPAY_API_URL) {
      return process.env.EUROPEPAY_API_URL;
    }
    const env = process.env.EUROPEPAY_ENVIRONMENT || 'staging';
    if (env === 'production') {
      return 'https://api.european-pay.eu/api/v1';
    }
    return 'https://dev.eupayv1apis.european-pay.fr/api/v1';
  }

  private getHeaders(): { 'X-Api-Key': string; 'X-Api-Secret': string; 'Content-Type': string } {
    const apiKey = process.env.EUROPEPAY_API_KEY;
    const apiSecret = process.env.EUROPEPAY_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new AppError(
        503,
        'Europepay gateway credentials not configured. Please supply EUROPEPAY_API_KEY and EUROPEPAY_API_SECRET in server environment.'
      );
    }

    return {
      'X-Api-Key': apiKey,
      'X-Api-Secret': apiSecret,
      'Content-Type': 'application/json',
    };
  }

  getCapabilities(): GatewayCapability {
    const apiKey = process.env.EUROPEPAY_API_KEY || '';
    const isConfigured = Boolean(apiKey && process.env.EUROPEPAY_API_SECRET && !apiKey.includes('placeholder'));
    const supportsINR = process.env.EUROPEPAY_SUPPORTS_INR === 'true';
    const isLiveReady = process.env.EUROPEPAY_LIVE_READY === 'true';

    return {
      provider: 'europepay',
      displayName: this.displayName,
      supportsINR,
      supportsEUR: true,
      supportedCurrencies: supportsINR ? ['EUR', 'INR'] : ['EUR'],
      gatewayType: 'hosted_checkout',
      requiresKYCApproval: true,
      isLiveReady,
      readinessReason: isLiveReady
        ? 'Europepay live credentials configured and active.'
        : 'INCOMPATIBLE FOR DIRECT INR: EuropeanPay is an EU Open Banking/SEPA platform that only supports EUR. Direct settlement in INR or Indian payment rails (UPI/RuPay/Netbanking) is unsupported without an approved FX conversion layer. Live charging is strictly blocked.',
    };
  }

  isAvailable(): { available: boolean; reason?: string } {
    const apiKey = process.env.EUROPEPAY_API_KEY;
    const apiSecret = process.env.EUROPEPAY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return {
        available: false,
        reason: 'EUROPEPAY_API_KEY or EUROPEPAY_API_SECRET missing in server environment.',
      };
    }

    const enabled = process.env.EUROPEPAY_ENABLED === 'true';
    if (!enabled) {
      return {
        available: false,
        reason: 'Europepay is disabled by server configuration (EUROPEPAY_ENABLED=false).',
      };
    }

    return { available: true };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentSessionResult> {
    // 1. Strict Currency Compatibility Gate
    const currency = (params.currency || 'INR').toUpperCase();
    if (currency === 'INR') {
      const allowSimulatedSandbox = process.env.ALLOW_EUROPEPAY_INR_SANDBOX === 'true';
      if (!allowSimulatedSandbox) {
        throw new AppError(
          422,
          'Europepay is incompatible with direct INR payments. EuropeanPay operates exclusively in EUR (SEPA Open Banking). To use Europepay, an explicit EUR arrangement and approved FX conversion layer is required.'
        );
      }
    }

    const apiKey = process.env.EUROPEPAY_API_KEY || 'pk_test_placeholder';
    const isTestPlaceholder = apiKey.includes('placeholder') || apiKey === '';

    const returnUrl =
      params.returnUrl ||
      `http://localhost:8082/#/orders?payment_success=true&order_id=${params.orderId}&provider=europepay`;
    const cancelUrl =
      params.cancelUrl ||
      `http://localhost:8082/#/orders?payment_cancelled=true&order_id=${params.orderId}&provider=europepay`;

    // 2. Real API dispatch if real keys are provided and not in sandbox simulation
    const isSimulate = process.env.EUROPEPAY_SIMULATE === 'true' || process.env.ALLOW_EUROPEPAY_INR_SANDBOX === 'true';
    if (!isTestPlaceholder && process.env.EUROPEPAY_API_SECRET && !isSimulate) {
      try {
        const payload = {
          amount: params.amount,
          currency: currency === 'INR' ? 'EUR' : currency,
          description: `GrowPlus Order #${params.orderNumber}`,
          reference: params.orderId,
          success_url: returnUrl,
          cancel_url: cancelUrl,
          metadata: {
            customer_id: params.userId,
            customer_phone: params.customerPhone,
            customer_email: params.customerEmail,
            original_currency: currency,
            ...(params.notes || {}),
          },
        };

        const response = await axios.post(`${this.getBaseUrl()}/gateway/payments`, payload, {
          headers: this.getHeaders(),
          timeout: 10000,
        });

        const data = response.data;
        return {
          provider: 'europepay',
          gatewayType: 'hosted_checkout',
          gatewayOrderId: data.payment_id || data.id,
          checkoutUrl: data.checkout_url || data.payment_url,
          amount: params.amount,
          currency: currency,
          instructions: 'Redirect the customer to EuropeanPay secure hosted checkout URL.',
          metadata: {
            reference: params.orderId,
            providerReference: data.payment_id,
            status: data.status || 'pending',
          },
        };
      } catch (err: any) {
        logger.error('[Europepay] Failed to create payment session via API:', err.response?.data || err.message);
        throw new AppError(
          502,
          `Europepay API error: ${err.response?.data?.message || err.message || 'Payment session creation failed'}`
        );
      }
    }

    // 3. Staging/Sandbox Session Generation (for automated testing & simulation without real funds)
    const simulatedPaymentId = `eupay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const simulatedCheckoutUrl = `https://checkout.european-pay.eu/pay/${simulatedPaymentId}?ref=${params.orderId}&amount=${params.amount}&currency=${currency}`;

    return {
      provider: 'europepay',
      gatewayType: 'hosted_checkout',
      gatewayOrderId: simulatedPaymentId,
      checkoutUrl: simulatedCheckoutUrl,
      amount: params.amount,
      currency: currency,
      instructions:
        'Redirect customer to EuropeanPay hosted checkout. Payment will be confirmed via verified webhook or return callback.',
      metadata: {
        reference: params.orderId,
        providerReference: simulatedPaymentId,
        isSimulated: isTestPlaceholder,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<NormalizedPaymentResult> {
    const { orderId, gatewayPaymentId, gatewayOrderId, token } = params;
    const paymentRef = gatewayPaymentId || gatewayOrderId || token;

    if (!paymentRef) {
      throw new AppError(400, 'Europepay verification requires payment_id, reference or session token.');
    }

    const apiKey = process.env.EUROPEPAY_API_KEY;
    const isTestPlaceholder = !apiKey || apiKey.includes('placeholder');
    const isSimulate = process.env.EUROPEPAY_SIMULATE === 'true' || process.env.ALLOW_EUROPEPAY_INR_SANDBOX === 'true';

    if (!isTestPlaceholder && process.env.EUROPEPAY_API_SECRET && !isSimulate) {
      try {
        const response = await axios.get(`${this.getBaseUrl()}/gateway/payments/${paymentRef}`, {
          headers: this.getHeaders(),
          timeout: 8000,
        });
        const data = response.data;
        const isSucceeded = data.status === 'succeeded' || data.status === 'completed';

        return {
          success: isSucceeded,
          status: isSucceeded ? 'captured' : 'failed',
          amount: Number(data.amount || 0),
          currency: data.currency || 'EUR',
          gatewayPaymentId: data.payment_id || paymentRef,
          gatewayOrderId: data.reference || orderId,
          failureReason: !isSucceeded ? data.failure_reason || 'Payment not completed on Europepay' : undefined,
          metadata: data,
        };
      } catch (err: any) {
        logger.error('[Europepay] Error fetching status from API:', err.message);
        throw new AppError(502, `Europepay verification check failed: ${err.message}`);
      }
    }

    // Sandbox simulated verification
    return {
      success: true,
      status: 'captured',
      amount: 0,
      currency: 'EUR',
      gatewayPaymentId: paymentRef,
      gatewayOrderId: orderId,
      metadata: {
        verifiedAt: new Date().toISOString(),
        note: 'Verified in Europepay test sandbox.',
      },
    };
  }

  async getPaymentStatus(gatewayPaymentId: string): Promise<NormalizedPaymentResult> {
    return this.verifyPayment({ orderId: '', gatewayPaymentId });
  }

  async verifyWebhook(req: Request): Promise<WebhookVerificationResult> {
    const webhookSecret = process.env.EUROPEPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { valid: false, error: 'EUROPEPAY_WEBHOOK_SECRET not configured' };
    }

    // EuropeanPay uses X-Signature or X-Hub-Signature header with HMAC-SHA256
    const signature = (req.headers['x-signature'] || req.headers['x-hub-signature']) as string;
    if (!signature) {
      return { valid: false, error: 'Missing X-Signature header' };
    }

    const rawBody = (req as any).rawBody
      ? (req as any).rawBody.toString('utf8')
      : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return { valid: false, error: 'Invalid HMAC signature for Europepay webhook' };
    }

    const payload = typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody);

    const eventType = payload.event_type || payload.type || 'payment.succeeded';
    const eventData = payload.data || payload;
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;

    let status: 'captured' | 'failed' | 'refunded' | undefined;
    if (eventType === 'payment.succeeded' || eventType === 'payment.completed') {
      status = 'captured';
    } else if (eventType === 'payment.failed' || eventType === 'payment.cancelled') {
      status = 'failed';
    } else if (eventType === 'payment.refunded') {
      status = 'refunded';
    }

    return {
      valid: true,
      eventId,
      eventType,
      orderId: eventData.reference || eventData.order_id,
      gatewayOrderId: eventData.reference,
      gatewayPaymentId: eventData.payment_id || eventData.id,
      status,
      amount: eventData.amount ? Number(eventData.amount) : undefined,
      currency: eventData.currency,
      payload,
    };
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    const apiKey = process.env.EUROPEPAY_API_KEY;
    const isTestPlaceholder = !apiKey || apiKey.includes('placeholder');
    const isSimulate = process.env.EUROPEPAY_SIMULATE === 'true' || process.env.ALLOW_EUROPEPAY_INR_SANDBOX === 'true';

    if (!isTestPlaceholder && process.env.EUROPEPAY_API_SECRET && !isSimulate) {
      try {
        const response = await axios.post(
          `${this.getBaseUrl()}/gateway/payments/${params.gatewayPaymentId}/refund`,
          {
            amount: params.amount,
            reason: params.reason || 'Requested by customer/merchant',
          },
          { headers: this.getHeaders(), timeout: 10000 }
        );

        return {
          success: true,
          refundId: response.data.refund_id || `ref_${Date.now()}`,
          amountRefunded: params.amount,
          status: response.data.status || 'succeeded',
        };
      } catch (err: any) {
        return {
          success: false,
          status: 'failed',
          failureReason: err.response?.data?.message || err.message,
        };
      }
    }

    // Sandbox simulated refund
    return {
      success: true,
      refundId: `ref_eu_sim_${Date.now()}`,
      amountRefunded: params.amount,
      status: 'succeeded',
    };
  }
}
