-- FLAGSTAR BANK - DEMO PROVISIONING SCRIPT
-- Provisions the Master Admin and Ledger Environment

-- 1. Create Demo Admin (Note: Password must be hashed if inserting directly into auth.users, 
-- but we recommend using the UI to sign up the first admin or using this script for the profiles/admins table)

-- This script assumes you have already signed up tochizadmin@flagstarbank.com via Supabase Auth
-- or that we are manually linking a known UID.

-- FOR SIMULATION: We will create an RPC to "force create" the admin if it doesn't exist.
CREATE OR REPLACE FUNCTION provision_demo_admin(p_email TEXT, p_name TEXT, p_auth_uid UUID) 
RETURNS VOID AS $$
BEGIN
  INSERT INTO admins (auth_user_id, full_name, email, permissions)
  VALUES (p_auth_uid, p_name, p_email, '{"super_admin": true}')
  ON CONFLICT (auth_user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure initial Ledger state is clean
-- (Handled by v4.0 triggers and functions)
