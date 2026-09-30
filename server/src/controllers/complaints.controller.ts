import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db';
import { createComplaintSchema, aiAnalysisSchema } from '../schemas/complaint';
import { analyzeComplaint } from '../services/gemini.service';
import { triggerComplaintCreatedWorkflow } from '../services/n8n.service';

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = createComplaintSchema.parse(req.body);

    const insertResult = await query(
      `INSERT INTO complaints (user_id, title, description, location_text, latitude, longitude, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, data.title, data.description, data.location_text, data.latitude, data.longitude, data.category]
    );
    const complaintId = insertResult.rows[0].id;

    let aiResult;
    try {
      const rawAi = await analyzeComplaint(data.title, data.description, data.location_text);
      aiResult = aiAnalysisSchema.parse(rawAi);

      await query(
        `INSERT INTO ai_analyses (complaint_id, condition_category, severity, priority, department, summary, recommended_action, confidence, raw_response)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [complaintId, aiResult.category, aiResult.severity, aiResult.priority, aiResult.department, aiResult.summary, aiResult.recommended_action, aiResult.confidence, JSON.stringify(rawAi)]
      );

      await query(
        `UPDATE complaints SET category = COALESCE($1, category), severity = $2, priority = $3, department = $4, ai_summary = $5, recommended_action = $6, ai_confidence = $7, requires_immediate_attention = $8 WHERE id = $9`,
        [aiResult.category, aiResult.severity, aiResult.priority, aiResult.department, aiResult.summary, aiResult.recommended_action, aiResult.confidence, aiResult.requires_immediate_attention, complaintId]
      );
    } catch (aiError) {
      console.error('AI Error:', aiError);
    }

    const payload = {
      event: "complaint.created",
      complaint_id: complaintId,
      user_id: userId,
      title: data.title,
      description: data.description,
      category: aiResult?.category,
      severity: aiResult?.severity,
      priority: aiResult?.priority,
      department: aiResult?.department,
      requires_immediate_attention: aiResult?.requires_immediate_attention || false,
      idempotency_key: `${complaintId}:complaint.created`,
      timestamp: new Date().toISOString()
    };
    triggerComplaintCreatedWorkflow(payload); // Async, do not block

    res.status(201).json({ success: true, complaintId, aiResult });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.errors || e.message });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, status } = req.query;
    let sql = 'SELECT * FROM complaints WHERE user_id = $1';
    const params: any[] = [req.user!.userId];
    let count = 2;

    if (search) {
      sql += ` AND (title ILIKE $${count} OR description ILIKE $${count})`;
      params.push(`%${search}%`);
      count++;
    }
    if (category) {
      sql += ` AND category = $${count}`;
      params.push(category);
      count++;
    }
    if (status) {
      sql += ` AND status = $${count}`;
      params.push(status);
      count++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const deleteComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    // Check ownership and status
    const result = await query('SELECT status FROM complaints WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    
    if (result.rows[0].status !== 'REPORTED') {
      return res.status(403).json({ success: false, error: 'Can only delete complaints in REPORTED status' });
    }

    await query('DELETE FROM complaints WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const editComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description } = req.body;
    
    const result = await query('SELECT status FROM complaints WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    
    if (result.rows[0].status !== 'REPORTED') {
      return res.status(403).json({ success: false, error: 'Can only edit complaints in REPORTED status' });
    }

    await query('UPDATE complaints SET title = COALESCE($1, title), description = COALESCE($2, description), updated_at = NOW() WHERE id = $3', [title, description, id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
