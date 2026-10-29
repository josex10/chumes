-- Reduced 2% VAT, selectable on quote lines and delivery like IVA 13% and exempt.

INSERT INTO taxes (code, name, rate, description)
VALUES ('IVA_2', 'IVA 2%', 0.0200, 'IVA reducido al 2%')
ON CONFLICT (code) DO NOTHING;
