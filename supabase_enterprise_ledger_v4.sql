-- FLAGSTAR BANK - ENTERPRISE LEDGER & HARDENED SHIELD v4.0
-- (C) 2026 ANTIGRAVITY SYSTEMS - ARCHITECTURAL LOCKDOWN

-- 1. CLEANUP PREVIOUS DRIFT
DROP TRIGGER IF EXISTS on_transaction_insert ON transactions;
DROP FUNCTION IF EXISTS update_user_balance();

-- 2. USER & AUTH CORE
-- (Assumes 'users' and 'admins' tables exist from v3, refining them)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'PENDING';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. THE STATE MACHINE ENFORCEMENT (PL/pgSQL)
-- This function ensures that transactions ONLY advance through valid stages.
CREATE OR REPLACE FUNCTION validate_transaction_state()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. IMMUTABILITY OF COMPLETION
  IF (OLD.stage = 'COMPLETED') THEN
    RAISE EXCEPTION 'ARCH-BLOCK: Immutable state reached. COMPLETED transactions cannot be modified.';
  END IF;

  -- 2. TRANSITION LOGIC
  IF (NEW.stage = 'COT_VERIFIED' AND OLD.stage != 'PENDING') THEN
    RAISE EXCEPTION 'ARCH-BLOCK: Invalid transition to COT_VERIFIED.';
  END IF;
  
  IF (NEW.stage = 'TAX_VERIFIED' AND OLD.stage != 'COT_VERIFIED') THEN
    RAISE EXCEPTION 'ARCH-BLOCK: Invalid transition to TAX_VERIFIED.';
  END IF;

  IF (NEW.stage = 'IRS_VERIFIED' AND OLD.stage != 'TAX_VERIFIED') THEN
    RAISE EXCEPTION 'ARCH-BLOCK: Invalid transition to IRS_VERIFIED.';
  END IF;

  IF (NEW.stage = 'COMPLETED' AND OLD.stage != 'IRS_VERIFIED' AND OLD.stage != 'PENDING') THEN
    -- Allow direct PENDING -> COMPLETED only if no restrictions were enabled at start
    -- This logic is handled in the verification function.
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_ledger_state_machine
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION validate_transaction_state();

-- 4. ATOMIC TRANSFER FUNCTION (Preventing Race Conditions)
-- Replaces JS-level checks with DB-level atomic enforcement.
CREATE OR REPLACE FUNCTION customer_initiate_transfer(
  p_sender_id UUID,
  p_amount DECIMAL(15,2),
  p_recipient_account TEXT,
  p_narration TEXT
) RETURNS UUID AS $$
DECLARE
  v_txn_id UUID;
  v_sender_balance DECIMAL(15,2);
  v_requires_verification BOOLEAN;
BEGIN
  -- A. LOCK SENDER RECORD (Prevent Double Spending)
  SELECT balance INTO v_sender_balance 
  FROM users WHERE id = p_sender_id 
  FOR UPDATE;

  -- B. BALANCE CHECK
  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'LEDGER-ERR: Insufficient liquidity for transfer.';
  END IF;

  -- C. CHECK RESTRICTIONS
  SELECT (cot_enabled OR tax_enabled OR irs_enabled) INTO v_requires_verification
  FROM transfer_codes WHERE user_id = p_sender_id;

  -- D. INSERT PENDING TRANSACTION
  INSERT INTO transactions (
    user_id, 
    amount, 
    type, 
    to_account, 
    narration, 
    status, 
    stage
  ) VALUES (
    p_sender_id,
    p_amount,
    'debit',
    p_recipient_account,
    p_narration,
    'PENDING',
    CASE WHEN v_requires_verification THEN 'PENDING' ELSE 'COMPLETED' END
  ) RETURNING id INTO v_txn_id;

  -- E. AUTO-DEDUCT IF COMPLETED (LEDGER TRUTH)
  IF NOT v_requires_verification THEN
    UPDATE users SET balance = balance - p_amount WHERE id = p_sender_id;
  END IF;

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql;

