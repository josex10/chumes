-- Roles, profile statuses, and profiles with approval workflow.

CREATE TABLE roles (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (code, name, description) VALUES
  ('ADMIN',    'Admin',    'Full system access'),
  ('MANAGER',  'Manager',  'Operational management'),
  ('OPERATOR', 'Operator', 'Day-to-day operations');

CREATE TABLE profile_statuses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO profile_statuses (code, name, description) VALUES
  ('PENDING',  'Pending',  'Awaiting admin approval'),
  ('APPROVED', 'Approved', 'Active user with app access'),
  ('REJECTED', 'Rejected', 'Access denied by admin');

CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role_id       BIGINT REFERENCES roles(id),
  status_id     BIGINT NOT NULL REFERENCES profile_statuses(id),
  approved_at   TIMESTAMPTZ,
  approved_by   UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read profile statuses"
  ON profile_statuses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (clerk_user_id = requesting_user_id());
