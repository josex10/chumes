-- Manual discounts on quotes (without requiring a discount code).

ALTER TABLE quotes
  ADD COLUMN manual_discount_type TEXT CHECK (manual_discount_type IN ('PERCENTAGE', 'FIXED')),
  ADD COLUMN manual_discount_value NUMERIC(12, 2);
