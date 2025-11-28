import { PaymentDetails } from '.';
export type TAdminBooking = {
  bookingId: string;
  startDate: string;
  endDate: string;
  duration: number;
  location: string;
  customerName: string;
  customerSuffix: string; // Added customer suffix
  carModel: string;
  carManufacturer: string;
  carYear: number;
  status: string;
  dateCreated: string;
  dateReturned?: string | null;
};

export type SpecificBookingDetails = {
  Booking_ID: string;
  Model_ID: number;
  Booking_Start_Date_Time: string;
  Booking_End_Date_Time: string;
  Duration: number;
  Location: string;
  date_created: string;
  Customer: {
    First_Name: string;
    Last_Name: string;
    Suffix: string | null;
    Email: string | null;
    Contact_Number: string | null;
  };
  Car_Models: {
    Model_Name: string;
    Year_Model: number;
    image: string | null;
    Number_Of_Seats?: number; // Added for car class determination
    Car_Class_FK?: number; // Added for direct access to car class ID
    Manufacturer: {
      Manufacturer_Name: string;
    };
  };
  Booking_Status: {
    Name: string;
  };
  additional_hours: number | null;
  date_returned: string | null;
  Payment_Details_ID: number | null; // Foreign Key to Payment_Details
  Payment_Details?: PaymentDetails | null; // Nested payment details object, if fetched
};