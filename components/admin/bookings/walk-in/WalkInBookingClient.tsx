"use client";

import { useRef } from 'react';
import { WalkInBookingProvider, useWalkInBooking } from '@/app/(admin)/context/WalkInBookingContext';
import WalkInBookingNavbar from './WalkInBookingNavbar';
import PersonalInformationForm from './PersonalInformationForm';
import RentalDetailsForm from './RentalDetailsForm';
import PaymentDetails from './PaymentDetails';
import AsyncButton from "@/components/AsyncButton";

const WalkInBookingLayout = () => {
  const {
    setCurrentStep,
    showConfirm,
    setShowConfirm,
    submitting,
    bookingSuccess,
    submitError,
    handleFinalSubmit,
    calculateRentalDetails
  } = useWalkInBooking();

  const personalRef = useRef<HTMLDivElement>(null);
  const rentalRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNextToRental = () => {
    scrollToRef(rentalRef);
    setCurrentStep(2);
  };

  const handleNextToPayment = () => {
    scrollToRef(paymentRef);
    setCurrentStep(3);
  };

  const handleBackToPersonal = () => {
    scrollToRef(personalRef);
    setCurrentStep(1);
  };

  const handleBackToRental = () => {
    scrollToRef(rentalRef);
    setCurrentStep(2);
  };

  const { totalPrice } = calculateRentalDetails();
  const bookingFee = 500;
  const carWashFee = 300;
  const initialPayment = totalPrice || 0;
  const totalPayment = bookingFee + carWashFee + initialPayment;

  const handleCancelConfirm = () => setShowConfirm(false);

  return (
    <div className="flex h-full relative">
      <div className="flex h-84 bg-white rounded-4xl">
        <WalkInBookingNavbar
          scrollToRef={scrollToRef}
          personalRef={personalRef}
          rentalRef={rentalRef}
          paymentRef={paymentRef}
        />
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <div ref={personalRef}>
          <PersonalInformationForm onNext={handleNextToRental} />
        </div>
        <div ref={rentalRef}>
          <RentalDetailsForm
            onBack={handleBackToPersonal}
            onNext={handleNextToPayment}
          />
        </div>
        <div ref={paymentRef}>
          <PaymentDetails onBack={handleBackToRental} />
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {submitting ? "Submitting Booking..." : "Confirm Walk-In Booking"}
                </h2>
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                <div className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <span>Booking Fee:</span>
                    <span>₱{bookingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rental Cost:</span>
                    <span>₱{initialPayment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Car Wash Fee:</span>
                    <span>₱{carWashFee}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                    <span>Total Payment:</span>
                    <span>₱{totalPayment}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <AsyncButton
                    onClick={handleCancelConfirm}
                    disabled={submitting}
                    className="bg-gray-200 hover:bg-gray-300 shadow-sm text-gray-700 font-medium py-2 px-4 rounded-md w-[45%] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </AsyncButton>
                  <AsyncButton
                    onClick={handleFinalSubmit}
                    disabled={submitting}
                    isLoading={submitting}
                    loadingText="Submitting..."
                    className="bg-[#A1E3F9] hover:bg-blue-400 shadow-sm text-white font-medium py-2 px-4 rounded-md w-[45%] disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    Confirm
                  </AsyncButton>
                </div>
              </>
          </div>
        </div>
      )}
    </div>
  );
};

const WalkInBookingClient = () => {
  return (
    <WalkInBookingProvider>
      <WalkInBookingLayout />
    </WalkInBookingProvider>
  );
};

export default WalkInBookingClient;
