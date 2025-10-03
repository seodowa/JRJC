"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/components/InputField";
import SelectCar from "@/components/SelectCar";
import { useCarPricing } from "@/hooks/useCarPricing";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MobileTimePicker } from "@mui/x-date-pickers";


interface PersonalInfo {
  firstName: string;
  lastName: string;
  suffix: string;
  email: string;
  mobileNumber: string;
  validId: File | null;
}

interface RentalInfo {
  area: string;
  startDate: string;  // Changed from date to startDate
  endDate: string;    // Add endDate
  selfDrive: string;
  duration: string;
  time: string;
}

interface PaymentInfo {
  referenceNumber: string;
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

  const [rentalInfo, setRentalInfo] = useState<RentalInfo>({
  area: "",
  startDate: "",
  endDate: "",
  selfDrive: "",
  duration: "",
  time: "",
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    referenceNumber: "",
  });

  
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const { pricingData, loading, error, calculatePrice } = useCarPricing(selectedCar);
  const [selectedCarData, setSelectedCarData] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fileInputKey, setFileInputKey] = useState<number>(0); // Add key to reset file input
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);

 

  const handleConfirmBooking = () => setShowConfirm(true);
  const handleCancelConfirm = () => setShowConfirm(false);
  const handleFinalSubmit = () => {
    setShowConfirm(false);
    console.log("Booking confirmed:", { personalInfo, rentalInfo, paymentInfo, selectedCar });
    // Add your booking submission logic here
  };

  // Personal Info Handlers
  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  
  // Only allow numbers for mobile number field
  if (name === "mobileNumber") {
    // Remove any non-digit characters
    const numbersOnly = value.replace(/\D/g, "");
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: numbersOnly,
    }));
  } else {
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPersonalInfo((prev) => ({
      ...prev,
      validId: file,
    }));
  };

  // Rental Info Handlers
  const handleRentalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRentalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Payment Info Handlers
  const handlePaymentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleConfirmBooking();
    }
  };

  const handleBack = () => {
  if (currentStep > 1) {
    // Reset the file input key when going back to step 1
    if (currentStep === 2) {
      setFileInputKey(prev => prev + 1);
    }
    setCurrentStep((prev) => prev - 1);
  }
};

// Helper function to format date (e.g., "Oct 15, 2024")
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to format time (e.g., "11:30 AM")
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};


// Calculate rental duration in hours based on dates AND time
const calculateRentalDetails = () => {
  if (!rentalInfo.startDate || !rentalInfo.endDate || !rentalInfo.time) {
    return { hours: 0, days: 0, totalPrice: 0, show12HourOption: false, show24HourOption: false };
  }

  // Parse dates with the selected time
  const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
  const endDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
  
  // Calculate difference in hours
  const timeDiff = endDateTime.getTime() - startDateTime.getTime();
  const hours = Math.ceil(timeDiff / (1000 * 3600));
  
  if (hours <= 0) return { hours: 0, days: 0, totalPrice: 0, show12HourOption: false, show24HourOption: false };

  // Calculate days (for multi-day pricing)
  const days = Math.ceil(hours / 24);

  // Determine which options to show
  const show12HourOption = hours <= 24 ; // Only show 12hr if actual duration is 12 hours and 24 hrs
  const show24HourOption = hours <= 24; // Show 24hr if actual duration is 24 hours or less

  // Calculate prices for each option
  const twelveHourPrice = calculatePrice(rentalInfo.area, "12 hours");
  const twentyFourHourPrice = calculatePrice(rentalInfo.area, "24 hours");
  const multiDayPrice = days * twentyFourHourPrice;

  // Calculate total price based on selected duration
  let totalPrice = 0;
  if (rentalInfo.duration === "12 hours") {
    totalPrice = twelveHourPrice;
  } else if (rentalInfo.duration === "24 hours") {
    totalPrice = twentyFourHourPrice;
  } else if (rentalInfo.duration?.includes("days")) {
    totalPrice = multiDayPrice;
  } else {
    // Default to appropriate price based on hours
    if (hours <= 12) {
      totalPrice = twelveHourPrice;
    } else if (hours <= 24) {
      totalPrice = twentyFourHourPrice;
    } else {
      totalPrice = multiDayPrice;
    }
  }

  return { 
    hours, 
    days, 
    totalPrice,
    twelveHourPrice,
    twentyFourHourPrice,
    multiDayPrice,
    show12HourOption, 
    show24HourOption 
  };
};

