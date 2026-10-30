-- Record that delivery hours were confirmed with the client.

ALTER TABLE event_logistics
  ADD COLUMN hours_confirmed_at TIMESTAMPTZ;
