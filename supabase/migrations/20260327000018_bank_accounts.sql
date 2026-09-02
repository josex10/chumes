-- Bank accounts catalog and destination account on financial movements.

CREATE TABLE bank_accounts (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL,
  bank_name       TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN ('OPERATING', 'ADVANCES')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE event_financial_movements
  ADD COLUMN bank_account_id BIGINT REFERENCES bank_accounts(id) ON DELETE RESTRICT;

CREATE INDEX event_financial_movements_bank_account_id_idx
  ON event_financial_movements(bank_account_id);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read bank accounts"
  ON bank_accounts FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create bank accounts"
  ON bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update bank accounts"
  ON bank_accounts FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
