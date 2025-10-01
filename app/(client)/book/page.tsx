"use client";

import React, { useState } from "react";
import InputField from "@/components/InputField";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  suffix: string;
  email: string;
  mobileNumber: string;
  validId: File | null;
}







const BookingPage: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    suffix: "",
    email: "",
    mobileNumber: "",
    validId: null,
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const handleConfirmBooking = () => setShowConfirm(true);
  const handleCancelConfirm = () => setShowConfirm(false);
  const handleFinalSubmit = () => {
    setShowConfirm(false);
    console.log("Booking confirmed:", personalInfo);
    // Add your booking submission logic here
  };

  const [currentStep, setCurrentStep] = useState<number>(1); // 1 = Personal Info, 2 = Rental Details, 3 = Payment Details

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPersonalInfo((prev) => ({
      ...prev,
      validId: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1); // Go to next step
    } else {
      console.log("Final submission:", personalInfo);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // 🔹 This is where we switch between the booking steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* --- PERSONAL INFO FORM --- */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <InputField
                      label="First Name"
                      name="firstName"
                      type="text"
                      value={personalInfo.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                      className="col-span-3 md:col-span-1"
                    />

                    <InputField
                      label="Last Name"
                      name="lastName"
                      type="text"
                      value={personalInfo.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                      className="col-span-2 md:col-span-1"
                    />

                    <InputField
                      label="Suffix"
                      name="suffix"
                      type="text"
                      value={personalInfo.suffix}
                      onChange={handleInputChange}
                      placeholder="(e.g., Jr.)"
                      optional
                    />

                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      className="col-span-3 md:col-span-1"
                    />

                    <InputField
                      label="Mobile Number"
                      name="mobileNumber"
                      type="tel"
                      value={personalInfo.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      required
                      className="col-span-2 md:col-span-1"
                    />

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Valid ID<span className="inline text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-6 h-6 mb-2 text-gray-500"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            <p className="mb-1 text-xs text-gray-500 text-center">
                              <span className="font-semibold">Upload ID</span>
                            </p>
                            <p className="text-xs text-gray-500 text-center">
                              PDF, PNG, JPG
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg"
                            required
                          />
                        </label>
                      </div>
                      {personalInfo.validId && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {personalInfo.validId.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full lg:w-auto"
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
          </>
        );

      case 2:
  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <select
                name="model"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select car</option>
                <option value="Model 1">Model 1</option>
                <option value="Model 2">Model 2</option>
              </select>
            </div>

            {/* Transmission (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
             <select
                name="transmission"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-500 "></select>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
            </div>

            {/* Area Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                name="area"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select area</option>
                <option value="Manolo-CBD">Manolo-CBD</option>
                <option value="Bukidnon-Mis. Ori.">Bukidnon-Mis. Ori.</option>
                <option value="Outside Region 10">Outside Region 10</option>
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Fuel Type (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
              <input
                type="text"
                disabled
                value="Gasoline(Unleaded)"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>

            {/* Self-drive Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self-drive? <span className="text-red-500">*</span>
              </label>
              <select
                name="selfDrive"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Duration Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                name="duration"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select duration</option>
                <option value="12 hours">₱XXXX/12 hours</option>
                <option value="24 hours">₱XXXX/24 hours</option>
              </select>
            </div>

            {/* Time Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <select
                name="time"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select time</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price + Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-800">
            Initial Price:
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );


      case 3:


  return (
    <div className="relative p-6">
      {/* Main Payment Section */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Payment Details Text */}
            <div>
              <p className="text-sm text-gray-700 mb-4">
                Please scan the QR Code for GCash Payment and pay the booking
                fee. For the <strong>total payment</strong>, you may pay through
                face-to-face.
              </p>
              <p className="text-sm text-gray-700">
                <strong>Booking Fee:</strong> ₱XXX
              </p>
              <p className="text-sm text-gray-700">
                <strong>Cost Breakdown:</strong> ₱XXX
              </p>

              <p className="mt-6 text-sm font-semibold text-gray-800">
                Total Payment: ₱XXXX
              </p>

              {/* Reference Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload the reference number below:
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  placeholder="Enter GCash reference number"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <img
                src="/images/qr-sample.png"
                alt="QR Code"
                className="w-48 h-48 border rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleConfirmBooking}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
          >
            Book
          </button>
        </div>
      </form>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Are you sure you want to confirm your booking?
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              <strong>Reminders:</strong>
              <br />
              BLA <br />
              BLA <br />
              BLA <br />
              BLA
            </p>

            <div className="flex justify-between">
              <button
                onClick={handleCancelConfirm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md w-[45%]"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md w-[45%]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-main-color md:bg-transparent md:bg-gradient-to-b from-main-color from-80% md:from-60% lg:from-40% to-transparent -mt-12 pt-9 md:pt-12 relative overflow-hidden">
      <img src="/images/BG.webp" className="opacity-20 min-w-full absolute bottom-0 -z-2" />

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress Indicators */}
          <div className="lg:hidden mb-6 text-center">
            <span className="text-lg font-semibold text-gray-900">
              {["Personal Information", "Rental Details", "Payment Details"][currentStep - 1]}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Progress Sidebar */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="space-y-4">
                {["Personal Information", "Rental Details", "Payment Details"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className={`p-4 rounded-lg border-2 ${
                        index + 1 === currentStep
                          ? "border-blue-600 bg-[rgba(161,227,249,1)]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`font-medium text-sm ${
                          index + 1 === currentStep
                            ? "text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            index + 1 === currentStep
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-600"
                          } font-bold text-sm mb-2`}
                        >
                          {index + 1}
                        </div>
                        {step}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Step Content */}
            <div className="lg:w-4/5 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {["Personal Information", "Rental Details", "Payment Details"][currentStep - 1]}
                </h1>
              </div>

              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
