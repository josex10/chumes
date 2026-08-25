-- Follow-up sequences, message templates, and per-event contact history.

ALTER TABLE events
  ADD COLUMN follow_up_paused_at TIMESTAMPTZ;

CREATE TABLE follow_up_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  body        TEXT NOT NULL,
  step        SMALLINT NOT NULL CHECK (step IN (1, 2, 3)),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_follow_ups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  step          SMALLINT NOT NULL CHECK (step IN (1, 2, 3)),
  due_at        TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel       TEXT NOT NULL DEFAULT 'whatsapp',
  template_id   UUID REFERENCES follow_up_templates(id) ON DELETE SET NULL,
  message_body  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    TEXT,
  UNIQUE (event_id, step)
);

CREATE INDEX event_follow_ups_event_id_idx ON event_follow_ups(event_id);
CREATE INDEX event_follow_ups_completed_at_idx ON event_follow_ups(completed_at DESC);
CREATE INDEX events_follow_up_paused_at_idx ON events(follow_up_paused_at);

CREATE TRIGGER follow_up_templates_updated_at
  BEFORE UPDATE ON follow_up_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

INSERT INTO follow_up_templates (name, body, step, sort_order) VALUES
  (
    'Primer seguimiento',
    $body$Hola {{nombre}} 👋

Te escribo de Chumes Todo en Mantelería por tu consulta de *{{evento}}*.

¿Seguís interesado/a? Con gusto te ayudo con la cotización o cualquier duda.

¡Quedo atento!$body$,
    1,
    10
  ),
  (
    'Segundo seguimiento',
    $body$Hola {{nombre}},

Te vuelvo a escribir por *{{evento}}*.
{{fecha}}
{{ubicacion}}
{{monto}}

¿Querés que te arme la cotización o tenés alguna duda?

Quedo atento.$body$,
    2,
    20
  ),
  (
    'Tercer seguimiento',
    $body$Hola {{nombre}},

Te escribo una última vez por *{{evento}}*.
{{fecha}}

Si todavía te interesa la mantelería, avísame y lo dejamos listo. Si por ahora no, no hay problema.

Quedo atento.$body$,
    3,
    30
  );

ALTER TABLE follow_up_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read follow-up templates"
  ON follow_up_templates FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create follow-up templates"
  ON follow_up_templates FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update follow-up templates"
  ON follow_up_templates FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read event follow-ups"
  ON event_follow_ups FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create event follow-ups"
  ON event_follow_ups FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);