const { 
  hours, 
  days, 
  totalPrice,
  twelveHourPrice,
  twentyFourHourPrice, 
  multiDayPrice,
  show12HourOption, 
  show24HourOption 
} = calculateRentalDetails();

// Helper function to calculate return time based on selected duration
const calculateReturnTime = () => {
  if (!rentalInfo.startDate || !rentalInfo.time || !rentalInfo.duration) {
    return { returnDate: "", returnTime: "" };
  }

  const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
  let returnDateTime;

  if (rentalInfo.duration === "12 hours") {
    // Add 12 hours
    returnDateTime = new Date(startDateTime.getTime() + (12 * 60 * 60 * 1000));
  } else if (rentalInfo.duration === "24 hours") {
    // Add 24 hours
    returnDateTime = new Date(startDateTime.getTime() + (24 * 60 * 60 * 1000));
  } else if (rentalInfo.duration?.includes("days")) {
    // Add the number of days
    const days = parseInt(rentalInfo.duration);
    returnDateTime = new Date(startDateTime.getTime() + (days * 24 * 60 * 60 * 1000));
  } else {
    // Default to end date/time
    returnDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
  }

  const returnDate = returnDateTime.toISOString().split('T')[0];
  const returnTime = formatTime(returnDateTime.toTimeString().slice(0, 5));

  return { returnDate, returnTime };
};

const { returnDate, returnTime } = calculateReturnTime();




