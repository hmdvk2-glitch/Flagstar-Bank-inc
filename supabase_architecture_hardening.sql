-- FLAGSTAR BANK - ARCHITECTURE HARDENING v3.0
-- Enforces strict separation between Auth, Admin, User, and Ledger layers.

-- 1. USER LAYER (Customer Truth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  kyc_status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADMIN LAYER (Authorization Truth)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL, -- References auth.users(id)
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LEDGER LAYER (Financial Truth)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_account TEXT,
  to_account TEXT,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL, -- credit, debit, transfer
  narration TEXT,
  status TEXT DEFAULT 'COMPLETED',
  stage TEXT DEFAULT 'COMPLETED',
  admin_actor_id UUID REFERENCES admins(id), -- If performed by an admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SECURITY PROTOCOLS (Restrictions)
CREATE TABLE IF NOT EXISTS transfer_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cot_enabled BOOLEAN DEFAULT FALSE,
  tax_enabled BOOLEAN DEFAULT FALSE,
  irs_enabled BOOLEAN DEFAULT FALSE,
  cot_code TEXT,
  tax_code TEXT,
  irs_code TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS POLICIES (Enforcement)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_codes ENABLE ROW LEVEL SECURITY;

-- ADMIN POLICIES: Admins can see everything
CREATE POLICY "Admins full access" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Admins full access" ON transactions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Admins full access" ON transfer_codes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Admins self access" ON admins FOR SELECT TO authenticated USING (
  auth_user_id = auth.uid()
);

-- USER POLICIES: Users can only see their own data
CREATE POLICY "Users self access" ON users FOR SELECT TO authenticated USING (
  id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Users self transactions" ON transactions FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);

-- 6. FUNCTIONS & TRIGGERS (Ledger Integrity)
-- Ensure balance is synced with transactions (Simple version for simulation)
CREATE OR REPLACE FUNCTION update_user_balance() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.type = 'credit') THEN
      UPDATE users SET balance = balance + NEW.amount WHERE id = NEW.user_id;
    ELSIF (NEW.type = 'debit' OR NEW.type = 'transfer') THEN
      UPDATE users SET balance = balance - NEW.amount WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_user_balance();
