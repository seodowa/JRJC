'use client';

import { TAdminBooking } from '@/types/adminBooking';
import Badge, { toneForStatus } from '@/components/ui/Badge';

interface BookingsTableViewProps {
  bookings: TAdminBooking[];
  selectedBookings: string[];
  setSelectedBookings: (selected: any) => void;
  showCheckboxes: boolean;
  onRowClick: (bookingId: string) => void; // New prop for row click
}

const BookingsTableView = ({ bookings, selectedBookings, setSelectedBookings, showCheckboxes, onRowClick }: BookingsTableViewProps) => {
  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    if (event.target.checked) {
      setSelectedBookings((prev: any) => [...prev, bookingId]);
    } else {
      setSelectedBookings((prev: any) => prev.filter((id: any) => id !== bookingId));
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="table w-full min-w-[1300px] table-fixed border border-line bg-surface text-ink">
      <thead className="num border-b border-ink text-[11px] tracking-[0.1em] text-ink-2 uppercase">
          <tr>
            {showCheckboxes && (
              <th scope="col" className="p-5 font-medium text-center w-[5%]">
                {/* This is an empty header for the checkboxes in the content rows */}
              </th>
            )}
            <th scope="col" className="p-3 font-medium text-left py-3.5 w-[15%]">
              Name
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[20%]">
              Booking ID
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[10%]">
              Date Booked
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[10%]">
              Booking Start
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[10%]">
              Booking End
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[5%]">
              Duration
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[15%]">
              Car
            </th>
            <th scope="col" className="px-3 font-medium text-left py-3.5 w-[10%]">
              Status
            </th>
          </tr>
        </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr
            key={booking.bookingId}
            className="w-full cursor-pointer border-b border-gray-200 text-sm transition-colors last-of-type:border-none hover:bg-gray-100"
            onClick={() => onRowClick(booking.bookingId)} // Attach onClick handler
          >
            {showCheckboxes && (
              <td className="whitespace-nowrap p-3 text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  checked={selectedBookings.includes(booking.bookingId)}
                  onChange={(e) => handleCheckboxClick(e, booking.bookingId)}
                  onClick={(e) => e.stopPropagation()} // Prevent row click from triggering when checkbox is clicked
                />
              </td>
            )}
            <td className="whitespace-nowrap p-3 text-left font-medium">
              {booking.customerName}
            </td>
            <td className="num truncate whitespace-nowrap p-3 text-left text-[13px] text-ink-2">
              {booking.bookingId}
            </td>
            <td className="num truncate whitespace-nowrap p-3 text-left text-[13px] text-ink-2">
              {new Date(booking.dateCreated).toLocaleDateString()}
            </td>
            <td className="num truncate whitespace-nowrap p-3 text-left text-[13px] text-ink-2">
              {new Date(booking.startDate).toLocaleDateString()}
            </td>
            <td className="num truncate whitespace-nowrap p-3 text-left text-[13px] text-ink-2">
              {new Date(booking.endDate).toLocaleDateString()}
            </td>
            <td className="num truncate whitespace-nowrap p-3 text-left text-[13px] text-ink-2">
              {booking.duration}
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              {booking.carManufacturer} {booking.carModel} ({booking.carYear})
            </td>
            <td className="whitespace-nowrap p-3 text-left">
              <Badge tone={toneForStatus(booking.status)}>{booking.status}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default BookingsTableView;
