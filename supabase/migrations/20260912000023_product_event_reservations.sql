-- Product reservation lookup: events that demand a product via the linked quote,
-- including one-level bundle expansion. Used by the product edit Reservas tab.

CREATE INDEX quote_items_product_id_idx ON quote_items (product_id);

CREATE INDEX product_bundle_items_component_product_id_idx
  ON product_bundle_items (component_product_id);

CREATE OR REPLACE FUNCTION list_product_event_reservations(
  p_product_id uuid,
  p_phase text,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  event_id uuid,
  event_title text,
  event_date date,
  customer_name text,
  status_name text,
  status_code text,
  quantity numeric,
  total_count bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH demand AS (
    SELECT
      q.event_id,
      qi.quantity AS quantity
    FROM quote_items qi
    JOIN quotes q ON q.id = qi.quote_id
    WHERE qi.product_id = p_product_id
      AND q.event_id IS NOT NULL

    UNION ALL

    SELECT
      q.event_id,
      qi.quantity * pbi.quantity AS quantity
    FROM product_bundle_items pbi
    JOIN quote_items qi ON qi.product_id = pbi.bundle_product_id
    JOIN quotes q ON q.id = qi.quote_id
    WHERE pbi.component_product_id = p_product_id
      AND q.event_id IS NOT NULL
  ),
  aggregated AS (
    SELECT
      e.id AS event_id,
      e.title AS event_title,
      e.event_date,
      c.name AS customer_name,
      es.name AS status_name,
      es.code AS status_code,
      SUM(d.quantity) AS quantity
    FROM demand d
    JOIN events e ON e.id = d.event_id
    JOIN event_statuses es ON es.id = e.status_id
    JOIN customers c ON c.id = e.customer_id
    WHERE es.phase = p_phase
    GROUP BY e.id, e.title, e.event_date, c.name, es.name, es.code
  )
  SELECT
    a.event_id,
    a.event_title,
    a.event_date,
    a.customer_name,
    a.status_name,
    a.status_code,
    a.quantity,
    COUNT(*) OVER() AS total_count
  FROM aggregated a
  ORDER BY
    CASE
      WHEN a.event_date IS NULL THEN 1
      WHEN a.event_date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Costa_Rica')::date) THEN 0
      ELSE 2
    END,
    a.event_date ASC NULLS LAST,
    a.event_title ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 100))
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;
