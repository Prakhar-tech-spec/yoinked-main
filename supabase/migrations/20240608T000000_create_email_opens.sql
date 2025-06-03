CREATE TABLE IF NOT EXISTS email_opens (
  id SERIAL PRIMARY KEY,
  campaign_id UUID,
  email_id UUID,
  recipient TEXT,
  opened_at TIMESTAMP DEFAULT NOW()
); 