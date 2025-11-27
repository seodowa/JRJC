import React from 'react';
import { Dayjs } from 'dayjs';
import { Car, CarPricing, BookingData } from "@/types";

// Define the shape of the context's value
export interface WalkInBookingContextType {
  personalInfo: BookingData['personalInfo'];
  setPersonalInfo: React.Dispatch<React.SetStateAction<BookingData['personalInfo']>>;
  rentalInfo: BookingData['rentalInfo'];
  setRentalInfo: React.Dispatch<React.SetStateAction<BookingData['rentalInfo']>>;
  paymentInfo: BookingData['paymentInfo'];
  setPaymentInfo: React.Dispatch<React.SetStateAction<BookingData['paymentInfo']>>;
  paymentMethod: "cash" | "cashless" | null;
  setPaymentMethod: React.Dispatch<React.SetStateAction<"cash" | "cashless" | null>>;
  selectedCar: number | null;
  setSelectedCar: (id: number | null) => void;
  selectedCarData: any;
  setSelectedCarData: (data: any) => void;
  cars: Car[];
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  submitError: string | null;
  dateRangeError: string | null;
  setDateRangeError: (error: string | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedTime: Dayjs | null;
  setSelectedTime: (time: Dayjs | null) => void;
  pricingData: CarPricing[];
  loading: boolean;
  error: string | null;
  calculatePrice: (area: string, duration: string) => number;
  handleFinalSubmit: () => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  calculateRentalDetails: () => { hours: number; days: number; totalPrice: number; twelveHourPrice: number; twentyFourHourPrice: number; multiDayPrice: number; show12HourOption: boolean; show24HourOption: boolean; };
  calculateReturnTime: () => { returnDate: string; returnTime: string; };
  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}
