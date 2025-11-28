-- Drop the old function to ensure we can change the signature cleanly
DROP FUNCTION IF EXISTS public.create_new_booking(
  bigint, 
  timestamp with time zone, 
  timestamp with time zone, 
  bigint, 
  integer, 
  boolean, 
  text, 
  text
);

-- Create the updated function
CREATE OR REPLACE FUNCTION public.create_new_booking(
  p_customer_id bigint,
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone,
  p_model_id bigint,
  p_duration integer,
  p_chauffer boolean,
  p_location text,
  p_notification_preference text,
  p_booking_fee numeric DEFAULT 0,
  p_initial_total_payment numeric DEFAULT 0,
  p_bf_reference_number text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
AS $function$
DECLARE
  v_payment_id integer;
  v_booking_record record;
BEGIN
  -- 1. Insert into Payment_Details first
  INSERT INTO "Payment_Details" (
    "booking_fee",
    "initial_total_payment",
    "bf_reference_number",
    "payment_status"
  ) VALUES (
    p_booking_fee,
    p_initial_total_payment,
    p_bf_reference_number,
    'Not Paid'
  )
  RETURNING "Payment_ID" INTO v_payment_id;

  -- 2. Insert into Booking_Details with the linked Payment_ID
  INSERT INTO "Booking_Details" (
    "Customer_ID",
    "Booking_Start_Date_Time",
    "Booking_End_Date_Time",
    "Model_ID",
    "Duration",
    "Chauffer",
    "Booking_Status_ID",
    "Location",
    "Notification_Preference",
    "Payment_Details_ID" -- Link the payment
  ) VALUES (
    p_customer_id,
    p_start_date,
    p_end_date,
    p_model_id,
    p_duration,
    p_chauffer,
    1, -- Default to Pending (1)
    p_location,
    p_notification_preference,
    v_payment_id
  )
  RETURNING * INTO v_booking_record;
  
  RETURN to_jsonb(v_booking_record);
END;
$function$;

-- Grant permissions (adjust roles as necessary for your setup)
GRANT EXECUTE ON FUNCTION public.create_new_booking(
  bigint, timestamp with time zone, timestamp with time zone, bigint, integer, boolean, text, text, numeric, numeric, text
) TO anon, authenticated, service_role;
