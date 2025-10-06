// components/BookingCalendar.tsx
"use client";

import React from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useBookedDates } from '@/hooks/useBookedDates';

interface BookingCalendarProps {
  selectedCar: number | null; // This should be Model_ID from your table
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: Dayjs;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedCar,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate
}) => {
  const { bookedDates, loading } = useBookedDates(selectedCar);

  const shouldDisableDate = (date: Dayjs) => {
    if (!selectedCar) return false;
    
    const dateStr = date.format('YYYY-MM-DD');
    
    // Check if date overlaps with any existing booking
    return bookedDates.some(booked => {
      const bookedStart = dayjs(booked.Booking_Start_Date_Time).format('YYYY-MM-DD');
      const bookedEnd = dayjs(booked.Booking_End_Date_Time).format('YYYY-MM-DD');
      
      return dateStr >= bookedStart && dateStr <= bookedEnd;
    });
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="space-y-4">
        <MobileDatePicker
          label="Start Date"
          value={startDate ? dayjs(startDate) : null}
          onChange={(newValue) => {
            onStartDateChange(newValue ? newValue.format('YYYY-MM-DD') : '');
          }}
          shouldDisableDate={shouldDisableDate}
          minDate={minDate || dayjs()}
          slotProps={{
            textField: {
              required: true,
              fullWidth: true,
              size: "small",
            },
          }}
        />

        <MobileDatePicker
          label="End Date"
          value={endDate ? dayjs(endDate) : null}
          onChange={(newValue) => {
            onEndDateChange(newValue ? newValue.format('YYYY-MM-DD') : '');
          }}
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
    </LocalizationProvider>
  );
};

export default BookingCalendar;