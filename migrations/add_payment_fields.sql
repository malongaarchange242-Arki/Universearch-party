-- Migration: Add customer info and transaction ID to payments table
-- Purpose: Store customer name, phone, quantity, and transaction ID for better payment tracking

-- Add new columns to payments table
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "customerName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "transactionId" VARCHAR(255);

-- Add index for transaction ID for faster lookups
CREATE INDEX IF NOT EXISTS "idx_payments_transactionId" ON "payments"("transactionId");

-- Add index for phone number for faster lookups
CREATE INDEX IF NOT EXISTS "idx_payments_phoneNumber" ON "payments"("phoneNumber");

-- Add comments for documentation
COMMENT ON COLUMN "payments"."customerName" IS 'Name/Prénom of the customer purchasing tickets';
COMMENT ON COLUMN "payments"."phoneNumber" IS 'MTN MoMo phone number for the customer';
COMMENT ON COLUMN "payments"."quantity" IS 'Number of tickets being purchased';
COMMENT ON COLUMN "payments"."transactionId" IS 'Transaction ID provided by customer for verification';

-- Display confirmation message
SELECT 'Migration completed: Added customer info fields to payments table' as status;
