-- FLAGSTAR BANK - SIMPLE CENTRALIZED SCHEMA v2.0
-- Optimized for simulation stability

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL, -- Plaintext for simulation simplicity
  balance DECIMAL(15,2) DEFAULT 0.00,
  role TEXT DEFAULT 'member', -- member, admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- credit, debit, transfer
  amount DECIMAL(15,2) NOT NULL,
  narration TEXT,
  status TEXT DEFAULT 'COMPLETED', -- COMPLETED, PENDING, REJECTED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRANSFER CODES & RESTRICTIONS TABLE
CREATE TABLE IF NOT EXISTS transfer_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  cot_enabled BOOLEAN DEFAULT FALSE,
  tax_enabled BOOLEAN DEFAULT FALSE,
  irs_enabled BOOLEAN DEFAULT FALSE,
  cot_code TEXT,
  tax_code TEXT,
  irs_code TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENABLE RLS (Simplified for simulation)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_codes ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES (Allow full access for simulation purposes or refine if needed)
-- In a real app, these would be strictly limited.
CREATE POLICY "Public Read Access" ON customers FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON transfer_codes FOR SELECT USING (true);

-- Allow updates for simulation
CREATE POLICY "Public Update Access" ON customers FOR UPDATE USING (true);
CREATE POLICY "Public Update Access" ON transfer_codes FOR UPDATE USING (true);
CREATE POLICY "Public Insert Access" ON transactions FOR INSERT WITH CHECK (true);
