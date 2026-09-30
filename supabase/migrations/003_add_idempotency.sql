ALTER TABLE automation_events ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
