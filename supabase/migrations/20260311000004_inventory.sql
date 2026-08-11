-- Inventory movements and computed stock balances.

CREATE TABLE inventory_movement_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO inventory_movement_types (code, name) VALUES
  ('INITIAL_LOAD', 'Carga inicial'),
  ('PURCHASE',     'Compra'),
  ('ADJUSTMENT',   'Ajuste'),
  ('DAMAGE',       'Daño'),
  ('LOSS',         'Pérdida'),
  ('EVENT_OUT',    'Salida evento'),
  ('EVENT_RETURN', 'Retorno evento');

CREATE TABLE inventory_movements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type_id BIGINT NOT NULL REFERENCES inventory_movement_types(id),
  quantity         NUMERIC(12, 2) NOT NULL CHECK (quantity <> 0),
  reference_id     UUID,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       TEXT
);

CREATE VIEW product_stock_balances AS
SELECT
  product_id,
  COALESCE(SUM(quantity), 0) AS balance
FROM inventory_movements
GROUP BY product_id;

ALTER TABLE inventory_movement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read inventory movement types"
  ON inventory_movement_types FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read inventory movements"
  ON inventory_movements FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create inventory movements"
  ON inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);
