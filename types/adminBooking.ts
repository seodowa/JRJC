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
};

export type SpecificBookingDetails = {
  Booking_ID: string;
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
    Manufacturer: {
      Manufacturer_Name: string;
    };
  };
  Booking_Status: {
    Name: string;
  };
};