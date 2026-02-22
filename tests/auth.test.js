const request = require('supertest');
const create = require('./createTestApp');

describe('Auth flow', () => {
  it('bootstraps superadmin and can login', async () => {
    const { app } = create();

    // Bootstrap (may already exist if tests ran before; allow 409)
    const bootstrap = await request(app).post('/api/auth/bootstrap-superadmin').send({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'Password1234!',
    });

    expect([201, 409]).toContain(bootstrap.status);

    const login = await request(app).post('/api/auth/login').send({
      email: 'superadmin@example.com',
      password: 'Password1234!',
    });

    expect(login.status).toBe(200);
    expect(login.body.ok).toBe(true);
    expect(login.body.data.longToken).toBeTruthy();
  });
});
