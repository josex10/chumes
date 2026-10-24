-- Category visibility on the public storefront (mirrors products.is_public).

ALTER TABLE product_categories
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

UPDATE product_categories
SET is_public = true
WHERE is_active = true
  AND code IN (
    'TABLES',
    'CHAIRS',
    'TABLE_LINENS',
    'CHAIR_COVERS',
    'DECORATION',
    'ACCESSORIES',
    'TENTS',
    'COCKTAIL_TABLES'
  );
