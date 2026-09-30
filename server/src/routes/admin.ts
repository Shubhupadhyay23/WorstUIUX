import { Router } from 'express';
import { getAllComplaints, updateStatus, assignDepartment } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/status', updateStatus);
router.patch('/complaints/:id/assign', assignDepartment);

export default router;
