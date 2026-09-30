import axios from 'axios';

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
        'X-Webhook-Secret': secret || ''
      }
    });
    console.log('[N8N] Complaint event accepted');
    return response.data;
  } catch (error: any) {
    console.error('[N8N] Workflow failed', error.response?.status, error.message);
    return null; // Return null so we don't break complaint creation
  }
};
