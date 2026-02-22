const request = require('supertest');
const create = require('./createTestApp');

describe('RBAC', () => {
  it('blocks unauthenticated access', async () => {
    const { app } = create();
    const res = await request(app).get('/api/schools');
    expect(res.status).toBe(401);
  });
});
