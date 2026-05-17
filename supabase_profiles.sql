-- FLAGSTAR BANK - ARCHITECTURE HARDENING v4.0 (Gravity-Neutral)
-- Single source of truth for identity and roles

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  account_number TEXT UNIQUE,
  pin TEXT,
  balance DECIMAL(15,2) DEFAULT 0.00,
  kyc_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles read access" ON profiles FOR SELECT USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Profiles update access" ON profiles FOR UPDATE USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Profiles insert access" ON profiles FOR INSERT WITH CHECK (
  true -- Simulation mode: allow inserts from client
);