// Auto-set duration when dates AND time change, but allow dropdown for < 48hr rentals
useEffect(() => {
  if (rentalInfo.startDate && rentalInfo.endDate && rentalInfo.time) {
    const { hours } = calculateRentalDetails();
    
    // Only auto-set if no duration is selected or if it's a multi-day rental
    if (!rentalInfo.duration || hours > 48) {
      if (hours <= 12) {
        setRentalInfo(prev => ({ ...prev, duration: "12 hours" }));
      } else if (hours <= 24) {
        setRentalInfo(prev => ({ ...prev, duration: "24 hours" }));
      } else {
        // More than 24 hours - calculate days
        const days = Math.ceil(hours / 24);
        setRentalInfo(prev => ({ ...prev, duration: `${days} days` }));
      }
    }
  }
}, [rentalInfo.startDate, rentalInfo.endDate, rentalInfo.time]);


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
                          key={fileInputKey}
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.png,.jpg,.jpeg"
                          required={!personalInfo.validId}
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
            {/* Model Selection - Card carousel */}
            <div className="md:col-span-2">
              <SelectCar 
                selectedCar={selectedCar} 
                setSelectedCar={setSelectedCar}
                onCarSelect={setSelectedCarData}
              />              
            </div>

            {/* Transmission (Display only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
              <input
                type="text"
                disabled
                value={selectedCarData?.Transmission_Types?.Name || "—"}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>

            {/* Area Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                name="area"
                value={rentalInfo.area}
                onChange={handleRentalInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading} // Only disable while loading, not based on selectedCar
              >
                <option value="">Select area</option>
                {pricingData.map((area) => (
                  <option key={area.Location} value={area.Location}>
                    {area.Location}
                  </option>
                ))}
              </select>
              
              {!selectedCar && !loading && (
                <div className="text-sm text-gray-500 mt-1">Please select a car first</div>
              )}
              {loading && (
                <div className="text-sm text-gray-500 mt-1">Loading pricing...</div>
              )}
              {error && (
                <div className="text-sm text-red-500 mt-1">{error}</div>
              )}
            </div>

            {/* Time Dropdown - Move this BEFORE dates */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pick-up Time <span className="text-red-500">*</span>
            </label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileTimePicker
                label="Select time"
                value={selectedTime}
                onChange={(newTime: Dayjs | null) => {
                  setSelectedTime(newTime);
                  const timeString = newTime ? newTime.format('HH:mm') : '';
                  setRentalInfo(prev => ({ ...prev, time: timeString }));
                }}
                ampm={true}
                minutesStep={30}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>
          </div>
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={rentalInfo.startDate}
                onChange={handleRentalInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!rentalInfo.time} // Disable until time is selected
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={rentalInfo.endDate}
                onChange={handleRentalInputChange}
                min={rentalInfo.startDate || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!rentalInfo.startDate}
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
                value={rentalInfo.selfDrive}
                onChange={handleRentalInputChange}
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
              
              {hours > 0 ? (
                <select
                  name="duration"
                  value={rentalInfo.duration}
                  onChange={handleRentalInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select duration</option>
                  
                  {/* Show 12-hour option only if actual duration is 12 hours or less */}
                  {show12HourOption && (
                    <option value="12 hours">
                      ₱{twelveHourPrice}/12 hours
                    </option>
                  )}
                  
                  {/* Show 24-hour option only if actual duration is 24 hours or less */}
                  {show24HourOption && (
                    <option value="24 hours">
                      ₱{twentyFourHourPrice}/24 hours
                    </option>
                  )}
                  
                  {/* Show multi-day option for rentals longer than 24 hours */}
                  {hours > 24 && (
                    <option value={`${days} days`}>
                      ₱{multiDayPrice} for {days} {days === 1 ? 'day' : 'days'} ({hours} hours total)
                    </option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value="Select dates and time first"
                  disabled
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              )}
              
              <div className="text-sm text-gray-500 mt-1">
                {hours > 0 ? (
                  <>
                    {hours} hours total • 
                    {show12HourOption ? " 12-hour return possible" : 
                    show24HourOption ? " 24-hour return possible" : 
                    " Multi-day rental"}
                  </>
                ) : (
                  "Select dates and time to calculate duration"
                )}
              </div>
            </div>
            
          </div>
        </div>

       {/* Price + Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">
            {rentalInfo.duration ? `Initial Price: ₱${totalPrice}` : "Initial Price: ₱0"}
          </span>
          {rentalInfo.startDate && rentalInfo.time && rentalInfo.duration && (
            <div className="text-xs text-gray-600 mt-1 space-y-1">
              <div>
                <span className="font-medium">Pickup:</span> {formatDate(rentalInfo.startDate)} at {formatTime(rentalInfo.time)}
              </div>
              <div>
                <span className="font-medium">Return:</span> {formatDate(returnDate)} at {returnTime}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {rentalInfo.duration}
              </div>
              <div>
                <span className="font-medium">Vehicle:</span> {selectedCarData?.Model_Name || "No car selected"} • {rentalInfo.area}
              </div>
            </div>
          )}
        </div>
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
            disabled={!rentalInfo.duration}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      </form>
    </div>
  );
      case 3:
  // Calculate fees and totals
  const bookingFee = 500; // Fixed booking fee
  const carWashFee = 300; // Fixed car wash fee
  const initialPayment = totalPrice || 0; // From case 2
  const totalPayment = bookingFee + carWashFee + initialPayment;

  return (
    <div className="relative p-6">
      {/* Main Payment Section */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Payment Details Text */}
            <div>
              <p className="text-sm text-gray-700 mb-4">
                Please scan the QR Code for GCash Payment and pay the booking
                fee. For the <strong>total payment</strong>, you may pay through
                face-to-face.
              </p>
              
              {/* Cost Breakdown */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Booking Fee:</strong> ₱{bookingFee}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cost Breakdown:</strong> ₱{initialPayment} (Rental) + ₱{carWashFee} (Car Wash)
                </p>
              </div>

              {/* Total Payment */}
              <p className="mt-6 text-sm font-semibold text-gray-800">
                Total Payment: ₱{totalPayment}
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
                  value={paymentInfo.referenceNumber}
                  onChange={handlePaymentInputChange}
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
            type="submit"
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

            {/* Display payment summary in confirmation */}
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