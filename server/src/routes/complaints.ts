import { Router } from 'express';
import { createComplaint, getMyComplaints, deleteComplaint, editComplaint } from '../controllers/complaints.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/', createComplaint);
router.get('/', getMyComplaints);
router.delete('/:id', deleteComplaint);
router.put('/:id', editComplaint);

export default router;
