-- Public catalog: product visibility, slugs, images, and website event source.

ALTER TABLE products
  ADD COLUMN slug TEXT,
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

UPDATE products
SET slug = lower(
  regexp_replace(
    regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+',
    '-',
    'g'
  )
) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX products_slug_key ON products (slug);

CREATE TABLE product_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text     TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  is_primary   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX product_images_product_id_idx ON product_images (product_id, sort_order);

INSERT INTO event_sources (code, name, description, sort_order) VALUES
  ('WEBSITE', 'Sitio web', 'Solicitud desde el catálogo público', 5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read product images"
  ON product_images FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can create product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Public read product image files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product image files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated update product image files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated delete product image files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND requesting_user_id() IS NOT NULL);
