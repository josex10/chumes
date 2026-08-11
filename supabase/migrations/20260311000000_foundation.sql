-- Foundation migration: RLS helper for Clerk-authenticated users.
-- Clerk user IDs are read from JWT claims, not Supabase auth.uid().

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$;

-- RLS policy patterns for future migrations:
--
-- Authenticated-only read access:
--   CREATE POLICY "Authenticated users can read"
--     ON some_table FOR SELECT
--     TO authenticated
--     USING (requesting_user_id() IS NOT NULL);
--
-- User-owned rows:
--   CREATE POLICY "Users manage own rows"
--     ON some_table FOR ALL
--     TO authenticated
--     USING (created_by = requesting_user_id());
