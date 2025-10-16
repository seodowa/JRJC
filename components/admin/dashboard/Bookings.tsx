'use client'; // This remains a client component for now to avoid cascading server/client issues.

import React from 'react';
import { OngoingBooking } from '@/types';

interface BookingsProps {
  bookings: OngoingBooking[];
}

const Bookings = ({ bookings }: BookingsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Ongoing Bookings</h2>
      
      <div className="overflow-y-auto flex-grow">
        {bookings.length === 0 && (
          <p className="text-gray-500">No ongoing bookings at the moment.</p>
        )}

        {bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.Booking_ID} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800">
                  {booking.Customer?.First_Name} {booking.Customer?.Last_Name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(booking.Booking_Start_Date_Time)} - {formatDate(booking.Booking_End_Date_Time)}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.Duration} hours - {booking.Location}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
