"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { Car, BookingData } from "@/types";
import { useCarPricing } from '@/hooks/useCarPricing';
import { useRentalCalculation } from '@/hooks/useRentalCalculation';
import { useToast } from "@/components/toast/use-toast";
import { formatDate, formatTime } from '@/utils/dateUtils';
import { createWalkInBookingService } from '@/app/(admin)/services/adminBookingService';
import { sendBookingConfirmationService } from '@/app/services/bookingService';
import { WalkInBookingContextType } from '@/types/walkInBookingContext';
import { useCMS } from "@/app/(client)/context/CMSContext";

const WalkInBookingContext = createContext<WalkInBookingContextType | undefined>(undefined);

export const WalkInBookingProvider = ({ children }: { children: ReactNode }) => {
  const { getNumber } = useCMS();
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

  // New State for Notification Preferences
  const [notificationPreferences, setNotificationPreferences] = useState<string[]>(['SMS']);

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

  // Get Dynamic Fees
  const bookingFee = getNumber('fees', 'booking_fee', 500);
  const carWashFee = getNumber('fees', 'car_wash_fee', 300);

  // Handle Notification Toggles
  const handleNotificationToggle = (type: string) => {
    setNotificationPreferences((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const { calculateRentalDetails, calculateReturnTime } = useRentalCalculation({ rentalInfo, calculatePrice });

  // --- EFFECT 1: Sync End Date with Duration Selection ---
  useEffect(() => {
    if (!rentalInfo.startDate || !rentalInfo.time || !rentalInfo.duration) return;

    const start = dayjs(`${rentalInfo.startDate}T${rentalInfo.time}`);
    let newEndDate = "";

    if (rentalInfo.duration === "12 hours") {
      newEndDate = start.add(12, 'hour').format('YYYY-MM-DD');
    } else if (rentalInfo.duration === "24 hours") {
      newEndDate = start.add(24, 'hour').format('YYYY-MM-DD');
    }

    if (newEndDate && newEndDate !== rentalInfo.endDate) {
      setRentalInfo(prev => ({ ...prev, endDate: newEndDate }));
    }
  }, [rentalInfo.duration, rentalInfo.startDate, rentalInfo.time]);

  // --- EFFECT 2: Auto Selection Logic (FIXED) ---
  useEffect(() => {
    if (rentalInfo.startDate && rentalInfo.endDate && rentalInfo.time) {
      const { hours, isOutsideRegion10, isSameDay, show12HourOption } = calculateRentalDetails();
      
      // If we already have a duration set, and it matches the calculated hours logic, DO NOT change it.
      // This prevents the "24 hours" -> "12 hours" revert loop.
      if (rentalInfo.duration === "24 hours" && hours <= 24 && hours > 12) return;
      if (rentalInfo.duration === "12 hours" && hours <= 12) return;

      // Only force update if duration is missing OR if the current duration is invalid (e.g., >48 hours but set to 12h)
      if (!rentalInfo.duration || hours > 48 || (isSameDay && rentalInfo.duration === "")) {
        if (isSameDay) {
            if (show12HourOption) {
                 if(rentalInfo.duration !== "12 hours") setRentalInfo(prev => ({ ...prev, duration: "12 hours" }));
            } else {
                 if(rentalInfo.duration !== "24 hours") setRentalInfo(prev => ({ ...prev, duration: "24 hours" }));
            }
        } 
        else {
            if (hours <= 12 && !isOutsideRegion10) {
                if (rentalInfo.duration !== "12 hours") setRentalInfo(prev => ({ ...prev, duration: "12 hours" }));
            }
            else if (hours <= 24) {
                 if (rentalInfo.duration !== "24 hours") setRentalInfo(prev => ({ ...prev, duration: "24 hours" }));
            } 
            else if (hours > 24) {
                const days = Math.ceil(hours / 24);
                setRentalInfo(prev => ({ ...prev, duration: `${days} days` }));
            }
        }
      }
    }
  }, [rentalInfo.startDate, rentalInfo.endDate, rentalInfo.time, rentalInfo.area, calculateRentalDetails]);


  const handleFinalSubmit = async () => {
    if (!selectedCar) {
      setSubmitError("Please select a car");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { totalPrice: initialRentalCost } = calculateRentalDetails(); 
      const bookingFeeVal = getNumber('fees', 'booking_fee', 500);
      const carWashFeeVal = getNumber('fees', 'car_wash_fee', 300); 
      const initialTotalPaymentVal = bookingFeeVal + carWashFeeVal + initialRentalCost; 
      const totalPaymentVal = initialTotalPaymentVal; 

      const now = new Date();
      const pickupDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
      const timeDifferenceInMinutes = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60);

      let bookingStatusId;
      let statusText;

      if (pickupDateTime.toDateString() === now.toDateString() && timeDifferenceInMinutes >= 0 && timeDifferenceInMinutes <= 60) {
        bookingStatusId = 3; // Ongoing
        statusText = "Ongoing";
      } else {
        bookingStatusId = 2; // Confirmed
        statusText = "Confirmed";
      }

      const updatedPaymentInfo = {
        bfReferenceNumber: paymentInfo.bfReferenceNumber,
        bookingFee: bookingFeeVal,
        initialTotalPayment: initialTotalPaymentVal,
      };

      // Convert array to string for API if needed, or keep as is depending on backend
      const finalPreferenceString = notificationPreferences.join(', ');

      const bookingData = { 
        personalInfo, 
        rentalInfo, 
        paymentInfo: updatedPaymentInfo, 
        selectedCar, 
        initialRentalCost, 
        carWashFee: carWashFeeVal, 
        bookingStatusId,
        notificationPreference: finalPreferenceString // Added here
      };

      const result = await createWalkInBookingService(bookingData);
      const newBookingId = result.booking.Booking_ID;
      
      toast({
        title: "Booking Confirmed",
        description: "The booking has been successfully submitted.",
        duration: 3000,
      });
      router.refresh();

      // Pass preference string to service
      sendBookingConfirmationService(
        newBookingId,
        totalPaymentVal,
        statusText,
        personalInfo.firstName,
        personalInfo.email,
        personalInfo.mobileNumber,
        updatedPaymentInfo.bfReferenceNumber,
        finalPreferenceString 
      );
      
      // Reset Form
      setPersonalInfo({ firstName: "", lastName: "", suffix: "", email: "", mobileNumber: "" });
      setRentalInfo({ area: "", startDate: "", endDate: "", selfDrive: "", duration: "", time: "" });
      setPaymentInfo({ bfReferenceNumber: "", bookingFee: 0, initialTotalPayment: 0 });
      setPaymentMethod(null);
      setSelectedCar(null);
      setSelectedCarData(null);
      setSelectedTime(null);
      setShowConfirm(false);
      setCurrentStep(1);
      setNotificationPreferences(['SMS']); // Reset preferences
      
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
    handleFinalSubmit,
    formatDate,
    formatTime,
    calculateRentalDetails,
    calculateReturnTime,
    showConfirm, setShowConfirm,
    notificationPreferences, setNotificationPreferences,
    handleNotificationToggle,
    bookingFee,
    carWashFee
  };

  return (
    <WalkInBookingContext.Provider value={value}>
      {children}
    </WalkInBookingContext.Provider>
  );
};

export const useWalkInBooking = () => {
  const context = useContext(WalkInBookingContext);
  if (context === undefined) {
    throw new Error('useWalkInBooking must be used within a WalkInBookingProvider');
  }
  return context;
};