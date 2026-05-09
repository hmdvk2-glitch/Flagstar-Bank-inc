-- FLAGSTAR BANK - SUPABASE SCHEMA v1.0
-- PHASE 4 & 5 IMPLEMENTATION

-- 1. CUSTOMERS TABLE
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  role TEXT DEFAULT 'member',
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACCOUNTS TABLE (Sub-accounts)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Checking, Savings, Holiday
  account_number TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  from_account TEXT,
  to_account TEXT,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL, -- credit, debit, transfer
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'APPROVED', -- PENDING, APPROVED, REJECTED
  stage TEXT DEFAULT 'INIT', -- COT, TAX, IRS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRANSFER CODES (Simulation support)
CREATE TABLE transfer_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  cot_code TEXT,
  tax_code TEXT,
  irs_code TEXT,
  status TEXT DEFAULT 'active'
);

-- 5. ENABLE RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_codes ENABLE ROW LEVEL SECURITY;

-- 6. BASIC POLICIES
CREATE POLICY "Users can view own data" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT 
  USING (account_id IN (SELECT id FROM accounts WHERE customer_id = auth.uid()));
