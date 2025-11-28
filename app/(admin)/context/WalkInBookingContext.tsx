"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Dayjs } from 'dayjs';
import { Car, BookingData, CarPricing } from "@/types";
import { useCarPricing } from '@/hooks/useCarPricing';
import { useToast } from "@/components/toast/use-toast";
import { formatDate, formatTime } from '@/utils/dateUtils';
import { createWalkInBookingService } from '@/app/(admin)/services/adminBookingService';
import { sendBookingConfirmationService } from '@/app/services/bookingService';
import { useRentalCalculation } from '@/hooks/useRentalCalculation';
import { WalkInBookingContextType } from '@/types/walkInBookingContext';

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

  const [paymentInfo, setPaymentInfo] = useState<{ bfReferenceNumber: string; bookingFee: number; initialTotalPayment: number }>({
    bfReferenceNumber: "",
    bookingFee: 0,
    initialTotalPayment: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "cashless" | null>(null);

  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [selectedCarData, setSelectedCarData] = useState<Car | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { pricingData, loading, error, calculatePrice } = useCarPricing(selectedCar);
  const { toast } = useToast();
  const router = useRouter();

  const { calculateRentalDetails, calculateReturnTime } = useRentalCalculation({ rentalInfo, calculatePrice });

  const handleFinalSubmit = async () => {
    if (!selectedCar) {
      setSubmitError("Please select a car");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { totalPrice: initialRentalCost } = calculateRentalDetails(); // Renamed to initialRentalCost for clarity
      const bookingFeeVal = 500; // Fixed booking fee
      const carWashFeeVal = 300; // Fixed car wash fee
      const initialTotalPaymentVal = bookingFeeVal + carWashFeeVal + initialRentalCost; // Sum of all initial components
      const totalPaymentVal = initialTotalPaymentVal; // Define totalPaymentVal for use in confirmation service

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

      // Update paymentInfo state for the context
      const updatedPaymentInfo = {
        bfReferenceNumber: paymentInfo.bfReferenceNumber,
        bookingFee: bookingFeeVal,
        initialTotalPayment: initialTotalPaymentVal,
      };

      // Construct the bookingData payload for the createWalkInBookingService
      const bookingData = { 
        personalInfo, 
        rentalInfo, 
        paymentInfo: updatedPaymentInfo, // Contains all payment details for DB
        selectedCar, 
        initialRentalCost, // Pass initial rental cost explicitly if needed later
        carWashFee: carWashFeeVal, // Pass car wash fee explicitly if needed later
        bookingStatusId,
      };

      // --- UPDATED: Use the new API route ---
      const result = await createWalkInBookingService(bookingData);
      const newBookingId = result.booking.Booking_ID;
      // ---------------------------------------
      
      toast({
        title: "Booking Confirmed",
        description: "The booking has been successfully submitted.",
        duration: 3000,
      });
      router.refresh();
      sendBookingConfirmationService(
        newBookingId,
        totalPaymentVal, // Pass the calculated totalPaymentVal
        statusText,
        personalInfo.firstName,
        personalInfo.email,
        personalInfo.mobileNumber,
        updatedPaymentInfo.bfReferenceNumber, // Pass the bfReferenceNumber
        "SMS"
      );
      
      setPersonalInfo({ firstName: "", lastName: "", suffix: "", email: "", mobileNumber: "" });
      setRentalInfo({ area: "", startDate: "", endDate: "", selfDrive: "", duration: "", time: "" });
      setPaymentInfo({ bfReferenceNumber: "", bookingFee: 0, initialTotalPayment: 0 }); // Reset paymentInfo
      setPaymentMethod(null);
      setSelectedCar(null);
      setSelectedCarData(null);
      setSelectedTime(null);
      setShowConfirm(false);
      setCurrentStep(1);
      
    } catch (error) {
      console.error("Booking submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create booking");
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadCars = async () => {
      try {
        const response = await fetch('/api/admin/cars');
        if (!response.ok) throw new Error('Failed to fetch cars');
        const carData = await response.json();
        setCars(carData);
      } catch (error) {
        console.error("Error loading cars:", error);
      }
    };
    loadCars();
  }, []);

  useEffect(() => {
    if (rentalInfo.startDate && rentalInfo.endDate && rentalInfo.time) {
      const { hours, isOutsideRegion10 } = calculateRentalDetails();
      if (!rentalInfo.duration || hours > 48) {
        if (hours <= 12 && !isOutsideRegion10) { // Condition to prevent setting 12 hours for outside region
           setRentalInfo(prev => ({ ...prev, duration: "12 hours" }));
        }
        else if (hours <= 24) {
           setRentalInfo(prev => ({ ...prev, duration: "24 hours" }));
        } 
        else {
           const days = Math.ceil(hours / 24);
           setRentalInfo(prev => ({ ...prev, duration: `${days} days` }));
        }
      }
    }
  }, [rentalInfo, calculatePrice, calculateRentalDetails]); // Added rentalInfo, calculatePrice, calculateRentalDetails as dependencies

  const value = {
    personalInfo, setPersonalInfo,
    rentalInfo, setRentalInfo,
    paymentInfo, setPaymentInfo,
    paymentMethod, setPaymentMethod,
    selectedCar, setSelectedCar,
    selectedCarData, setSelectedCarData,
    cars,
    submitting, setSubmitting,
    submitError,
    dateRangeError, setDateRangeError,
    currentStep, setCurrentStep,
    selectedTime, setSelectedTime,
    pricingData,
    loading,
    error,
    calculatePrice,
    handleFinalSubmit, // Re-exposed to allow client components to use it
    formatDate, // Export from utils
    formatTime, // Export from utils
    calculateRentalDetails, // Export from useRentalCalculation
    calculateReturnTime, // Export from useRentalCalculation
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
