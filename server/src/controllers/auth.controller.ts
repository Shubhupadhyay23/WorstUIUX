import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../schemas/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ success: false, error: 'Email exists' });
    
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, role',
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = generateToken(user.id, user.role);
    res.json({ success: true, token, user: { id: user.id, name, email, role: user.role } });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.errors || e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = generateToken(user.id, user.role);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.errors || e.message });
  }
};
