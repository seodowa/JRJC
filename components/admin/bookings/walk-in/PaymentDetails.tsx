"use client";

import { useState } from "react";
import { useWalkInBooking } from "@/app/(admin)/adminSU/context/WalkInBookingContext";

interface PaymentDetailsProps {
  onBack: () => void;
}

const PaymentDetails = ({ onBack }: PaymentDetailsProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "cashless" | null>(null);
  const {
    paymentInfo,
    handlePaymentInputChange,
    calculateRentalDetails,
    setShowConfirm,
    setPaymentInfo,
  } = useWalkInBooking();

  const { totalPrice } = calculateRentalDetails();
  const bookingFee = 500;
  const carWashFee = 300;
  const initialPayment = totalPrice || 0;
  const totalPayment = bookingFee + carWashFee + initialPayment;

  const handleBook = () => {
    setShowConfirm(true);
  };

  const handlePaymentMethodSelect = (method: "cash" | "cashless") => {
    setPaymentMethod(method);
    if (method === "cash") {
      setPaymentInfo({ ...paymentInfo, referenceNumber: "Booking Fee Paid through Cash" });
    }
  };

  const handleGoBack = () => {
    setPaymentMethod(null);
    setPaymentInfo({ ...paymentInfo, referenceNumber: "" });
  };

  return (
    <div className="bg-white p-8 rounded-4xl shadow-md mt-8">
      <h2 className="text-xl font-bold mb-6">Payment Details</h2>

      {!paymentMethod ? (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Select a Payment Method:</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handlePaymentMethodSelect("cash")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Cash
            </button>
            <button
              onClick={() => handlePaymentMethodSelect("cashless")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Cashless
            </button>
          </div>
          <div className="flex justify-start mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
            >
              Back
            </button>
          </div>
        </div>
      ) : paymentMethod === "cash" ? (
        <form onSubmit={(e) => { e.preventDefault(); handleBook(); }}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Booking Fee:</strong> ₱{bookingFee}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cost Breakdown:</strong> ₱{initialPayment} (Rental) + ₱{carWashFee} (Car Wash)
                </p>
                <p className="mt-6 text-sm font-semibold text-gray-800">
                  Total Payment: ₱{totalPayment}
                </p>
                <p className="mt-4 text-lg font-bold text-green-600">
                  Booking Fee Paid through Cash
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Book
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleBook(); }}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-sm text-gray-700 mb-4">
                  Please scan the QR Code for GCash Payment and pay the booking
                  fee. For the <strong>total payment</strong>, you may pay through
                  face-to-face.
                </p>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Booking Fee:</strong> ₱{bookingFee}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Cost Breakdown:</strong> ₱{initialPayment} (Rental) + ₱{carWashFee} (Car Wash)
                  </p>
                </div>

                <p className="mt-6 text-sm font-semibold text-gray-800">
                  Total Payment: ₱{totalPayment}
                </p>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload the reference number below:
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={paymentInfo.referenceNumber}
                    onChange={handlePaymentInputChange}
                    placeholder="Enter GCash reference number"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src="/images/qr-sample.png"
                  alt="QR Code"
                  className="w-48 h-48 border rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
            >
              Go Back
            </button>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Book
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentDetails;