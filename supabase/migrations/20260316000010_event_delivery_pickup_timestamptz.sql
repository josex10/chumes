-- Store delivery and pickup with time for operational scheduling.

ALTER TABLE events
  ALTER COLUMN delivery_date TYPE TIMESTAMPTZ USING (
    CASE
      WHEN delivery_date IS NULL THEN NULL
      ELSE delivery_date::timestamptz
    END
  ),
  ALTER COLUMN pickup_date TYPE TIMESTAMPTZ USING (
    CASE
      WHEN pickup_date IS NULL THEN NULL
      ELSE pickup_date::timestamptz
    END
  );
