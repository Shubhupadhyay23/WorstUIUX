const fs = require('fs');
const path = require('path');

const serverDir = path.join('/Users/shubhamupadhyay/build to ship', 'server');

// 1. Update .env and .env.example
const envPath = path.join(serverDir, '.env');
const envExamplePath = path.join(serverDir, '.env.example');

if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('N8N_CIVIC_WEBHOOK_URL')) {
        envContent += '\nN8N_CIVIC_WEBHOOK_URL=https://your-n8n-domain/webhook/civicfix/new-complaint\nN8N_WEBHOOK_SECRET=your-n8n-secret\nN8N_BACKEND_SECRET=your-backend-secret\n';
        fs.writeFileSync(envPath, envContent);
    }
}

if (fs.existsSync(envExamplePath)) {
    let envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    if (!envExampleContent.includes('N8N_CIVIC_WEBHOOK_URL')) {
        envExampleContent += '\nN8N_CIVIC_WEBHOOK_URL=\nN8N_WEBHOOK_SECRET=\nN8N_BACKEND_SECRET=\n';
        fs.writeFileSync(envExamplePath, envExampleContent);
    }
} else {
    fs.writeFileSync(envExamplePath, 'N8N_CIVIC_WEBHOOK_URL=\nN8N_WEBHOOK_SECRET=\nN8N_BACKEND_SECRET=\n');
}

// 2. n8n.schema.ts
const schemasDir = path.join(serverDir, 'src', 'schemas');
if (!fs.existsSync(schemasDir)) fs.mkdirSync(schemasDir, { recursive: true });

fs.writeFileSync(path.join(schemasDir, 'n8n.schema.ts'), `import { z } from 'zod';

export const n8nCallbackSchema = z.object({
  workflow: z.string().optional(),
  complaint_id: z.string(),
  event_type: z.string(),
  priority: z.string().optional(),
  severity: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  notification: z.object({
    type: z.string(),
    title: z.string(),
    message: z.string()
  }).optional(),
  requires_immediate_attention: z.boolean().optional(),
  idempotency_key: z.string(),
  processed_at: z.string().optional()
});
`);

// 3. n8n.service.ts
const servicesDir = path.join(serverDir, 'src', 'services');
fs.writeFileSync(path.join(servicesDir, 'n8n.service.ts'), `import axios from 'axios';

export const triggerComplaintCreatedWorkflow = async (payload: any) => {
  const url = process.env.N8N_CIVIC_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!url) {
    console.error('[N8N] Webhook URL not configured');
    return null;
  }

  try {
    console.log('[N8N] Sending complaint event');
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-civicfix-secret': secret || ''
      }
    });
    console.log('[N8N] Complaint event accepted');
    return response.data;
  } catch (error: any) {
    console.error('[N8N] Workflow failed', error.response?.status, error.message);
    return null; // Return null so we don't break complaint creation
  }
};
`);

// 4. internal.routes.ts
const routesDir = path.join(serverDir, 'src', 'routes');
fs.writeFileSync(path.join(routesDir, 'internal.routes.ts'), `import { Router, Request, Response } from 'express';
import { n8nCallbackSchema } from '../schemas/n8n.schema';
import { query } from '../db';

const router = Router();

router.post('/n8n/events', async (req: Request, res: Response) => {
  try {
    const secret = req.headers['x-n8n-secret'];
    if (!secret || secret !== process.env.N8N_BACKEND_SECRET) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log('[N8N] Callback received');
    const data = n8nCallbackSchema.parse(req.body);

    // Check idempotency
    const existing = await query('SELECT id FROM automation_events WHERE idempotency_key = $1', [data.idempotency_key]);
    if (existing.rows.length > 0) {
      console.log('[N8N] Duplicate event ignored');
      return res.status(200).json({ success: true, message: 'Automation event already recorded' });
    }

    // Insert automation event
    await query(
      \`INSERT INTO automation_events (complaint_id, workflow_name, event_type, status, payload, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6)\`,
      [data.complaint_id, data.workflow || 'new-complaint', data.event_type, 'COMPLETED', JSON.stringify(data), data.idempotency_key]
    );

    // Insert notification if present
    if (data.notification) {
      // get user_id from complaint
      const complaintInfo = await query('SELECT user_id FROM complaints WHERE id = $1', [data.complaint_id]);
      if (complaintInfo.rows.length > 0) {
        const userId = complaintInfo.rows[0].user_id;
        await query(
          \`INSERT INTO notifications (user_id, complaint_id, type, title, message)
           VALUES ($1, $2, $3, $4, $5)\`,
          [userId, data.complaint_id, data.notification.type, data.notification.title, data.notification.message]
        );
      }
    }

    console.log('[N8N] Automation event saved');
    return res.status(200).json({ success: true, message: 'Automation event recorded' });
  } catch (e: any) {
    console.error('[N8N] Callback error', e);
    return res.status(400).json({ success: false, error: 'Invalid automation event' });
  }
});

export default router;
`);

// 5. Update index.ts to use internal routes
const indexPath = path.join(serverDir, 'src', 'index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');
if (!indexContent.includes('internalRoutes')) {
    indexContent = indexContent.replace(
        "import adminRoutes from './routes/admin';",
        "import adminRoutes from './routes/admin';\nimport internalRoutes from './routes/internal.routes';"
    );
    indexContent = indexContent.replace(
        "app.use('/api/admin', adminRoutes);",
        "app.use('/api/admin', adminRoutes);\napp.use('/api/internal', internalRoutes);"
    );
    fs.writeFileSync(indexPath, indexContent);
}

// 6. Update complaints.controller.ts
const complaintsControllerPath = path.join(serverDir, 'src', 'controllers', 'complaints.controller.ts');
let ccContent = fs.readFileSync(complaintsControllerPath, 'utf8');

ccContent = ccContent.replace(
    "import { triggerWorkflow } from '../services/n8n.service';",
    "import { triggerComplaintCreatedWorkflow } from '../services/n8n.service';"
);

ccContent = ccContent.replace(
    `const payload = { complaintId, title: data.title, userId, ...aiResult };
    await triggerWorkflow('NEW_COMPLAINT', payload);`,
    `const payload = {
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
      idempotency_key: \`\${complaintId}:complaint.created\`,
      timestamp: new Date().toISOString()
    };
    triggerComplaintCreatedWorkflow(payload); // Async, do not block`
);

fs.writeFileSync(complaintsControllerPath, ccContent);

console.log("Files updated successfully.");

