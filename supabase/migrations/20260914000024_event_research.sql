-- Product research requests on events, with an append-only progress log.

CREATE TABLE event_research_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN', 'WAITING_CLIENT', 'DONE')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  created_by    TEXT,
  updated_by    TEXT
);

CREATE INDEX event_research_requests_event_id_idx
  ON event_research_requests (event_id);

CREATE INDEX event_research_requests_open_idx
  ON event_research_requests (event_id, created_at)
  WHERE status IN ('OPEN', 'WAITING_CLIENT');

CREATE TRIGGER event_research_requests_updated_at
  BEFORE UPDATE ON event_research_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE event_research_updates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID NOT NULL REFERENCES event_research_requests(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('NOTE', 'WHATSAPP')),
  body          TEXT NOT NULL,
  message_body  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    TEXT
);

CREATE INDEX event_research_updates_request_id_idx
  ON event_research_updates (request_id, created_at);

ALTER TABLE event_research_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_research_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read event research requests"
  ON event_research_requests FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create event research requests"
  ON event_research_requests FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update event research requests"
  ON event_research_requests FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read event research updates"
  ON event_research_updates FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create event research updates"
  ON event_research_updates FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

INSERT INTO follow_up_templates (name, body, step, sort_order) VALUES
  (
    'Actualización de investigación',
    $body$Hola {{nombre}} 👋

Te escribo de Chumes por *{{evento}}*, sobre *{{solicitud}}*.
{{fecha}}
{{ubicacion}}

Ya estoy revisando opciones y te aviso en cuanto tenga novedades.

¡Quedo atento!$body$,
    1,
    5
  );
