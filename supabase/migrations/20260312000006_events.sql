-- Events module: CRM pipeline + operational workflow.

CREATE TABLE event_statuses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  phase       TEXT NOT NULL CHECK (phase IN ('COMMERCIAL', 'OPERATIONAL', 'TERMINAL')),
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO event_statuses (code, name, description, phase, sort_order) VALUES
  ('INQUIRY',          'Solicitud',           'New inquiry or lead',                    'COMMERCIAL',   10),
  ('FOLLOW_UP',        'En seguimiento',      'Active follow-up with customer',         'COMMERCIAL',   20),
  ('NO_RESPONSE',      'Sin respuesta',       'Customer has not responded',             'COMMERCIAL',   30),
  ('QUOTING',          'Cotizando',           'Quote in progress',                      'COMMERCIAL',   40),
  ('QUOTE_SENT',       'Cotización enviada',  'Quote sent to customer',                 'COMMERCIAL',   50),
  ('QUOTED_NO_DATES',  'Cotizado sin fechas', 'Quoted but event dates missing',         'COMMERCIAL',   60),
  ('APPROVED',         'Aprobada',            'Customer approved commercially',         'COMMERCIAL',   70),
  ('LOST',             'Perdida',             'Deal lost or abandoned',                 'TERMINAL',     80),
  ('RESERVED',         'Reservada',           'Confirmed and inventory reserved',       'OPERATIONAL',  100),
  ('DELIVERED',        'Entregada',           'Equipment delivered',                    'OPERATIONAL',  110),
  ('PICKED_UP',        'Recogida',            'Equipment picked up',                    'OPERATIONAL',  120),
  ('INSPECTION_PENDING', 'Inspección',        'Post-event inspection',                  'OPERATIONAL',  130),
  ('COMPLETED',        'Completada',          'Event completed',                        'TERMINAL',     140),
  ('CANCELLED',        'Cancelada',           'Event cancelled after reservation',      'TERMINAL',     150);

CREATE TABLE customer_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  role_title  TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customer_contacts_customer_id_idx ON customer_contacts(customer_id);

CREATE TRIGGER customer_contacts_updated_at
  BEFORE UPDATE ON customer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT NOT NULL,
  customer_id             UUID NOT NULL REFERENCES customers(id),
  contact_id              UUID REFERENCES customer_contacts(id),
  status_id               BIGINT NOT NULL REFERENCES event_statuses(id),
  source                  TEXT,
  event_date              DATE,
  delivery_date           DATE,
  pickup_date             DATE,
  estimated_location      TEXT,
  notes                   TEXT,
  first_contact_at        TIMESTAMPTZ,
  last_contact_at         TIMESTAMPTZ,
  follow_up_at            TIMESTAMPTZ,
  no_response_at          TIMESTAMPTZ,
  lost_reason             TEXT,
  priority                TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH')),
  has_inventory_conflicts BOOLEAN NOT NULL DEFAULT false,
  reserved_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by              TEXT,
  updated_by              TEXT
);

CREATE INDEX events_customer_id_idx ON events(customer_id);
CREATE INDEX events_status_id_idx ON events(status_id);
CREATE INDEX events_follow_up_at_idx ON events(follow_up_at);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE quotes ADD COLUMN event_id UUID REFERENCES events(id);

CREATE INDEX quotes_event_id_idx ON quotes(event_id);

ALTER TABLE event_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read event statuses"
  ON event_statuses FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read customer contacts"
  ON customer_contacts FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create customer contacts"
  ON customer_contacts FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update customer contacts"
  ON customer_contacts FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read events"
  ON events FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);
