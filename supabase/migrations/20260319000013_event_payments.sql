-- Payment methods catalog and event financial movements (advances + refunds).

CREATE TABLE payment_methods (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO payment_methods (code, name, sort_order) VALUES
  ('SINPE',    'Sinpe',         10),
  ('CASH',     'Efectivo',      20),
  ('CARD',     'Tarjeta',       30),
  ('TRANSFER', 'Transferencia', 40);

CREATE TABLE event_financial_movements (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  movement_type      TEXT NOT NULL CHECK (movement_type IN ('ADVANCE', 'REFUND')),
  amount             NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method_id  BIGINT NOT NULL REFERENCES payment_methods(id),
  movement_date      TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by         TEXT,
  updated_by         TEXT
);

CREATE INDEX event_financial_movements_event_id_idx
  ON event_financial_movements(event_id);

CREATE INDEX event_financial_movements_movement_date_idx
  ON event_financial_movements(movement_date DESC);

CREATE TRIGGER payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER event_financial_movements_updated_at
  BEFORE UPDATE ON event_financial_movements
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_financial_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read event financial movements"
  ON event_financial_movements FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create event financial movements"
  ON event_financial_movements FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update event financial movements"
  ON event_financial_movements FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete event financial movements"
  ON event_financial_movements FOR DELETE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);
