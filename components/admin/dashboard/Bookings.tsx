'use client';

import React from 'react';
import { Booking } from '@/types';

interface BookingsProps {
  bookings: Booking[];
}

const Bookings = ({ bookings }: BookingsProps) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFullName = (booking: Booking) => {
    if (!booking.Customer_ID) return 'Unknown Customer';
    return booking.Customer_Full_Name;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex flex-shrink-0 items-baseline justify-between">
        <h2 className="text-2xl">Pending</h2>
        <span className="num text-xs text-ink-2">{bookings.length}</span>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {bookings.length === 0 ? (
          <p className="text-ink-2">Nothing waiting for approval.</p>
        ) : (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.Booking_ID} className="border-b border-line py-3">
                <p className="font-medium">
                  {getFullName(booking)}
                </p>
                <p className="num text-xs text-ink-2">
                  {formatDate(booking.Booking_Start_Date_Time)} - {formatDate(booking.Booking_End_Date_Time)}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.Duration} hours - {booking.Location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Bookings;