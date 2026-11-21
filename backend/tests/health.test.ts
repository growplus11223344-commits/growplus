import request from 'supertest';
import app from '../src/index';

describe('Health & Status API', () => {
  it('GET /health should return 200 with status ok and version', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.timestamp).toBeDefined();
  });
});
