import { Request, Response } from 'express';
import { query } from '../db';

export const handleN8nCallback = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['x-backend-secret'];
    if (!authHeader || authHeader !== process.env.N8N_BACKEND_SECRET) {
      console.warn('[n8n callback] Unauthorized attempt');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { complaint_id, category, priority, severity, department, notification } = req.body;

    console.log('[n8n callback] received');
    console.log('[n8n callback] complaint_id:', complaint_id);
    console.log('[n8n callback] priority:', priority);
    console.log('[n8n callback] category:', category);

    if (!complaint_id) {
      console.error('[n8n callback] error: Missing complaint_id');
      return res.status(400).json({ success: false, error: 'Missing complaint_id' });
    }

    console.log('[n8n callback] database update: START');

    // Update the existing complaint
    const result = await query(
      `UPDATE complaints 
       SET category = COALESCE($1, category), 
           priority = COALESCE($2, priority),
           severity = COALESCE($3, severity),
           department = COALESCE($4, department),
           status = 'ASSIGNED',
           updated_at = NOW() 
       WHERE id = $5 RETURNING *`,
      [category, priority, severity, department, complaint_id]
    );

    if (result.rows.length === 0) {
      console.error('[n8n callback] error: Complaint not found');
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    // Insert notification if provided
    if (notification) {
      const complaint = result.rows[0];
      await query(
        `INSERT INTO notifications (user_id, complaint_id, type, title, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [complaint.user_id, complaint_id, 'N8N_UPDATE', 'AI Classification Complete', notification]
      );
    }

    console.log('[n8n callback] success');
    res.json({ success: true, complaint: result.rows[0] });
  } catch (e: any) {
    console.error('[n8n callback] error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
