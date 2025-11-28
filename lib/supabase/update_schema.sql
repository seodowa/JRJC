-- 1. Add columns to Booking_Details
ALTER TABLE "Booking_Details" 
ADD COLUMN "additional_hours" NUMERIC,
ADD COLUMN "date_returned" TIMESTAMPTZ;

-- 2. Create Car_Class table
CREATE TABLE "Car_Class" (
  "ID" SERIAL PRIMARY KEY,
  "Class" TEXT NOT NULL
);

INSERT INTO "Car_Class" ("Class") VALUES ('Small Car'), ('Big Car');

-- 3. Add Car_Class_FK to Car_Models
ALTER TABLE "Car_Models"
ADD COLUMN "Car_Class_FK" INTEGER REFERENCES "Car_Class"("ID");

-- 4. Trigger for Car_Models
CREATE OR REPLACE FUNCTION set_car_class()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."Number_Of_Seats" <= 5 THEN
    NEW."Car_Class_FK" = (SELECT "ID" FROM "Car_Class" WHERE "Class" = 'Small Car');
  ELSE
    NEW."Car_Class_FK" = (SELECT "ID" FROM "Car_Class" WHERE "Class" = 'Big Car');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_car_class
BEFORE INSERT OR UPDATE OF "Number_Of_Seats" ON "Car_Models"
FOR EACH ROW
EXECUTE FUNCTION set_car_class();

UPDATE "Car_Models" SET "Number_Of_Seats" = "Number_Of_Seats"; 

-- 5. Create Late_Fees table
CREATE TABLE "Late_Fees" (
  "ID" SERIAL PRIMARY KEY,
  "value" NUMERIC NOT NULL,
  "Car_Class_FK" INTEGER REFERENCES "Car_Class"("ID")
);

INSERT INTO "Late_Fees" ("value", "Car_Class_FK") 
VALUES 
(500, (SELECT "ID" FROM "Car_Class" WHERE "Class" = 'Small Car')),
(800, (SELECT "ID" FROM "Car_Class" WHERE "Class" = 'Big Car'));

-- 6. Create Payment_Details table
CREATE TABLE "Payment_Details" (
  "Payment_ID" SERIAL PRIMARY KEY,
  "booking_fee" NUMERIC DEFAULT 0,
  "initial_total_payment" NUMERIC DEFAULT 0,
  "additional_fees" NUMERIC DEFAULT 0,
  "total_payment" NUMERIC,
  "payment_status" TEXT DEFAULT 'Not Paid',
  "bf_reference_number" TEXT  -- Added per instruction
);

-- 7. Modify Booking_Details
-- Use IF EXISTS to prevent error if run multiple times or if column missing
ALTER TABLE "Booking_Details" 
DROP COLUMN IF EXISTS "Payment_Details_URL";

ALTER TABLE "Booking_Details"
ADD COLUMN "Payment_Details_ID" INTEGER REFERENCES "Payment_Details"("Payment_ID");


-- 8. Trigger for Booking_Details
CREATE OR REPLACE FUNCTION calculate_additional_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."date_returned" IS NOT NULL AND NEW."date_returned" > NEW."Booking_End_Date_Time" THEN
    NEW."additional_hours" = CEIL(EXTRACT(EPOCH FROM (NEW."date_returned" - NEW."Booking_End_Date_Time")) / 3600);
  ELSE
    NEW."additional_hours" = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_late_fees
BEFORE UPDATE OF "date_returned" ON "Booking_Details"
FOR EACH ROW
EXECUTE FUNCTION calculate_additional_hours();

-- 9. RLS
ALTER TABLE "Car_Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Late_Fees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment_Details" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on Car_Class" ON "Car_Class" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on Late_Fees" ON "Late_Fees" FOR SELECT TO public USING (true);

CREATE POLICY "Allow customers to view their own payments"
ON "Payment_Details" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Booking_Details"
    WHERE "Booking_Details"."Payment_Details_ID" = "Payment_Details"."Payment_ID"
    AND "Booking_Details"."Customer_ID" = (current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::bigint
  )
);