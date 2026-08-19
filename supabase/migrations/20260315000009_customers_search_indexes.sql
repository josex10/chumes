-- Indexes for customer list ordering and dashboard queries.

CREATE INDEX customers_name_idx ON customers (name);
CREATE INDEX customers_created_at_idx ON customers (created_at DESC);
