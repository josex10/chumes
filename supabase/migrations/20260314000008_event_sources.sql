-- Event sources (campaigns/channels) linked to events.

CREATE TABLE event_sources (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO event_sources (code, name, description, sort_order) VALUES
  ('WHATSAPP',  'WhatsApp',          'WhatsApp messages and groups', 10),
  ('INSTAGRAM', 'Instagram',         'Instagram DMs and profile',    20),
  ('FACEBOOK',  'Facebook',          'Facebook messages and ads',    30),
  ('REFERRAL',  'Referido',          'Customer referral',            40),
  ('WALK_IN',   'Presencial',        'Walk-in or in-person',         50),
  ('PHONE',     'Teléfono',          'Phone call',                   60),
  ('EMAIL',     'Email',             'Email inquiry',                70),
  ('OTHER',     'Otro',              'Other source',                 80);

ALTER TABLE events ADD COLUMN source_id BIGINT REFERENCES event_sources(id);

UPDATE events e
SET source_id = es.id
FROM event_sources es
WHERE e.source IS NOT NULL
  AND upper(trim(e.source)) = es.code
  AND e.source_id IS NULL;

UPDATE events
SET source_id = (SELECT id FROM event_sources WHERE code = 'OTHER' LIMIT 1)
WHERE source_id IS NULL;

ALTER TABLE events ALTER COLUMN source_id SET NOT NULL;

ALTER TABLE events DROP COLUMN source;

CREATE INDEX events_source_id_idx ON events(source_id);

CREATE TRIGGER event_sources_updated_at
  BEFORE UPDATE ON event_sources
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE event_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read event sources"
  ON event_sources FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create event sources"
  ON event_sources FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update event sources"
  ON event_sources FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
