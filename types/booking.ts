export interface OngoingBooking {
  Booking_ID: number;
  Booking_Start_Date_Time: string;
  Booking_End_Date_Time: string;
  Duration: number;
  Location: string;
  Customer: {
    First_Name: string;
    Last_Name: string;
  } | null;
}
