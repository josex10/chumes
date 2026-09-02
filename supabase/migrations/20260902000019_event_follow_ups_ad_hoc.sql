-- Allow ad-hoc WhatsApp contacts (e.g. close-this-week) without consuming
-- cadence steps 1–3. Multiple null-step rows per event are allowed.

ALTER TABLE event_follow_ups
  DROP CONSTRAINT IF EXISTS event_follow_ups_event_id_step_key;

ALTER TABLE event_follow_ups
  DROP CONSTRAINT IF EXISTS event_follow_ups_step_check;

ALTER TABLE event_follow_ups
  ALTER COLUMN step DROP NOT NULL;

ALTER TABLE event_follow_ups
  ADD CONSTRAINT event_follow_ups_step_check
  CHECK (step IS NULL OR step IN (1, 2, 3));

CREATE UNIQUE INDEX event_follow_ups_event_id_step_key
  ON event_follow_ups (event_id, step)
  WHERE step IS NOT NULL;
