import { useCallback } from 'react';
import { BookingData } from '@/types';
import { Dayjs } from 'dayjs';

interface UseRentalCalculationProps {
  rentalInfo: BookingData['rentalInfo'];
  calculatePrice: (area: string, duration: string) => number;
}

export const useRentalCalculation = ({ rentalInfo, calculatePrice }: UseRentalCalculationProps) => {

  const calculateRentalDetails = useCallback(() => {
    if (!rentalInfo.startDate || !rentalInfo.endDate || !rentalInfo.time) {
      return { hours: 0, days: 0, totalPrice: 0, twelveHourPrice: 0, twentyFourHourPrice: 0, multiDayPrice: 0, show12HourOption: false, show24HourOption: false, isOutsideRegion10: false };
    }

    const isOutsideRegion10 = rentalInfo.area === "Outside Region 10";

    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    const endDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    const timeDiff = endDateTime.getTime() - startDateTime.getTime();
    const hours = Math.ceil(timeDiff / (1000 * 3600));

    if (hours <= 0) return { hours: 0, days: 0, totalPrice: 0, twelveHourPrice: 0, twentyFourHourPrice: 0, multiDayPrice: 0, show12HourOption: false, show24HourOption: false, isOutsideRegion10: false };

    const days = Math.ceil(hours / 24);
    const show12HourOption = hours <= 24 && !isOutsideRegion10;
    const show24HourOption = hours <= 24;

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
      // Default calculation if duration is not explicitly set or needs auto-determination
      if (hours <= 12 && show12HourOption) totalPrice = twelveHourPrice;
      else if (hours <= 24) totalPrice = twentyFourHourPrice;
      else totalPrice = multiDayPrice;
    }

    return { 
      hours, days, totalPrice, twelveHourPrice, twentyFourHourPrice, multiDayPrice, show12HourOption, show24HourOption, isOutsideRegion10 
    };
  }, [rentalInfo, calculatePrice]);


  const calculateReturnTime = useCallback(() => {
    if (!rentalInfo.startDate || !rentalInfo.time || !rentalInfo.duration) {
      return { returnDate: "", returnTime: "" };
    }
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    let returnDateTime;
    if (rentalInfo.duration === "12 hours") returnDateTime = new Date(startDateTime.getTime() + (12 * 60 * 60 * 1000));
    else if (rentalInfo.duration === "24 hours") returnDateTime = new Date(startDateTime.getTime() + (24 * 60 * 60 * 1000));
    else if (rentalInfo.duration?.includes("days")) {
      const days = parseInt(rentalInfo.duration);
      returnDateTime = new Date(startDateTime.getTime() + (days * 24 * 60 * 60 * 1000));
    } else {
      // Fallback if duration isn't specific, assume end date from rentalInfo
      returnDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    }
    const returnDate = returnDateTime.toISOString().split('T')[0];
    // This hook should not directly import formatTime to avoid circular dependency if formatTime is moved to dateUtils
    // Instead, rely on the caller to format the time string if needed.
    const returnTime = returnDateTime.toTimeString().slice(0, 5); // Just return HH:MM
    return { returnDate, returnTime };
  }, [rentalInfo]);

  return { calculateRentalDetails, calculateReturnTime };
};
