"use client";

import { useRouter } from 'next/navigation';
import AsyncButton from "@/components/AsyncButton";

interface WalkInBookingNavbarProps {
  scrollToRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
  personalRef: React.RefObject<HTMLDivElement | null>;
  rentalRef: React.RefObject<HTMLDivElement | null>;
  paymentRef: React.RefObject<HTMLDivElement | null>;
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
    <div className="hidden md:flex w-64 bg-white p-4 shadow-md flex-col justify-between rounded-2xl">
      <div>
        <h2 className="text-lg font-bold mb-4">Walk-in Book</h2>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="mb-4">
                <AsyncButton
                  onClick={() => scrollToRef(item.ref)}
                  className={`w-full text-left p-4 rounded-lg hover:bg-gray-200`}
                >
                  {item.label}
                </AsyncButton>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <AsyncButton
        onClick={() => router.back()}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
      >
        Back
      </AsyncButton>
    </div>
  );
};

export default WalkInBookingNavbar;

