-- Fixed delivery crew stored as codes. The roster lives in the app, not a CRUD catalog.

ALTER TABLE event_logistics
  ADD COLUMN assignee_codes TEXT[] NOT NULL DEFAULT '{}';
