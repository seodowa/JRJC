"use client";

import { useRouter } from 'next/navigation';

interface WalkInBookingNavbarProps {
  scrollToRef: (ref: React.RefObject<HTMLDivElement>) => void;
  personalRef: React.RefObject<HTMLDivElement>;
  rentalRef: React.RefObject<HTMLDivElement>;
  paymentRef: React.RefObject<HTMLDivElement>;
}

const WalkInBookingNavbar = ({
  scrollToRef,
  personalRef,
  rentalRef,
  paymentRef,
}: WalkInBookingNavbarProps) => {
  const router = useRouter();
  const navItems = [
    { id: 'personal', label: 'Personal Information', ref: personalRef },
    { id: 'rental', label: 'Rental Details', ref: rentalRef },
    { id: 'payment', label: 'Payment Details', ref: paymentRef },
  ];

  return (
    <div className="w-64 bg-white p-4 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold mb-4">Walk-in Book</h2>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="mb-2">
                <button
                  onClick={() => scrollToRef(item.ref)}
                  className={`w-full text-left p-2 rounded hover:bg-gray-200`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <button
        onClick={() => router.back()}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
      >
        Back
      </button>
    </div>
  );
};

export default WalkInBookingNavbar;