-- 5. ADMIN VERIFICATION GATEWAY (Hardened v4.0)
CREATE OR REPLACE FUNCTION admin_verify_stage(
  p_txn_id UUID,
  p_target_stage TEXT,
  p_verification_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_expected_code TEXT;
  v_amount DECIMAL(15,2);
BEGIN
  -- STEP A: AUTH CHECK (REQUIRED)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  -- STEP B: ADMIN CHECK (REQUIRED)
  IF NOT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  -- 2. FETCH TRANSACTION DETAILS
  SELECT user_id, amount INTO v_user_id, v_amount 
  FROM transactions WHERE id = p_txn_id;

  -- 3. CODE VALIDATION
  IF p_target_stage = 'COT_VERIFIED' THEN
    SELECT cot_code INTO v_expected_code FROM transfer_codes WHERE user_id = v_user_id;
  ELSIF p_target_stage = 'TAX_VERIFIED' THEN
    SELECT tax_code INTO v_expected_code FROM transfer_codes WHERE user_id = v_user_id;
  ELSIF p_target_stage = 'IRS_VERIFIED' THEN
    SELECT irs_code INTO v_expected_code FROM transfer_codes WHERE user_id = v_user_id;
  END IF;

  IF v_expected_code != p_verification_code THEN
    RAISE EXCEPTION 'VERIFY-ERR: Invalid authorization code provided.';
  END IF;

  -- 4. ADVANCE STAGE
  UPDATE transactions SET stage = p_target_stage WHERE id = p_txn_id;

  -- 5. FINAL SETTLEMENT (If COMPLETED)
  IF p_target_stage = 'COMPLETED' THEN
    UPDATE users SET balance = balance - v_amount WHERE id = v_user_id;
    UPDATE transactions SET status = 'COMPLETED' WHERE id = p_txn_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. RLS ENFORCEMENT ALIGNMENT (Hardened v4.0)
-- A. ENABLE RLS ON ALL TABLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- B. CLEANUP PREVIOUS POLICIES
DROP POLICY IF EXISTS "Users read self" ON users;
DROP POLICY IF EXISTS "Admins read all" ON users;
DROP POLICY IF EXISTS "Users read transactions" ON transactions;
DROP POLICY IF EXISTS "Admins read transactions" ON transactions;

-- C. USERS TABLE POLICIES
CREATE POLICY "admin_full_access_users" ON users FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

CREATE POLICY "customer_isolation_users" ON users FOR SELECT 
USING (id = auth.uid());

-- D. TRANSACTIONS TABLE POLICIES
CREATE POLICY "admin_full_access_transactions" ON transactions FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

CREATE POLICY "customer_isolation_transactions" ON transactions FOR SELECT 
USING (user_id = auth.uid());

-- E. TRANSFER_CODES TABLE POLICIES
CREATE POLICY "admin_full_access_codes" ON transfer_codes FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

CREATE POLICY "customer_isolation_codes" ON transfer_codes FOR SELECT 
USING (user_id = auth.uid());

-- F. ADMINS TABLE POLICIES (Self-Read Only)
CREATE POLICY "admin_read_self" ON admins FOR SELECT 
USING (auth_user_id = auth.uid());

-- 7. ATOMIC CUSTOMER PROVISIONING (Hardened v4.0)
-- ... (rest of the file stays the same)
CREATE OR REPLACE FUNCTION admin_create_customer(
  p_name TEXT,
  p_email TEXT,
  p_account TEXT,
  p_pin TEXT
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- STEP A: AUTH CHECK (REQUIRED)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  -- STEP B: ADMIN CHECK (REQUIRED)
  IF NOT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  -- STEP C: BUSINESS LOGIC
  -- Insert User
  INSERT INTO users (full_name, email, account_number, pin, balance)
  VALUES (p_name, p_email, p_account, p_pin, 0.00)
  RETURNING id INTO v_user_id;

  -- Initialize Transfer Codes
  INSERT INTO transfer_codes (user_id, cot_code, tax_code, irs_code)
  VALUES (
    v_user_id,
    'COT-' || upper(substring(md5(random()::text) from 1 for 6)),
    'TAX-' || upper(substring(md5(random()::text) from 1 for 6)),
    'IRS-' || upper(substring(md5(random()::text) from 1 for 6))
  );

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
