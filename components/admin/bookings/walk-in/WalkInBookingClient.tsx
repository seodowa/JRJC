"use client";

import { useRef } from 'react';
import WalkInBookingNavbar from './WalkInBookingNavbar';
import PersonalInformationForm from './PersonalInformationForm';
import RentalDetailsForm from './RentalDetailsForm';
import PaymentDetails from './PaymentDetails';

const WalkInBookingClient = () => {
  const personalRef = useRef<HTMLDivElement>(null);
  const rentalRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-full bg-gray-100">
      <WalkInBookingNavbar
        scrollToRef={scrollToRef}
        personalRef={personalRef}
        rentalRef={rentalRef}
        paymentRef={paymentRef}
      />
      <div className="flex-1 p-8 overflow-y-auto">
        <div ref={personalRef}>
          <PersonalInformationForm
            onNext={() => scrollToRef(rentalRef)}
          />
        </div>
        <div ref={rentalRef}>
          <RentalDetailsForm
            onBack={() => scrollToRef(personalRef)}
            onNext={() => scrollToRef(paymentRef)}
          />
        </div>
        <div ref={paymentRef}>
          <PaymentDetails
            onBack={() => scrollToRef(rentalRef)}
          />
        </div>
      </div>
    </div>
  );
};

export default WalkInBookingClient;

