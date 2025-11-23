'use client';

import { TAdminBooking } from '@/types/adminBooking';

interface BookingsTableViewProps {
  bookings: TAdminBooking[];
  selectedBookings: string[];
  setSelectedBookings: (selected: string[]) => void;
  showCheckboxes: boolean;
}

const BookingsTableView = ({ bookings, selectedBookings, setSelectedBookings, showCheckboxes }: BookingsTableViewProps) => {
  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    if (event.target.checked) {
      setSelectedBookings((prev) => [...prev, bookingId]);
    } else {
      setSelectedBookings((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  return (
    <table className="min-w-full text-gray-800 md:table table-fixed">
      <thead className="rounded-lg border-y border-gray-200 text-sm font-normal">
          <tr>
            {showCheckboxes && (
              <th scope="col" className="p-5 font-medium text-center w-[5%]">
                {/* This is an empty header for the checkboxes in the content rows */}
              </th>
            )}
            <th scope="col" className="p-3 font-medium text-left w-[15%]">
              Name
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[15%]">
              Booking ID
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[10%]">
              Date Booked
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[10%]">
              Booking Start
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[10%]">
              Booking End
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[10%]">
              Duration
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[15%]">
              Car
            </th>
            <th scope="col" className="px-3 font-medium text-left w-[10%]">
              Status
            </th>
          </tr>
        </thead>
      <tbody className="bg-white">
        {bookings.map((booking) => (
          <tr
            key={booking.bookingId}
            className="w-full border-b border-gray-200 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
          >
            {showCheckboxes && (
              <td className="whitespace-nowrap p-3 text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-2"
                  checked={selectedBookings.includes(booking.bookingId)}
                  onChange={(e) => handleCheckboxClick(e, booking.bookingId)}
                />
              </td>
            )}
            <td className="whitespace-nowrap p-3 text-left">
              {booking.customerName}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {booking.bookingId}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {new Date(booking.dateCreated).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {new Date(booking.startDate).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {new Date(booking.endDate).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {booking.duration}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {booking.carManufacturer} {booking.carModel} ({booking.carYear})
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {booking.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BookingsTableView;
