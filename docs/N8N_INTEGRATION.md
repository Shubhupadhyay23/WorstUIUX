# n8n Integration

## Flow
1. **Frontend**: React submits a complaint to the backend.
2. **Backend (Express)**: Saves complaint to PostgreSQL, then asks Gemini for AI classification.
3. **Database**: Saves Gemini's response (severity, priority, category).
4. **Backend (Express)**: Asynchronously triggers n8n webhook (\`N8N_CIVIC_WEBHOOK_URL\`) with the \`complaint.created\` event and complaint details.
5. **n8n Workflow**:
   - Evaluates the priority/severity.
   - If HIGH priority: Triggers escalation logic.
   - If NORMAL priority: Triggers normal processing.
   - In both cases, sends a callback POST request to the backend.
6. **Backend (Express)**: Receives the webhook from n8n at \`/api/internal/n8n/events\`, validates the \`x-n8n-secret\`, and saves the automation event and notification to the database.
7. **Frontend**: The user sees the notification on their dashboard.

## Configuration
Configure the following in \`server/.env\`:
- \`N8N_CIVIC_WEBHOOK_URL\`: Your production n8n webhook URL.
- \`N8N_WEBHOOK_SECRET\`: The secret sent to n8n from the backend.
- \`N8N_BACKEND_SECRET\`: The secret n8n sends to the backend for the callback endpoint.

