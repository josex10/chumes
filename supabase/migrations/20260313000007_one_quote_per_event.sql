-- Enforce at most one quote linked per event.

CREATE UNIQUE INDEX quotes_one_per_event_idx
  ON quotes (event_id)
  WHERE event_id IS NOT NULL;
