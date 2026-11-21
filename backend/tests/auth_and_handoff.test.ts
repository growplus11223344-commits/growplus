import request from 'supertest';
import app from '../src/index';
import { SharedIdentityService } from '../src/services/sharedIdentity';

describe('Auth & Shared Identity Handoff Tests', () => {
  describe('Input Validation on Registration', () => {
    it('POST /api/v1/auth/register should fail 422 if password is too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          full_name: 'Test User',
          password: '123', // less than 8 chars
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain('8 characters');
    });

    it('POST /api/v1/auth/register should fail 422 if neither email nor phone is provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'No Contact User',
          password: 'Password@123',
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain('Either email or phone is required');
    });
  });

  describe('Shared Identity Cross-App Handoff', () => {
    it('generateCrossAppToken should generate valid token with 5-minute expiry and deep link', () => {
      process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
      const userId = '11111111-2222-3333-4444-555555555555';

      const { launchToken, deepLink } = SharedIdentityService.generateCrossAppToken(userId);

      expect(launchToken).toBeDefined();
      expect(typeof launchToken).toBe('string');
      expect(deepLink).toBe(`growplus://shopping?handoff_token=${launchToken}`);
    });

    it('should reject malformed or expired cross-app handoff tokens', async () => {
      process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long!!';

      await expect(
        SharedIdentityService.validateAndLinkSession('invalid.jwt.token')
      ).rejects.toThrow('Invalid or expired cross-app handoff token');
    });

    it('POST /api/v1/auth/verify-cross-app should return 400 if handoff_token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-cross-app')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('handoff_token is required');
    });
  });
});
