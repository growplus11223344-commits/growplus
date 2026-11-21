import request from 'supertest';
import app from '../src/index';
import crypto from 'crypto';

describe('Payment Webhooks & Signature Verification', () => {
  const webhookSecret = 'test_webhook_secret_key_12345';

  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
  });

  it('POST /api/v1/webhooks/razorpay should reject requests with invalid signature (400)', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: { id: 'pay_test123', order_id: 'order_test123', amount: 50000 },
        },
      },
    });

    const res = await request(app)
      .post('/api/v1/webhooks/razorpay')
      .set('x-razorpay-signature', 'invalid_signature_hash')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid signature');
  });

  it('POST /api/v1/webhooks/razorpay should accept valid HMAC SHA256 signature', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: { id: 'pay_test123', order_id: 'order_test123', amount: 50000 },
        },
      },
    });

    const validSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/webhooks/razorpay')
      .set('x-razorpay-signature', validSignature)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
