-- Product catalog: categories, types, products, prices, costs, and bundles.

CREATE TABLE product_categories (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO product_categories (code, name, description) VALUES
  ('TABLE_LINENS',  'Mantelería',      'Table linens and cloths'),
  ('CHAIR_COVERS',  'Forros de silla', 'Chair covers'),
  ('CHAIRS',        'Sillas',          'Chairs'),
  ('TABLES',        'Mesas',           'Tables'),
  ('DECORATION',    'Decoración',      'Decoration items'),
  ('ACCESSORIES',   'Accesorios',      'Accessories'),
  ('OTHER',         'Otros',           'Other products');

CREATE TABLE product_tracking_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO product_tracking_types (code, name, description) VALUES
  ('QUANTITY', 'Cantidad', 'Tracked by quantity'),
  ('ASSET',    'Activo',   'Individual asset tracking (future)');

CREATE TABLE product_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO product_types (code, name, description) VALUES
  ('SIMPLE', 'Simple',  'Single physical product'),
  ('BUNDLE', 'Paquete', 'Commercial bundle of components');

CREATE TABLE product_price_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO product_price_types (code, name, description) VALUES
  ('RENTAL', 'Alquiler', 'Rental price'),
  ('SALE',   'Venta',    'Sale price');

CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_number   TEXT NOT NULL UNIQUE,
  category_id      BIGINT NOT NULL REFERENCES product_categories(id),
  tracking_type_id BIGINT NOT NULL REFERENCES product_tracking_types(id),
  product_type_id  BIGINT NOT NULL REFERENCES product_types(id),
  name             TEXT NOT NULL,
  description      TEXT,
  rental_available BOOLEAN NOT NULL DEFAULT true,
  sale_available   BOOLEAN NOT NULL DEFAULT false,
  minimum_stock    NUMERIC(12, 2),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       TEXT,
  updated_by       TEXT
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE product_prices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price_type_id  BIGINT NOT NULL REFERENCES product_price_types(id),
  amount         NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to   DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by     TEXT
);

CREATE TABLE product_costs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cost           NUMERIC(12, 2) NOT NULL CHECK (cost >= 0),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to   DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by     TEXT
);

CREATE TABLE product_bundle_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity             NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by           TEXT,
  UNIQUE (bundle_product_id, component_product_id),
  CHECK (bundle_product_id <> component_product_id)
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tracking_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read product categories"
  ON product_categories FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read product tracking types"
  ON product_tracking_types FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read product types"
  ON product_types FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read product price types"
  ON product_price_types FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read product prices"
  ON product_prices FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can manage product prices"
  ON product_prices FOR ALL
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read product costs"
  ON product_costs FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can manage product costs"
  ON product_costs FOR ALL
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read product bundle items"
  ON product_bundle_items FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can manage product bundle items"
  ON product_bundle_items FOR ALL
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
