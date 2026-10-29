-- Operating expenses and owner investments repaid by the company.
-- Company payment methods are separate from customer payment_methods.

CREATE TABLE expense_categories (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  requires_detail BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX expense_categories_name_lower_idx
  ON expense_categories (lower(name));

CREATE TRIGGER expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

INSERT INTO expense_categories (code, name, requires_detail, sort_order) VALUES
  ('SUPPLIES', 'Insumos', false, 10),
  ('FUEL', 'Gasolina', false, 20),
  ('PER_DIEM', 'Viáticos', false, 30),
  ('FLASH', 'Compra flash', true, 40),
  ('OTHER', 'Otros', false, 50);

CREATE TABLE company_payment_methods (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX company_payment_methods_name_lower_idx
  ON company_payment_methods (lower(name));

CREATE TRIGGER company_payment_methods_updated_at
  BEFORE UPDATE ON company_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

INSERT INTO company_payment_methods (name, sort_order) VALUES
  ('Efectivo', 10),
  ('Sinpe', 20),
  ('Tarjeta BAC Gris 5018', 30),

CREATE TABLE expenses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id        BIGINT NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  payment_method_id  BIGINT NOT NULL REFERENCES company_payment_methods(id) ON DELETE RESTRICT,
  amount             NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  spent_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  detail             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by         TEXT,
  updated_by         TEXT
);

CREATE INDEX expenses_spent_at_idx ON expenses (spent_at DESC);
CREATE INDEX expenses_category_id_idx ON expenses (category_id);
CREATE INDEX expenses_payment_method_id_idx ON expenses (payment_method_id);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE investment_creditors (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX investment_creditors_name_lower_idx
  ON investment_creditors (lower(name));

CREATE TRIGGER investment_creditors_updated_at
  BEFORE UPDATE ON investment_creditors
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE investments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creditor_id  BIGINT NOT NULL REFERENCES investment_creditors(id) ON DELETE RESTRICT,
  title        TEXT NOT NULL,
  amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  invested_on  DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Costa_Rica')::date,
  status       TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SETTLED')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   TEXT,
  updated_by   TEXT
);

CREATE INDEX investments_creditor_id_idx ON investments (creditor_id);
CREATE INDEX investments_status_idx ON investments (status);

CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE investment_payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id      UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  payment_method_id  BIGINT NOT NULL REFERENCES company_payment_methods(id) ON DELETE RESTRICT,
  amount             NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  paid_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by         TEXT,
  updated_by         TEXT
);

CREATE INDEX investment_payments_investment_id_idx
  ON investment_payments (investment_id, paid_at DESC);
CREATE INDEX investment_payments_payment_method_id_idx
  ON investment_payments (payment_method_id);

CREATE TRIGGER investment_payments_updated_at
  BEFORE UPDATE ON investment_payments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_creditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read expense categories"
  ON expense_categories FOR SELECT TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create expense categories"
  ON expense_categories FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update expense categories"
  ON expense_categories FOR UPDATE TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete expense categories"
  ON expense_categories FOR DELETE TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read company payment methods"
  ON company_payment_methods FOR SELECT TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create company payment methods"
  ON company_payment_methods FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update company payment methods"
  ON company_payment_methods FOR UPDATE TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete company payment methods"
  ON company_payment_methods FOR DELETE TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read expenses"
  ON expenses FOR SELECT TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create expenses"
  ON expenses FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update expenses"
  ON expenses FOR UPDATE TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete expenses"
  ON expenses FOR DELETE TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read investment creditors"
  ON investment_creditors FOR SELECT TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create investment creditors"
  ON investment_creditors FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update investment creditors"
  ON investment_creditors FOR UPDATE TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete investment creditors"
  ON investment_creditors FOR DELETE TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read investments"
  ON investments FOR SELECT TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create investments"
  ON investments FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update investments"
  ON investments FOR UPDATE TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete investments"
  ON investments FOR DELETE TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can read investment payments"
  ON investment_payments FOR SELECT TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create investment payments"
  ON investment_payments FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update investment payments"
  ON investment_payments FOR UPDATE TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete investment payments"
  ON investment_payments FOR DELETE TO authenticated
  USING (requesting_user_id() IS NOT NULL);
