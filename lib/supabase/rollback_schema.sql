-- ROLLBACK SCRIPT
-- WARNING: This will DELETE the new tables and columns.
-- NOTE: Data from "Payment_Details_URL" that was deleted during migration CANNOT be restored by this script.
-- This script only restores the table STRUCTURE.

-- 1. Drop Triggers first
DROP TRIGGER IF EXISTS trigger_calculate_late_fees ON "Booking_Details";
DROP FUNCTION IF EXISTS calculate_additional_hours;

DROP TRIGGER IF EXISTS trigger_set_car_class ON "Car_Models";
DROP FUNCTION IF EXISTS set_car_class;

-- 2. Revert Booking_Details Structure
-- Remove the new Payment_Details_ID column
ALTER TABLE "Booking_Details" DROP COLUMN IF EXISTS "Payment_Details_ID";
ALTER TABLE "Booking_Details" DROP COLUMN IF EXISTS "additional_hours";
ALTER TABLE "Booking_Details" DROP COLUMN IF EXISTS "date_returned";

-- Restore the old Payment_Details_URL column (Structure only, data is lost)
ALTER TABLE "Booking_Details" ADD COLUMN IF NOT EXISTS "Payment_Details_URL" TEXT;

-- 3. Revert Car_Models Structure
ALTER TABLE "Car_Models" DROP COLUMN IF EXISTS "Car_Class_FK";

-- 4. Drop New Tables
-- Order matters: Payment_Details must be dropped AFTER the FK in Booking_Details is removed (step 2)
DROP TABLE IF EXISTS "Payment_Details";
DROP TABLE IF EXISTS "Late_Fees";
DROP TABLE IF EXISTS "Car_Class";
