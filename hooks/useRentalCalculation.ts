import { useCallback } from 'react';
import { BookingData } from '@/types';

interface UseRentalCalculationProps {
  rentalInfo: BookingData['rentalInfo'];
  calculatePrice: (area: string, duration: string) => number;
}

export const useRentalCalculation = ({ rentalInfo, calculatePrice }: UseRentalCalculationProps) => {

  const calculateRentalDetails = useCallback(() => {
    // Default return object matching BookPage structure
    const defaultResult = { 
      hours: 0, 
      days: 0, 
      totalPrice: 0, 
      show12HourOption: false, 
      show24HourOption: false, 
      isOutsideRegion10: false, 
      isSameDay: false, 
      twelveHourPrice: 0, 
      twentyFourHourPrice: 0, 
      multiDayPrice: 0 
    };

    if (!rentalInfo.startDate || !rentalInfo.endDate || !rentalInfo.time) {
      return defaultResult;
    }

    const isOutsideRegion10 = rentalInfo.area === "Outside Region 10";
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    const endDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    const isSameDay = rentalInfo.startDate === rentalInfo.endDate;

    const timeDiff = endDateTime.getTime() - startDateTime.getTime();
    let hours = Math.ceil(timeDiff / (1000 * 3600));

    // Logic from BookPage: Check for invalid hours relative to same-day rule
    if (hours <= 0 && !isSameDay) {
        return defaultResult;
    }

    const days = Math.ceil(hours / 24);
    const pickupHour = parseInt(rentalInfo.time.split(':')[0]);

    // Logic from BookPage for 12/24 hour options
    const show12HourOption = 
        (!isOutsideRegion10 && hours <= 24 && hours > 0) || 
        (!isOutsideRegion10 && isSameDay && pickupHour < 12);

    const show24HourOption = (hours <= 24) || isSameDay;

    const twelveHourPrice = calculatePrice(rentalInfo.area, "12 hours");
    const twentyFourHourPrice = calculatePrice(rentalInfo.area, "24 hours");
    const multiDayPrice = days * twentyFourHourPrice;

    let totalPrice = 0;

    if (rentalInfo.duration === "12 hours") {
      totalPrice = twelveHourPrice;
    } else if (rentalInfo.duration === "24 hours") {
      totalPrice = twentyFourHourPrice;
    } else if (rentalInfo.duration?.includes("days")) {
      totalPrice = multiDayPrice;
    } else {
      // Default calculation if duration is not explicitly set
      if (rentalInfo.duration === "") {
         totalPrice = 0;
      } else {
        if (hours <= 12 && show12HourOption) totalPrice = twelveHourPrice;
        else if (hours <= 24) totalPrice = twentyFourHourPrice;
        else totalPrice = multiDayPrice;
      }
    }

    return { 
      hours, days, totalPrice, twelveHourPrice, twentyFourHourPrice, multiDayPrice, show12HourOption, show24HourOption, isOutsideRegion10, isSameDay
    };
  }, [rentalInfo, calculatePrice]);

  const calculateReturnTime = useCallback(() => {
    if (!rentalInfo.startDate || !rentalInfo.time || !rentalInfo.duration) {
      return { returnDate: "", returnTime: "" };
    }
    
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    let returnDateTime;

    if (rentalInfo.duration === "12 hours") {
        returnDateTime = new Date(startDateTime.getTime() + (12 * 60 * 60 * 1000));
    } else if (rentalInfo.duration === "24 hours") {
        returnDateTime = new Date(startDateTime.getTime() + (24 * 60 * 60 * 1000));
    } else if (rentalInfo.duration?.includes("days")) {
      const days = parseInt(rentalInfo.duration);
      returnDateTime = new Date(startDateTime.getTime() + (days * 24 * 60 * 60 * 1000));
    } else {
        returnDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    }
    
    // Internal formatter to match BookPage's formatTime function
    const formatTimeLocal = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        let displayHour = hours % 12;
        if (displayHour === 0) displayHour = 12;
        return `${displayHour}:${minutes} ${period}`;
    };

    const returnDate = returnDateTime.toISOString().split('T')[0];
    const returnTime = formatTimeLocal(returnDateTime);
    
    return { returnDate, returnTime };
  }, [rentalInfo]);

  return { calculateRentalDetails, calculateReturnTime };
};