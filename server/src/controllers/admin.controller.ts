import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db';
import { triggerComplaintCreatedWorkflow } from '../services/n8n.service';

export const getAllComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM complaints ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.userId;

    const currentResult = await query('SELECT status FROM complaints WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const oldStatus = currentResult.rows[0].status;

    await query('UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
    
    await query(
      'INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
      [id, oldStatus, status, userId]
    );

    await triggerComplaintCreatedWorkflow({ event: 'STATUS_UPDATE', complaintId: id, oldStatus, newStatus: status });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const assignDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    await query('UPDATE complaints SET department = $1, status = \'ASSIGNED\', updated_at = NOW() WHERE id = $2', [department, id]);
    
    await triggerComplaintCreatedWorkflow({ event: 'DEPARTMENT_ASSIGNED', complaintId: id, department });
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
