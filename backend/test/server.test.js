const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {
  describe('Health Check', () => {
    it('should return 200 OK for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('API Routes', () => {
    it('should return 200 for integrations endpoint', async () => {
      const response = await request(app)
        .get('/api/integrations')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return supported platforms', async () => {
      const response = await request(app)
        .get('/api/platforms/supported')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return platform statistics', async () => {
      const response = await request(app)
        .get('/api/platforms/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    it('should handle invalid integration creation', async () => {
      const response = await request(app)
        .post('/api/integrations')
        .send({
          // Missing required fields
          description: 'Test integration'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Telegram Routes', () => {
    it('should handle telegram bot info request', async () => {
      const response = await request(app)
        .get('/api/telegram/bot-info');

      // Should either return bot info or error if not configured
      expect([200, 500]).toContain(response.status);
    });

    it('should return telegram chats', async () => {
      const response = await request(app)
        .get('/api/telegram/chats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
});

describe('Utility Functions', () => {
  const helpers = require('../utils/helpers');

  describe('Validation Functions', () => {
    it('should validate email correctly', () => {
      expect(helpers.isValidEmail('test@example.com')).toBe(true);
      expect(helpers.isValidEmail('invalid-email')).toBe(false);
    });

    it('should validate phone number correctly', () => {
      expect(helpers.isValidPhoneNumber('+1234567890')).toBe(true);
      expect(helpers.isValidPhoneNumber('123')).toBe(false);
    });

    it('should validate URL correctly', () => {
      expect(helpers.isValidUrl('https://example.com')).toBe(true);
      expect(helpers.isValidUrl('invalid-url')).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should format bytes correctly', () => {
      expect(helpers.formatBytes(1024)).toBe('1 KB');
      expect(helpers.formatBytes(1048576)).toBe('1 MB');
    });

    it('should generate secure token', () => {
      const token = helpers.generateSecureToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should parse pagination params', () => {
      const params = helpers.parsePaginationParams({ page: '2', limit: '10' });
      expect(params.page).toBe(2);
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(10);
    });
  });
});