-- Quotes module: statuses, line types, taxes, discounts, delivery zones, quotes, and line items.

CREATE TABLE quote_statuses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO quote_statuses (code, name, description) VALUES
  ('DRAFT',                 'Draft',                 'Quote is being composed'),
  ('SENT',                  'Sent',                  'Quote sent to customer'),
  ('CUSTOMER_APPROVED',     'Customer approved',     'Customer accepted the quote'),
  ('PENDING_AVAILABILITY',  'Pending availability',  'Awaiting availability check'),
  ('CONVERTED',             'Converted',             'Quote converted to an event'),
  ('REJECTED',              'Rejected',              'Customer declined the quote'),
  ('EXPIRED',               'Expired',               'Quote is no longer valid');

CREATE TABLE quote_line_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO quote_line_types (code, name, description) VALUES
  ('RENTAL',  'Rental',  'Rental line item'),
  ('SALE',    'Sale',    'Sale line item'),
  ('SERVICE', 'Service', 'Service line item');

CREATE TABLE taxes (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  rate        NUMERIC(5, 4) NOT NULL DEFAULT 0,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO taxes (code, name, rate, description) VALUES
  ('EXEMPT', 'Exempt', 0.0000, 'Tax exempt'),
  ('IVA_13', 'IVA 13%', 0.1300, 'Standard VAT');

CREATE TABLE discount_codes (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  value         NUMERIC(12, 2) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO discount_codes (code, name, discount_type, value) VALUES
  ('SALON10', 'Salon 10% off', 'PERCENTAGE', 10.00);

CREATE TABLE delivery_zones (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL,
  suggested_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO delivery_zones (name, suggested_fee) VALUES
  ('San José Metro', 15000.00),
  ('Heredia / Alajuela', 25000.00),
  ('Other', 35000.00);

CREATE TABLE quotes (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number           TEXT NOT NULL UNIQUE,
  customer_id            UUID NOT NULL REFERENCES customers(id),
  status_id              BIGINT NOT NULL REFERENCES quote_statuses(id),
  estimated_location     TEXT,
  delivery_zone_id       BIGINT REFERENCES delivery_zones(id),
  delivery_suggested_fee NUMERIC(12, 2),
  delivery_fee           NUMERIC(12, 2),
  discount_code_id       BIGINT REFERENCES discount_codes(id),
  discount_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal               NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_total              NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total                  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes                  TEXT,
  valid_until            DATE,
  sent_at                TIMESTAMPTZ,
  approved_at            TIMESTAMPTZ,
  rejected_at            TIMESTAMPTZ,
  expired_at             TIMESTAMPTZ,
  is_locked              BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by             TEXT,
  updated_by             TEXT
);

CREATE INDEX quotes_customer_id_idx ON quotes(customer_id);
CREATE INDEX quotes_status_id_idx ON quotes(status_id);

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE quote_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id      UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  line_type_id  BIGINT NOT NULL REFERENCES quote_line_types(id),
  quantity      NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  tax_id        BIGINT REFERENCES taxes(id),
  tax_rate      NUMERIC(5, 4) NOT NULL DEFAULT 0,
  tax_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_total    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX quote_items_quote_id_idx ON quote_items(quote_id);

ALTER TABLE quote_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read quote statuses"
  ON quote_statuses FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read quote line types"
  ON quote_line_types FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read taxes"
  ON taxes FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read discount codes"
  ON discount_codes FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read delivery zones"
  ON delivery_zones FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read quote items"
  ON quote_items FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can manage quote items"
  ON quote_items FOR ALL
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
