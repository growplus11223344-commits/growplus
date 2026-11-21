import { Request } from 'express';

export type PaymentProvider = 'razorpay' | 'europepay';
export type PaymentGatewayType = 'sdk' | 'hosted_checkout';
export type PaymentStatus = 'created' | 'attempted' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number; // In standard currency units (e.g. ₹100.00 or €100.00)
  currency: string;
  userId: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  returnUrl?: string;
  cancelUrl?: string;
  notes?: Record<string, any>;
}

export interface PaymentSessionResult {
  provider: PaymentProvider;
  gatewayType: PaymentGatewayType;
  gatewayOrderId?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  keyId?: string; // For client-side SDKs
  instructions?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentParams {
  orderId: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  token?: string;
  rawBody?: any;
}

export interface NormalizedPaymentResult {
  success: boolean;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface RefundParams {
  gatewayPaymentId: string;
  orderId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amountRefunded?: number;
  status: string;
  failureReason?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  eventId?: string;
  eventType?: string;
  orderId?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status?: 'captured' | 'failed' | 'refunded';
  amount?: number;
  currency?: string;
  payload?: any;
  error?: string;
}

export interface GatewayCapability {
  provider: PaymentProvider;
  displayName: string;
  supportsINR: boolean;
  supportsEUR: boolean;
  supportedCurrencies: string[];
  gatewayType: PaymentGatewayType;
  requiresKYCApproval: boolean;
  isLiveReady: boolean;
  readinessReason: string;
}

export interface IPaymentGateway {
  readonly name: PaymentProvider;
  readonly displayName: string;
  getCapabilities(): GatewayCapability;
  isAvailable(): { available: boolean; reason?: string };
  createPayment(params: CreatePaymentParams): Promise<PaymentSessionResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<NormalizedPaymentResult>;
  getPaymentStatus(gatewayPaymentId: string): Promise<NormalizedPaymentResult>;
  verifyWebhook(req: Request): Promise<WebhookVerificationResult>;
  refundPayment(params: RefundParams): Promise<RefundResult>;
}
