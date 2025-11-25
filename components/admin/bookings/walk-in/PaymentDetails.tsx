"use client";

interface PaymentDetailsProps {
  onBack: () => void;
}

const PaymentDetails = ({ onBack }: PaymentDetailsProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-6">Payment Details</h2>
      <p>Payment details form will be here. You can style this section.</p>
      <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Back
          </button>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
    </div>
  );
};

export default PaymentDetails;

