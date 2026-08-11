-- Customer types and customers tables.

CREATE TABLE customer_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO customer_types (code, name, description) VALUES
  ('INDIVIDUAL',    'Persona física',   'Individual customer'),
  ('COMPANY',       'Empresa',          'Business customer'),
  ('GOVERNMENT',    'Gobierno',         'Government entity'),
  ('EVENT_PLANNER', 'Event Planner',    'Event planning company'),
  ('VENUE',         'Salón de eventos', 'Event venue');

CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  identification   TEXT,
  customer_type_id BIGINT NOT NULL REFERENCES customer_types(id),
  email            TEXT,
  phone            TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE customer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read customer types"
  ON customer_types FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
