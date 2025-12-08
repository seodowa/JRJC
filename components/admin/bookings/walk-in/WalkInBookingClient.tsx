"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WalkInBookingProvider, useWalkInBooking } from '@/app/(admin)/context/WalkInBookingContext';
import WalkInBookingNavbar from './WalkInBookingNavbar';
import PersonalInformationForm from './PersonalInformationForm';
import RentalDetailsForm from './RentalDetailsForm';
import PaymentDetails from './PaymentDetails';
import AsyncButton from "@/components/AsyncButton";

const WalkInBookingLayout = () => {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    showConfirm,
    setShowConfirm,
    submitting,
    submitError,
    handleFinalSubmit,
    calculateRentalDetails,
    personalInfo,
    notificationPreferences,
    handleNotificationToggle
  } = useWalkInBooking();

  const personalRef = useRef<HTMLDivElement>(null);
  const rentalRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
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
  const initialTotalPayment = bookingFee + carWashFee + initialPayment;

  const handleCancelConfirm = () => setShowConfirm(false);

  return (
    <div className="flex flex-col md:flex-row h-full relative">
      
      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
            </button>
            <h1 className="font-bold text-lg text-gray-800">Walk-in Book</h1>
        </div>
        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Step {currentStep} of 3
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:h-fit bg-white rounded-4xl mr-4">
        <WalkInBookingNavbar
          scrollToRef={scrollToRef}
          personalRef={personalRef}
          rentalRef={rentalRef}
          paymentRef={paymentRef}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto">
        <div ref={personalRef} className="mb-4">
          <PersonalInformationForm onNext={handleNextToRental} />
        </div>
        <div ref={rentalRef} className="mb-4">
          <RentalDetailsForm
            onBack={handleBackToPersonal}
            onNext={handleNextToPayment}
          />
        </div>
        <div ref={paymentRef} className="mb-20 md:mb-0">
          <PaymentDetails onBack={handleBackToRental} />
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {submitting ? "Submitting Booking..." : "Confirm Walk-In Booking"}
                </h2>
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                {!submitting && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Where should we send notifications? <span className="text-red-500">*</span></p>
                    
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.includes('SMS')} 
                          onChange={() => handleNotificationToggle('SMS')} 
                          className="form-checkbox h-4 w-4 text-blue-600 rounded" 
                        />
                        <span className="text-sm text-gray-700">SMS</span>
                      </label>
                      <label className={`flex items-center space-x-2 ${!personalInfo.email ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <input 
                          type="checkbox" 
                          checked={notificationPreferences.includes('Email')} 
                          onChange={() => handleNotificationToggle('Email')} 
                          disabled={!personalInfo.email} 
                          className="form-checkbox h-4 w-4 text-blue-600 rounded disabled:bg-gray-300" 
                        />
                        <span className="text-sm text-gray-700">Email</span>
                      </label>
                    </div>
                    
                    {notificationPreferences.length === 0 && (
                      <p className="text-xs text-red-500 mt-1 mb-2">Please select at least one notification method.</p>
                    )}
                    {!personalInfo.email && (
                      <p className="text-xs text-gray-500 mt-1 mb-2">Provide an email in Step 1 to enable Email notifications.</p>
                    )}

                    <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">
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
                        <span>₱{initialTotalPayment}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <AsyncButton
                    onClick={handleCancelConfirm}
                    disabled={submitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 shadow-sm text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </AsyncButton>
                  <AsyncButton
                    onClick={handleFinalSubmit}
                    disabled={submitting || notificationPreferences.length === 0}
                    isLoading={submitting}
                    loadingText="Submitting..."
                    className="flex-1 bg-[#A1E3F9] hover:bg-blue-400 shadow-sm text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
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