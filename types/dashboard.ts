export interface DashboardData {
  Booking_ID: string; // uuid
  Booking_Start_Date_Time: string; // timestamp
  Booking_End_Date_Time: string; // timestamp
  Duration: number; // int8
  Location: string; // text
  Customer_ID: number; // int8
  Customer_Full_Name: string; // text
  Booking_Status_Name: string; // varchar
  Model_ID: number; // int8
  Model_Name: string; // varchar
  Year_Model: number; // int8
  color_code: string; // varchar
  Car_Status: string; // varchar
  Transmission_Type: string; // varchar
  Manufacturer_Name: string; // varchar
}