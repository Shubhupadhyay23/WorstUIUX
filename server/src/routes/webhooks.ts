import { Router } from 'express';
import { handleN8nCallback } from '../controllers/webhook.controller';

const router = Router();

router.post('/n8n-callback', handleN8nCallback);

export default router;
