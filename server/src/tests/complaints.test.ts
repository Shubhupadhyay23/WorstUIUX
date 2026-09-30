import request from 'supertest';
import express from 'express';
import complaintRoutes from '../routes/complaints';
import { query } from '../db';
import { analyzeComplaint } from '../services/gemini.service';

const app = express();
app.use(express.json());

// Mock auth middleware to auto-authenticate
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: '123', role: 'CITIZEN' };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => next()
}));

jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('../services/gemini.service', () => ({
  analyzeComplaint: jest.fn().mockResolvedValue({
    category: 'Test', severity: 'LOW', priority: 1, department: 'Test', summary: 'Test', recommended_action: 'Test', confidence: 0.9, requires_immediate_attention: false, duplicate_keywords: []
  })
}));

jest.mock('../services/n8n.service', () => ({
  triggerComplaintCreatedWorkflow: jest.fn()
}));

app.use('/api/complaints', complaintRoutes);

describe('Complaints Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch own complaints', async () => {
    (query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'c1', title: 'Test Complaint' }] });

    const res = await request(app).get('/api/complaints');
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), ['123']);
  });

  it('should create a complaint and call Gemini', async () => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'c2' }] }); // Generic mock for inserts/updates

    const res = await request(app)
      .post('/api/complaints')
      .send({ title: 'Big Pothole', description: 'Huge pothole on main st' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(analyzeComplaint).toHaveBeenCalled();
  });
});
