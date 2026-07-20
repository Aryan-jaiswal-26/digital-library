const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');

let authToken = '';
let testUserId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-library-test');
});

afterAll(async () => {
  // Clean up test user
  if (testUserId) {
    await mongoose.model('User').findByIdAndDelete(testUserId);
  }
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  const testUser = {
    name: 'Test Student',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123',
    role: 'student',
  };

  it('POST /api/v1/auth/register — should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined(); // password should never be exposed

    authToken = res.body.accessToken;
    testUserId = res.body.user._id;
  });

  it('POST /api/v1/auth/register — should reject duplicate email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(400);
  });

  it('POST /api/v1/auth/login — should log in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined(); // refresh token cookie
  });

  it('POST /api/v1/auth/login — should reject wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('GET /api/v1/auth/me — should return current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.user.email).toBe(testUser.email);
  });

  it('GET /api/v1/auth/me — should reject unauthenticated request', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
  });
});

describe('Books Routes', () => {
  it('GET /api/v1/books — should return paginated books list', async () => {
    const res = await request(app).get('/api/v1/books').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/v1/books — should support search query', async () => {
    const res = await request(app)
      .get('/api/v1/books?q=engineering')
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/books/:id — should return 404 for non-existent book', async () => {
    await request(app)
      .get('/api/v1/books/000000000000000000000000')
      .expect(404);
  });

  it('POST /api/v1/books — should reject upload without auth', async () => {
    await request(app).post('/api/v1/books').expect(401);
  });
});

describe('Health Check', () => {
  it('GET /health — should return 200', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
