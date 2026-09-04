-- Allow authenticated users to manage product categories from the admin UI.

CREATE POLICY "Authenticated users can create product categories"
  ON product_categories FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can update product categories"
  ON product_categories FOR UPDATE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product categories"
  ON product_categories FOR DELETE
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);
