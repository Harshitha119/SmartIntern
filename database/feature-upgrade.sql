-- Run once in smartintern_db using psql.
CREATE TABLE IF NOT EXISTS inbox_messages (
  message_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  CHECK (sender_id <> recipient_id),
  CHECK (length(trim(body)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_inbox_recipient_created
  ON inbox_messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_sender_created
  ON inbox_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_generated
  ON recommendation_runs(user_id, generated_at DESC);
