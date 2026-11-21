import request from 'supertest';
import app from '../src/index';

describe('RBAC Authorization & Route Security Tests', () => {
  it('GET /api/v1/admin/dashboard should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('No authorization token provided');
  });

  it('GET /api/v1/admin/orders should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/orders');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/products should reject unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Sneakers', selling_price: 1999 });

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/wallet should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/wallet');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/cart should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/orders should reject unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ shipping_address: {}, idempotency_key: '11111111-2222-3333-4444-555555555555' });

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/payments/create-order should reject unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .send({ order_id: '11111111-2222-3333-4444-555555555555' });

    expect(res.status).toBe(401);
  });
});
