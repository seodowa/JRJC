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
