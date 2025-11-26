-- Secure Booking Creation Function
-- This function runs with security definer privileges (Admin)
-- It allows anonymous users to insert a booking and get the result back
-- without needing SELECT permissions on the whole table.

CREATE OR REPLACE FUNCTION create_new_booking(
  p_customer_id bigint,
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_model_id bigint,
  p_duration int,
  p_chauffer boolean,
  p_location text,
  p_notification_preference text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_record record;
BEGIN
  INSERT INTO "Booking_Details" (
    "Customer_ID",
    "Booking_Start_Date_Time",
    "Booking_End_Date_Time",
    "Model_ID",
    "Duration",
    "Chauffer",
    "Booking_Status_ID",
    "Location",
    "Notification_Preference"
  ) VALUES (
    p_customer_id,
    p_start_date,
    p_end_date,
    p_model_id,
    p_duration,
    p_chauffer,
    1, -- Default to Pending (1)
    p_location,
    p_notification_preference
  )
  RETURNING * INTO v_booking_record;
  
  RETURN to_jsonb(v_booking_record);
END;
$$;

-- Grant execute permission to everyone (public/anon)
GRANT EXECUTE ON FUNCTION create_new_booking TO public;
GRANT EXECUTE ON FUNCTION create_new_booking TO anon;
