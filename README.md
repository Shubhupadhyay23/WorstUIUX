
## Architecture (Including n8n)
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL / Supabase
- **AI**: Google Gemini
- **Automation**: n8n

See [docs/N8N_INTEGRATION.md](docs/N8N_INTEGRATION.md) for detailed flow and how to configure:
- \`N8N_CIVIC_WEBHOOK_URL\`
- \`N8N_WEBHOOK_SECRET\`
- \`N8N_BACKEND_SECRET\`

To test the n8n integration, create a complaint in the frontend. It will be sent to n8n, which will process it and call the callback endpoint at \`/api/internal/n8n/events\`.
