-- Visual options for the public "Armar tu mesa" configurator.
-- product_id is optional: link catalog products by slug after they exist.

CREATE TABLE product_setup_options (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot           TEXT NOT NULL CHECK (slot IN ('table', 'chair', 'linen', 'overlay', 'cover')),
  variant_key    TEXT NOT NULL,
  label          TEXT NOT NULL,
  preview_color  TEXT NOT NULL,
  finish         TEXT NOT NULL DEFAULT 'matte' CHECK (finish IN ('matte', 'satin')),
  suggested_slug TEXT,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot, variant_key)
);

CREATE INDEX product_setup_options_slot_idx
  ON product_setup_options (slot, sort_order);

INSERT INTO product_setup_options
  (slot, variant_key, label, preview_color, finish, suggested_slug, sort_order)
VALUES
  ('table',  'round',        'Circular',      '#c4a574', 'matte', 'mesa-circular',           1),
  ('table',  'rect',         'Rectangular',   '#c4a574', 'matte', 'mesa-rectangular',        2),
  ('chair',  'folding',      'Plegable',      '#8a8f98', 'matte', 'silla-plegable',          1),
  ('chair',  'tiffany',      'Tiffany',       '#d4af37', 'satin', 'silla-tiffany',           2),
  ('linen',  'white',        'Blanco',        '#f4f1ea', 'matte', 'mantel-blanco',           1),
  ('linen',  'ivory',        'Ivory',         '#f3e6c8', 'matte', 'mantel-ivory',            2),
  ('linen',  'beige',        'Beige',         '#d9c3a3', 'matte', 'mantel-beige',            3),
  ('linen',  'black',        'Negro',         '#1f1f1f', 'matte', 'mantel-negro',            4),
  ('overlay','white',        'Blanco',        '#ffffff', 'satin', 'sobre-mantel-blanco',     1),
  ('overlay','ivory',        'Ivory',         '#efe1b8', 'satin', 'sobre-mantel-ivory',      2),
  ('overlay','gold',         'Dorado',        '#c9a227', 'satin', 'sobre-mantel-dorado',     3),
  ('overlay','burgundy',     'Vino',          '#6b1d2a', 'satin', 'sobre-mantel-vino',       4),
  ('overlay','black',        'Negro',         '#111111', 'satin', 'sobre-mantel-negro',      5),
  ('cover',  'white',        'Forro blanco',  '#f7f4ee', 'matte', 'forro-blanco',            1),
  ('cover',  'black',        'Forro negro',   '#1a1a1a', 'matte', 'forro-negro',             2),
  ('cover',  'white-lycra',  'Licra blanca',  '#f7f4ee', 'satin', 'forro-licra-blanco',      3),
  ('cover',  'black-lycra',  'Licra negra',   '#1a1a1a', 'satin', 'forro-licra-negro',       4);

UPDATE product_setup_options AS option
SET product_id = product.id
FROM products AS product
WHERE option.suggested_slug IS NOT NULL
  AND product.slug = option.suggested_slug
  AND option.product_id IS NULL;

ALTER TABLE product_setup_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read setup options"
  ON product_setup_options FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update setup options"
  ON product_setup_options FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
