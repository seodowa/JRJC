// components/BookingCalendar.tsx
"use client";

import React, { useEffect, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useBookedDates } from '@/hooks/useBookedDates';

interface BookingCalendarProps {
  selectedCar: number | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRangeError?: (error: string | null) => void;
  minDate?: Dayjs;
  excludeBookingId?: string; // [NEW] Added to prevent self-blocking during extension
  readOnlyStartDate?: boolean; // [NEW] Added to lock start date during extension
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedCar,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeError,
  minDate,
  excludeBookingId,
  readOnlyStartDate = false
}) => {
  const { bookedDates, loading } = useBookedDates(selectedCar);

  // [NEW] Filter out the current booking from the blocked list
  const activeBookedDates = useMemo(() => {
    if (!excludeBookingId) return bookedDates;
    return bookedDates.filter(b => b.Booking_ID !== excludeBookingId);
  }, [bookedDates, excludeBookingId]);

  const isRangeValid = (start: string, end: string) => {
    if (!start || !end || !selectedCar) return true;
    
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    
    for (let date = startDate; date.isBefore(endDate) || date.isSame(endDate); date = date.add(1, 'day')) {
      const dateStr = date.format('YYYY-MM-DD');
      
      const isBooked = activeBookedDates.some(booked => {
        const bookedStart = dayjs(booked.Booking_Start_Date_Time).format('YYYY-MM-DD');
        const bookedEnd = dayjs(booked.Booking_End_Date_Time).format('YYYY-MM-DD');
        return dateStr >= bookedStart && dateStr <= bookedEnd;
      });
      
      if (isBooked) {
        return false;
      }
    }
    return true;
  };

  const shouldDisableDate = (date: Dayjs) => {
    if (!selectedCar) return false;
    const dateStr = date.format('YYYY-MM-DD');
    
    return activeBookedDates.some(booked => {
      const bookedStart = dayjs(booked.Booking_Start_Date_Time).format('YYYY-MM-DD');
      const bookedEnd = dayjs(booked.Booking_End_Date_Time).format('YYYY-MM-DD');
      return dateStr >= bookedStart && dateStr <= bookedEnd;
    });
  };

  useEffect(() => {
    if (startDate && endDate) {
      if (!isRangeValid(startDate, endDate)) {
        const errorMsg = 'Selected range conflicts with an existing booking.';
        onRangeError?.(errorMsg);
      } else {
        onRangeError?.(null);
      }
    } else {
      onRangeError?.(null);
    }
  }, [startDate, endDate, activeBookedDates, onRangeError]);

  const handleStartDateChange = (newValue: Dayjs | null) => {
    const newStartDate = newValue ? newValue.format('YYYY-MM-DD') : '';
    onStartDateChange(newStartDate);
    if (endDate && !isRangeValid(newStartDate, endDate)) {
      onEndDateChange('');
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    const newEndDate = newValue ? newValue.format('YYYY-MM-DD') : '';
    onEndDateChange(newEndDate);
  };

  if (loading) return <div className="text-sm text-gray-500">Checking availability...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Start Date</label>
          <MobileDatePicker
            value={startDate ? dayjs(startDate) : null}
            onChange={handleStartDateChange}
            shouldDisableDate={shouldDisableDate}
            minDate={minDate || dayjs()}
            disabled={readOnlyStartDate} // Lock input if needed
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                size: "small",
                // Visual cue that it's read-only
                className: readOnlyStartDate ? "bg-gray-100" : "" 
              },
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">New End Date</label>
          <MobileDatePicker
            value={endDate ? dayjs(endDate) : null}
            onChange={handleEndDateChange}
            shouldDisableDate={shouldDisableDate}
            minDate={startDate ? dayjs(startDate) : dayjs()}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                size: "small",
              },
            }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default BookingCalendar;