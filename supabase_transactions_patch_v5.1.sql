-- FLAGSTAR BANK - TRANSACTIONS SCHEMA COMPATIBILITY PATCH (v5.1)
-- Non-destructive migration to align transactions table with expanded Phase 5 requirements.

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS transaction_type TEXT,
ADD COLUMN IF NOT EXISTS admin_actor_id UUID REFERENCES admins(id),
ADD COLUMN IF NOT EXISTS admin_actor_name TEXT,
ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

-- Backfill reference numbers for existing transactions
UPDATE transactions 
SET reference_number = 'REF-' || substring(id::text from 1 for 8)
WHERE reference_number IS NULL;
