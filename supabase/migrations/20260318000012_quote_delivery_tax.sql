-- Transport tax on quotes (IVA calculated after discount on net base).

ALTER TABLE quotes
  ADD COLUMN delivery_tax_id BIGINT REFERENCES taxes(id),
  ADD COLUMN delivery_tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
