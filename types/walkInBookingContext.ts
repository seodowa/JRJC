import React from 'react';
import { Dayjs } from 'dayjs';
import { Car, CarPricing, BookingData } from "@/types";

// Define the shape of the context's value
export interface WalkInBookingContextType {
  personalInfo: BookingData['personalInfo'];
  setPersonalInfo: React.Dispatch<React.SetStateAction<BookingData['personalInfo']>>;
  rentalInfo: BookingData['rentalInfo'];
  setRentalInfo: React.Dispatch<React.SetStateAction<BookingData['rentalInfo']>>;
  
  // Note: Ensure BookingData['paymentInfo'] matches the shape used in your provider:
  // { bfReferenceNumber: string; bookingFee: number; initialTotalPayment: number }
  paymentInfo: BookingData['paymentInfo']; 
  setPaymentInfo: React.Dispatch<React.SetStateAction<BookingData['paymentInfo']>>;
  
  paymentMethod: "cash" | "cashless" | null;
  setPaymentMethod: React.Dispatch<React.SetStateAction<"cash" | "cashless" | null>>;
  
  selectedCar: number | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<number | null>>;
  
  selectedCarData: any;
  setSelectedCarData: React.Dispatch<React.SetStateAction<any>>;
  
  cars: Car[];
  
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  
  submitError: string | null;
  
  dateRangeError: string | null;
  setDateRangeError: React.Dispatch<React.SetStateAction<string | null>>;
  
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  
  selectedTime: Dayjs | null;
  setSelectedTime: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  
  pricingData: CarPricing[];
  loading: boolean;
  error: string | null;
  calculatePrice: (area: string, duration: string) => number;
  handleFinalSubmit: () => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;

  // --- Notification Properties Added ---
  notificationPreferences: string[];
  setNotificationPreferences: React.Dispatch<React.SetStateAction<string[]>>;
  handleNotificationToggle: (type: string) => void;
  // ------------------------------------

  calculateRentalDetails: () => {
    hours: number;
    days: number;
    totalPrice: number;
    twelveHourPrice: number;
    twentyFourHourPrice: number;
    multiDayPrice: number;
    show12HourOption: boolean;
    show24HourOption: boolean;
    isOutsideRegion10: boolean;
    isSameDay: boolean;
  };
  
  calculateReturnTime: () => { returnDate: string; returnTime: string; };
  
  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}