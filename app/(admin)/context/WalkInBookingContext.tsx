"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dayjs } from 'dayjs';
import { Car, BookingData, CarPricing } from "@/types";
import { useCarPricing } from '@/hooks/useCarPricing';
import { fetchCars } from '@/lib/supabase/queries/admin/fetchCars';

// Define the shape of the context's value
interface WalkInBookingContextType {
  personalInfo: BookingData['personalInfo'];
  setPersonalInfo: React.Dispatch<React.SetStateAction<BookingData['personalInfo']>>;
  rentalInfo: BookingData['rentalInfo'];
  setRentalInfo: React.Dispatch<React.SetStateAction<BookingData['rentalInfo']>>;
  paymentInfo: BookingData['paymentInfo'];
  setPaymentInfo: React.Dispatch<React.SetStateAction<BookingData['paymentInfo']>>;
  selectedCar: number | null;
  setSelectedCar: (id: number | null) => void;
  selectedCarData: any;
  setSelectedCarData: (data: any) => void;
  cars: Car[];
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  submitError: string | null;
  bookingSuccess: boolean;
  setBookingSuccess: React.Dispatch<React.SetStateAction<boolean>>;
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
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleRentalInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePaymentInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFinalSubmit: () => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  calculateRentalDetails: () => { hours: number; days: number; totalPrice: number; twelveHourPrice: number; twentyFourHourPrice: number; multiDayPrice: number; show12HourOption: boolean; show24HourOption: boolean; };
  calculateReturnTime: () => { returnDate: string; returnTime: string; };
  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context
const WalkInBookingContext = createContext<WalkInBookingContextType | undefined>(undefined);

// Create the Provider component
export const WalkInBookingProvider = ({ children }: { children: ReactNode }) => {
  const [personalInfo, setPersonalInfo] = useState<BookingData['personalInfo']>({
    firstName: "",
    lastName: "",
    suffix: "",
    email: "",
    mobileNumber: "",
  });

  const [rentalInfo, setRentalInfo] = useState<BookingData['rentalInfo']>({
    area: "",
    startDate: "",
    endDate: "",
    selfDrive: "",
    duration: "",
    time: "",
  });

  const [paymentInfo, setPaymentInfo] = useState<BookingData['paymentInfo']>({
    referenceNumber: "",
  });

  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [selectedCarData, setSelectedCarData] = useState<any>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { pricingData, loading, error, calculatePrice } = useCarPricing(selectedCar);

  const sendConfirmationSms = async (totalAmount: number, bookingId: string, status: string) => {
    try {
      const message = `Hi ${personalInfo.firstName}, your booking (ID: ${bookingId}) is currently ${status}. Total: P${totalAmount}. Ref: ${paymentInfo.referenceNumber}. We will notify you once confirmed!`;
      let formattedNumber = personalInfo.mobileNumber;
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+63' + formattedNumber.substring(1);
      }
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formattedNumber, text: message }),
      });
      const data = await res.json();
      if (data.success) {
        console.log("SMS Sent Successfully!");
      } else {
        console.warn("SMS Failed:", data.error);
      }
    } catch (err) {
      console.error("Error calling SMS API:", err);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedCar) {
      setSubmitError("Please select a car");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { totalPrice } = calculateRentalDetails();
      const bookingFee = 500;
      const carWashFee = 300;
      const initialPayment = totalPrice || 0;
      const totalPayment = bookingFee + carWashFee + initialPayment;

      // Determine Booking Status
      const now = new Date();
      const pickupDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
      
      const timeDifferenceInMinutes = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60);

      let bookingStatusId;
      let statusText;

      // If pickup is today and within the next 60 minutes (and not in the past)
      if (pickupDateTime.toDateString() === now.toDateString() && timeDifferenceInMinutes >= 0 && timeDifferenceInMinutes <= 60) {
        bookingStatusId = 3; // Ongoing
        statusText = "Ongoing";
      } else {
        bookingStatusId = 2; // Confirmed
        statusText = "Confirmed";
      }

      const bookingData = { 
        personalInfo, 
        rentalInfo, 
        paymentInfo, 
        selectedCar, 
        totalPayment, 
        bookingFee, 
        carWashFee, 
        initialPayment,
        bookingStatusId,
      };

      // --- UPDATED: Use the new API route ---
      const response = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create booking");
      }

      const result = await response.json();
      const newBookingId = result.booking.Booking_ID;
      // ---------------------------------------
      
      setBookingSuccess(true);
      await sendConfirmationSms(totalPayment, newBookingId, statusText);
      setTimeout(() => {
        setPersonalInfo({ firstName: "", lastName: "", suffix: "", email: "", mobileNumber: "" });
        setRentalInfo({ area: "", startDate: "", endDate: "", selfDrive: "", duration: "", time: "" });
        setPaymentInfo({ referenceNumber: "" });
        setSelectedCar(null);
        setSelectedCarData(null);
        setSelectedTime(null);
        setBookingSuccess(false);
        setShowConfirm(false);
      }, 3000);
    } catch (error) {
      console.error("Booking submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "mobileNumber") {
      const numbersOnly = value.replace(/\D/g, "");
      setPersonalInfo((prev) => ({ ...prev, [name]: numbersOnly }));
    } else {
      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRentalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRentalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes} ${period}`;
  };

  const calculateRentalDetails = () => {
    if (!rentalInfo.startDate || !rentalInfo.endDate || !rentalInfo.time) {
      return { hours: 0, days: 0, totalPrice: 0, twelveHourPrice: 0, twentyFourHourPrice: 0, multiDayPrice: 0, show12HourOption: false, show24HourOption: false };
    }
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    const endDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    const timeDiff = endDateTime.getTime() - startDateTime.getTime();
    const hours = Math.ceil(timeDiff / (1000 * 3600));
    if (hours <= 0) return { hours: 0, days: 0, totalPrice: 0, twelveHourPrice: 0, twentyFourHourPrice: 0, multiDayPrice: 0, show12HourOption: false, show24HourOption: false };
    const days = Math.ceil(hours / 24);
    const show12HourOption = hours <= 24;
    const show24HourOption = hours <= 24;
    const twelveHourPrice = calculatePrice(rentalInfo.area, "12 hours");
    const twentyFourHourPrice = calculatePrice(rentalInfo.area, "24 hours");
    const multiDayPrice = days * twentyFourHourPrice;
    let totalPrice = 0;
    if (rentalInfo.duration === "12 hours") totalPrice = twelveHourPrice;
    else if (rentalInfo.duration === "24 hours") totalPrice = twentyFourHourPrice;
    else if (rentalInfo.duration?.includes("days")) totalPrice = multiDayPrice;
    else {
      if (hours <= 12) totalPrice = twelveHourPrice;
      else if (hours <= 24) totalPrice = twentyFourHourPrice;
      else totalPrice = multiDayPrice;
    }
    return { hours, days, totalPrice, twelveHourPrice, twentyFourHourPrice, multiDayPrice, show12HourOption, show24HourOption };
  };

    const calculateReturnTime = () => {
    if (!rentalInfo.startDate || !rentalInfo.time || !rentalInfo.duration) {
      return { returnDate: "", returnTime: "" };
    }
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    let returnDateTime;
    if (rentalInfo.duration === "12 hours") returnDateTime = new Date(startDateTime.getTime() + (12 * 60 * 60 * 1000));
    else if (rentalInfo.duration === "24 hours") returnDateTime = new Date(startDateTime.getTime() + (24 * 60 * 60 * 1000));
    else if (rentalInfo.duration.includes("days")) {
      const days = parseInt(rentalInfo.duration);
      returnDateTime = new Date(startDateTime.getTime() + (days * 24 * 60 * 60 * 1000));
    } else {
      returnDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    }
    const returnDate = returnDateTime.toISOString().split('T')[0];
    const returnTime = formatTime(returnDateTime.toTimeString().slice(0, 5));
    return { returnDate, returnTime };
  };

  useEffect(() => {
    const loadCars = async () => {
      const carData = await fetchCars();
      setCars(carData);
    };
    loadCars();
  }, []);

  useEffect(() => {
    if (rentalInfo.startDate && rentalInfo.endDate && rentalInfo.time) {
      const { hours } = calculateRentalDetails();
      if (!rentalInfo.duration || hours > 48) {
        if (hours <= 12) setRentalInfo(prev => ({ ...prev, duration: "12 hours" }));
        else if (hours <= 24) setRentalInfo(prev => ({ ...prev, duration: "24 hours" }));
        else {
          const days = Math.ceil(hours / 24);
          setRentalInfo(prev => ({ ...prev, duration: `${days} days` }));
        }
      }
    }
  }, [rentalInfo.startDate, rentalInfo.endDate, rentalInfo.time]);

  const value = {
    personalInfo, setPersonalInfo,
    rentalInfo, setRentalInfo,
    paymentInfo, setPaymentInfo,
    selectedCar, setSelectedCar,
    selectedCarData, setSelectedCarData,
    cars,
    submitting, setSubmitting,
    submitError,
    bookingSuccess, setBookingSuccess,
    dateRangeError, setDateRangeError,
    currentStep, setCurrentStep,
    selectedTime, setSelectedTime,
    pricingData,
    loading,
    error,
    calculatePrice,
    handleInputChange,
    handleRentalInputChange,
    handlePaymentInputChange,
    handleFinalSubmit,
    formatDate,
    formatTime,
    calculateRentalDetails,
    calculateReturnTime,
    showConfirm, setShowConfirm
  };

  return (
    <WalkInBookingContext.Provider value={value}>
      {children}
    </WalkInBookingContext.Provider>
  );
};

// Create the custom hook to use the context
export const useWalkInBooking = () => {
  const context = useContext(WalkInBookingContext);
  if (context === undefined) {
    throw new Error('useWalkInBooking must be used within a WalkInBookingProvider');
  }
  return context;
};
