const request = require('supertest');
const app = require('../../src/app');

describe('Health Check API (Integration Test)', () => {
  test('GET /api/health returns 200 with standardized payload', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body).toEqual({
      success: true,
      message: 'Food Delivery Backend is running',
      errorCode: null,
      data: null
    });
  });

  test('GET / returns operational message', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Food Delivery & Driver Allocation API is operational');
  });

  test('GET /api/unknown-endpoint returns 404 with standardized error format', async () => {
    const res = await request(app)
      .get('/api/unknown-endpoint')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('ROUTE_NOT_FOUND');
    expect(res.body.data).toBeNull();
  });
});
