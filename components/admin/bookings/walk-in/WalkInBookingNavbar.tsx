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
    { id: 'personal', label: 'Personal information', ref: personalRef },
    { id: 'rental', label: 'Rental details', ref: rentalRef },
    { id: 'payment', label: 'Payment details', ref: paymentRef },
  ];

  return (
    <div className="hidden w-60 flex-col justify-between gap-8 md:flex">
      <div>
        <p className="eyebrow mb-2">New booking</p>
        <h1 className="mb-6 text-4xl leading-none font-normal tracking-[-0.03em]">Walk-in.</h1>
        <nav>
          <ul>
            {navItems.map((item, index) => (
              <li key={item.id} className="border-t border-line">
                <AsyncButton
                  onClick={() => scrollToRef(item.ref)}
                  className="flex w-full items-center gap-3 py-3.5 text-left text-[15px] hover:text-forest"
                >
                  <span className="num text-xs text-clay">0{index + 1}</span>
                  {item.label}
                </AsyncButton>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <AsyncButton
        onClick={() => router.back()}
        className="border border-ink bg-transparent hover:bg-gray-200 text-ink font-medium py-2 px-4 rounded-md"
      >
        Back
      </AsyncButton>
    </div>
  );
};

export default WalkInBookingNavbar;

