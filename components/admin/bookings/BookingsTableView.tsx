'use client';

import { TAdminBooking } from '@/types/adminBooking';

interface BookingsTableViewProps {
  bookings: TAdminBooking[];
  selectedBookings: string[];
  setSelectedBookings: (selected: string[]) => void;
}

const BookingsTableView = ({ bookings, selectedBookings, setSelectedBookings }: BookingsTableViewProps) => {
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allBookingIds = bookings.map((booking) => booking.bookingId);
      setSelectedBookings(allBookingIds);
    } else {
      setSelectedBookings([]);
    }
  };

  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    if (event.target.checked) {
      setSelectedBookings((prev) => [...prev, bookingId]);
    } else {
      setSelectedBookings((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-2"
                    checked={selectedBookings.length === bookings.length && bookings.length > 0}
                    onChange={handleSelectAllClick}
                  />
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Booking ID
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date Booked
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Booking Start
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Booking End
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Duration
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Car
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bookings.map((booking) => (
                <tr
                  key={booking.bookingId}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-4 py-3 sm:pl-6">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-2"
                      checked={selectedBookings.includes(booking.bookingId)}
                      onChange={(e) => handleCheckboxClick(e, booking.bookingId)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {booking.customerName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {booking.bookingId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(booking.dateBooked).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(booking.endDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {booking.duration}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {booking.carModel}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {booking.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsTableView;
