import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { query } from '../db';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    (query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // No existing user
    (query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: '123', role: 'CITIZEN' }] }); // Insert result

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should login an existing user', async () => {
    (query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: '123', password_hash: 'hashedpassword', role: 'CITIZEN' }] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});
