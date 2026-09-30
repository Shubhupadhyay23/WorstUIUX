# n8n Automation Setup Guide

CivicFix AI utilizes n8n for robust background automations (Escalations, Notifications, Duplicate checks).

## Configuration Steps

1. **Create an n8n webhook node**
   - Method: POST
   - URL: Note the generated Webhook URL (Test & Production).
   - Authentication: Setup Header Auth -> `Authorization : Bearer YOUR_SECRET`

2. **Backend Configuration**
   - Set `N8N_CIVIC_WEBHOOK_URL` in your `.env` file to match the URL from n8n.
   - Set `N8N_WEBHOOK_SECRET` to the secret you chose in Step 1.

3. **Handle Incoming Events**
   - CivicFix will send events in the following structure:
     ```json
     {
       "event_type": "NEW_COMPLAINT",
       "timestamp": "2024-01-01T12:00:00Z",
       "payload": {
         "complaintId": "uuid",
         "title": "Pothole",
         "severity": "HIGH",
         "priority": 8
       }
     }
     ```
   - Use a Switch node in n8n to route `NEW_COMPLAINT`, `STATUS_UPDATE`, or `DEPARTMENT_ASSIGNED` events.
