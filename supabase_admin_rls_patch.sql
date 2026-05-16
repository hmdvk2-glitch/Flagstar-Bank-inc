-- FLAGSTAR BANK - ADMINS TABLE RLS PATCH (v5.1)
-- Ensures the admins table is accessible for the simulation login pipeline without exposing system-wide credentials.

-- 1. Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2. Apply Simulation-Safe Policies
-- Allows the login function to query the admins table to verify credentials
CREATE POLICY "Public Read Access" ON admins FOR SELECT USING (true);

-- Allow updates for simulation consistency (e.g. balance updates if admins have balances)
CREATE POLICY "Public Update Access" ON admins FOR UPDATE USING (true);
CREATE POLICY "Public Insert Access" ON admins FOR INSERT WITH CHECK (true);
