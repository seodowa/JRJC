export interface Booking {
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
  additional_hours?: number;
  date_returned?: string;
  Payment_Details_ID?: number; // New FK to Payment_Details table
}

export interface PaymentDetails {
  Payment_ID: number;
  booking_fee: number;
  initial_total_payment: number;
  additional_fees: number;
  total_payment: number | null;
  payment_status: string;
  bf_reference_number: string; // New field
}

export interface BookingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    suffix: string;
    email: string;
    mobileNumber: string;
  };
  rentalInfo: {
    area: string;
    startDate: string;
    endDate: string;
    selfDrive: string;
    duration: string;
    time: string;
  };
  paymentInfo: { // This structure will now map to creating a PaymentDetails entry
    bookingFee: number; // For initial payment
    initialTotalPayment: number; // For initial payment
    bfReferenceNumber: string; // The reference number for initial payment
  };
  selectedCar: number | null;
  initialRentalCost: number; // Renamed from initialPayment, representing just the car rental cost
  carWashFee: number; // Still needed for calculation breakdown in UI
  bookingStatusId: number;
}


export interface BookingStatus {
  customerFirstName: string
  customerLastName: string
  carManufacturer: string
  carModelName: string
  bookingStatus: string
}