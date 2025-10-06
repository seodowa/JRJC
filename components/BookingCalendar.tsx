// components/BookingCalendar.tsx
"use client";

import React, { useEffect } from 'react';
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
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedCar,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeError,
  minDate
}) => {
  const { bookedDates, loading } = useBookedDates(selectedCar);

  // Check if any date in the range is booked
  const isRangeValid = (start: string, end: string) => {
    if (!start || !end || !selectedCar) return true;
    
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    
    // Check each day in the range
    for (let date = startDate; date.isBefore(endDate) || date.isSame(endDate); date = date.add(1, 'day')) {
      const dateStr = date.format('YYYY-MM-DD');
      
      const isBooked = bookedDates.some(booked => {
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
    
    // Check if date is within any booked range
    return bookedDates.some(booked => {
      const bookedStart = dayjs(booked.Booking_Start_Date_Time).format('YYYY-MM-DD');
      const bookedEnd = dayjs(booked.Booking_End_Date_Time).format('YYYY-MM-DD');
      
      return dateStr >= bookedStart && dateStr <= bookedEnd;
    });
  };

  // Validate range whenever dates or bookedDates change
  useEffect(() => {
    if (startDate && endDate) {
      if (!isRangeValid(startDate, endDate)) {
        const errorMsg = 'Your selected date range includes dates that are already booked. Please adjust your dates.';
        onRangeError?.(errorMsg);
      } else {
        onRangeError?.(null);
      }
    } else {
      onRangeError?.(null);
    }
  }, [startDate, endDate, bookedDates, onRangeError]);

  const handleStartDateChange = (newValue: Dayjs | null) => {
    const newStartDate = newValue ? newValue.format('YYYY-MM-DD') : '';
    onStartDateChange(newStartDate);
    
    // If end date exists and new range is invalid, clear end date
    if (endDate && !isRangeValid(newStartDate, endDate)) {
      onEndDateChange('');
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    const newEndDate = newValue ? newValue.format('YYYY-MM-DD') : '';
    onEndDateChange(newEndDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading available dates...</div>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <MobileDatePicker
            value={startDate ? dayjs(startDate) : null}
            onChange={handleStartDateChange}
            shouldDisableDate={shouldDisableDate}
            minDate={minDate || dayjs()}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                size: "small",
                placeholder: "Select start date",
              },
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose when you want to pick up the car
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            End Date <span className="text-red-500">*</span>
          </label>
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
                placeholder: "Select end date",
              },
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose when you want to return the car
          </p>
        </div>
      </div>

      {/* Booked dates info */}
      {bookedDates.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span> Dates with existing bookings are disabled
          </p>
        </div>
      )}
    </LocalizationProvider>
  );
};

export default BookingCalendar;