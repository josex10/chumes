INSERT INTO product_categories (code, name, description) VALUES
  ('TENTS', 'Toldos', 'Toldos profesionales para eventos al aire libre'),
  ('COCKTAIL_TABLES', 'Mesas cocteleras', 'Mesas altas para eventos sociales y corporativos')
ON CONFLICT (code) DO NOTHING;
