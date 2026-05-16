-- FLAGSTAR BANK - ADMINS SCHEMA COMPATIBILITY PATCH (v5.1)
-- Non-destructive migration to align admins table with Customer frontend model expectations.

ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'verified',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing admins (if any) to have a fallback account number if null
UPDATE admins 
SET account_number = '100999'
WHERE email = 'admin@flagstar-secure.com' AND account_number IS NULL;

-- Fallback for any other admins
UPDATE admins 
SET account_number = 'ADMIN-' || substring(id::text from 1 for 6)
WHERE account_number IS NULL;
