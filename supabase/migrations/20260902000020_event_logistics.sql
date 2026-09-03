-- Per-event warehouse prep steps and delivery/pickup confirmation timestamps.

CREATE TABLE event_logistics (
  event_id               UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  inventory_checked_at   TIMESTAMPTZ,
  pulled_at              TIMESTAMPTZ,
  repaired_at            TIMESTAMPTZ,
  ironed_at              TIMESTAMPTZ,
  packed_at              TIMESTAMPTZ,
  delivered_at           TIMESTAMPTZ,
  picked_up_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX event_logistics_delivered_at_idx ON event_logistics (delivered_at);
CREATE INDEX event_logistics_picked_up_at_idx ON event_logistics (picked_up_at);

CREATE TRIGGER event_logistics_updated_at
  BEFORE UPDATE ON event_logistics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE event_logistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read event logistics"
  ON event_logistics FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create event logistics"
  ON event_logistics FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update event logistics"
  ON event_logistics FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
