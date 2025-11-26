"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/components/InputField";
import SelectCar from "@/components/SelectCar";
import { useCarPricing } from "@/hooks/useCarPricing";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MobileTimePicker } from "@mui/x-date-pickers";
import { Car } from "@/types";
import { fetchCars } from "@/lib/supabase/queries/client/fetchCars";
import { createBooking } from "@/lib/supabase/mutations/createBooking";
import BookingCalendar from "@/components/BookingCalendar";
import { sendBookingConfirmationService } from "@/app/services/bookingService"; 

interface PersonalInfo {
  firstName: string;
  lastName: string;
  suffix: string;
  email: string;
  mobileNumber: string;
}

interface RentalInfo {
  area: string;
  startDate: string;
  endDate: string;
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
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  
  // New State for Notification Preference
  const [notificationType, setNotificationType] = useState<'SMS' | 'Email'>('SMS');

  const handleConfirmBooking = () => setShowConfirm(true);
  const handleCancelConfirm = () => setShowConfirm(false);

  const handleFinalSubmit = async () => {
    if (!selectedCar) {
      setSubmitError("Please select a car");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // --- 1. Calculate Totals ---
      const { totalPrice } = calculateRentalDetails();
      const bookingFee = 500;
      const carWashFee = 300;
      const initialPayment = totalPrice || 0;
      const totalPayment = bookingFee + carWashFee + initialPayment;

      const bookingData = {
        personalInfo,
        rentalInfo,
        paymentInfo,
        selectedCar,
        totalPayment,
        bookingFee,
        carWashFee,
        initialPayment,
        bookingStatusId: 1, // Set status to Pending
        notificationPreference: notificationType, // <--- Pass preference to be saved in DB
      };

      // --- 2. Create Booking & Wait for Result ---
      const result = await createBooking(bookingData);
      
      console.log("Booking created:", result); 

      // --- 3. Extract Data ---
      const newBookingId = result.booking.Booking_ID;
      const statusText = "Pending";

      setBookingSuccess(true);

      // --- 4. Send Notification using Service ---
      await sendBookingConfirmationService(
        newBookingId,
        totalPayment,
        statusText,
        personalInfo.firstName,
        personalInfo.email, 
        personalInfo.mobileNumber,
        paymentInfo.referenceNumber,
        notificationType 
      );

      // --- 5. Reset Form ---
      setTimeout(() => {
        setShowConfirm(false);
        setPersonalInfo({
          firstName: "",
          lastName: "",
          suffix: "",
          email: "",
          mobileNumber: "",
        });
        setRentalInfo({
          area: "",
          startDate: "",
          endDate: "",
          selfDrive: "",
          duration: "",
          time: "",
        });
        setPaymentInfo({
          referenceNumber: "",
        });
        setSelectedCar(null);
        setSelectedCarData(null);
        setCurrentStep(1);
        setBookingSuccess(false);
        setNotificationType('SMS'); 
      }, 3000);
      
    } catch (error) {
      console.error("Booking submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  // ... (rest of the component remains unchanged)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "mobileNumber") {
      const numbersOnly = value.replace(/\D/g, "");
      setPersonalInfo((prev) => ({ ...prev, [name]: numbersOnly }));
    } else {
      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRentalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRentalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
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
      setCurrentStep((prev) => prev - 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const calculateRentalDetails = () => {
    if (!rentalInfo.startDate || !rentalInfo.endDate || !rentalInfo.time) {
      return { hours: 0, days: 0, totalPrice: 0, show12HourOption: false, show24HourOption: false };
    }
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    const endDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    const timeDiff = endDateTime.getTime() - startDateTime.getTime();
    const hours = Math.ceil(timeDiff / (1000 * 3600));
    if (hours <= 0) return { hours: 0, days: 0, totalPrice: 0, show12HourOption: false, show24HourOption: false };
    const days = Math.ceil(hours / 24);
    const show12HourOption = hours <= 24;
    const show24HourOption = hours <= 24;
    const twelveHourPrice = calculatePrice(rentalInfo.area, "12 hours");
    const twentyFourHourPrice = calculatePrice(rentalInfo.area, "24 hours");
    const multiDayPrice = days * twentyFourHourPrice;
    let totalPrice = 0;
    if (rentalInfo.duration === "12 hours") {
      totalPrice = twelveHourPrice;
    } else if (rentalInfo.duration === "24 hours") {
      totalPrice = twentyFourHourPrice;
    } else if (rentalInfo.duration?.includes("days")) {
      totalPrice = multiDayPrice;
    } else {
      if (hours <= 12) totalPrice = twelveHourPrice;
      else if (hours <= 24) totalPrice = twentyFourHourPrice;
      else totalPrice = multiDayPrice;
    }
    return { hours, days, totalPrice, twelveHourPrice, twentyFourHourPrice, multiDayPrice, show12HourOption, show24HourOption };
  };

  const { hours, days, totalPrice, twelveHourPrice, twentyFourHourPrice, multiDayPrice, show12HourOption, show24HourOption } = calculateRentalDetails();

  const calculateReturnTime = () => {
    if (!rentalInfo.startDate || !rentalInfo.time || !rentalInfo.duration) return { returnDate: "", returnTime: "" };
    const startDateTime = new Date(`${rentalInfo.startDate}T${rentalInfo.time}`);
    let returnDateTime;
    if (rentalInfo.duration === "12 hours") returnDateTime = new Date(startDateTime.getTime() + (12 * 60 * 60 * 1000));
    else if (rentalInfo.duration === "24 hours") returnDateTime = new Date(startDateTime.getTime() + (24 * 60 * 60 * 1000));
    else if (rentalInfo.duration?.includes("days")) {
      const days = parseInt(rentalInfo.duration);
      returnDateTime = new Date(startDateTime.getTime() + (days * 24 * 60 * 60 * 1000));
    } else returnDateTime = new Date(`${rentalInfo.endDate}T${rentalInfo.time}`);
    return { returnDate: returnDateTime.toISOString().split('T')[0], returnTime: formatTime(returnDateTime.toTimeString().slice(0, 5)) };
  };

  const { returnTime } = calculateReturnTime();

  useEffect(() => {
    const loadCars = async () => {
      const carData = await fetchCars();
      setCars(carData);
    };
    loadCars();
  }, []);

  useEffect(() => {
    if (rentalInfo.startDate && rentalInfo.endDate && rentalInfo.time) {
      const { hours } = calculateRentalDetails();
      if (!rentalInfo.duration || hours > 48) {
        if (hours <= 12) setRentalInfo(prev => ({ ...prev, duration: "12 hours" }));
        else if (hours <= 24) setRentalInfo(prev => ({ ...prev, duration: "24 hours" }));
        else {
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
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="First Name" name="firstName" type="text" value={personalInfo.firstName} onChange={handleInputChange} placeholder="Enter your first name" required className="col-span-3 md:col-span-1" />
                  <InputField label="Last Name" name="lastName" type="text" value={personalInfo.lastName} onChange={handleInputChange} placeholder="Enter your last name" required className="col-span-2 md:col-span-1" />
                  <InputField label="Suffix" name="suffix" type="text" value={personalInfo.suffix} onChange={handleInputChange} placeholder="(e.g., Jr.)" optional />
                  <InputField label="Email" name="email" type="email" value={personalInfo.email} onChange={handleInputChange} placeholder="Enter your email" required className="col-span-3 md:col-span-1" />
                  <InputField label="Mobile Number" name="mobileNumber" type="tel" value={personalInfo.mobileNumber} onChange={handleInputChange} placeholder="Enter your mobile number" required className="col-span-2 md:col-span-1" />
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full lg:w-auto">Next</button>
              </div>
            </form>
          </div>
        );
      case 2:
        return (
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <SelectCar selectedCar={selectedCar} setSelectedCar={setSelectedCar} onCarSelect={setSelectedCarData} cars={cars} />
                  </div>
                  {/* ... (Transmission, Area, Pick-up Time, BookingCalendar, Fuel Type, Self-drive inputs) ... */}
                  {/* Keeping existing inputs for brevity, assuming standard implementation */}
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label><input type="text" disabled value={selectedCarData?.transmission || "—"} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500" /></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area <span className="text-red-500">*</span></label>
                    <select name="area" value={rentalInfo.area} onChange={handleRentalInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" required disabled={loading}>
                      <option value="">Select area</option>
                      {pricingData.map((area) => <option key={area.Location} value={area.Location}>{area.Location}</option>)}
                    </select>
                    {!selectedCar && !loading && <div className="text-sm text-gray-500 mt-1">Please select a car first</div>}
                    {loading && <div className="text-sm text-gray-500 mt-1">Loading pricing...</div>}
                    {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pick-up Time <span className="text-red-500">*</span></label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MobileTimePicker label="Select time" value={selectedTime} onChange={(newTime: Dayjs | null) => { setSelectedTime(newTime); const timeString = newTime ? newTime.format('HH:mm') : ''; setRentalInfo(prev => ({ ...prev, time: timeString })); }} ampm={true} minutesStep={30} slotProps={{ textField: { required: true, fullWidth: true, size: "small" } }} />
                    </LocalizationProvider>
                  </div>
                  <div className="md:col-span-2">
                    <BookingCalendar selectedCar={selectedCarData?.id} startDate={rentalInfo.startDate} endDate={rentalInfo.endDate} onStartDateChange={(date) => setRentalInfo(prev => ({ ...prev, startDate: date }))} onEndDateChange={(date) => setRentalInfo(prev => ({ ...prev, endDate: date }))} onRangeError={setDateRangeError} minDate={dayjs()} />
                    {dateRangeError && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-700">{dateRangeError}</p></div>}
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label><input type="text" disabled value="Gasoline(Unleaded)" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500" /></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Self-drive? <span className="text-red-500">*</span></label>
                    <select name="selfDrive" value={rentalInfo.selfDrive} onChange={handleRentalInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" required>
                      <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration <span className="text-red-500">*</span></label>
                    {hours > 0 ? (
                      <select name="duration" value={rentalInfo.duration} onChange={handleRentalInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="">Select duration</option>
                        {show12HourOption && <option value="12 hours">₱{twelveHourPrice}/12 hours</option>}
                        {show24HourOption && <option value="24 hours">₱{twentyFourHourPrice}/24 hours</option>}
                        {hours > 24 && <option value={`${days} days`}>₱{multiDayPrice} for {days} {days === 1 ? 'day' : 'days'} ({hours} hours total)</option>}
                      </select>
                    ) : (
                      <input type="text" value="Select dates and time first" disabled className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                    )}
                    <div className="text-sm text-gray-500 mt-1">{hours > 0 ? <>{hours} hours total • {show12HourOption ? " 12-hour return possible" : show24HourOption ? " 24-hour return possible" : " Multi-day rental"}</> : "Select dates and time to calculate duration"}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{rentalInfo.duration ? `Initial Price: ₱${totalPrice}` : "Initial Price: ₱0"}</span>
                  {rentalInfo.startDate && rentalInfo.time && rentalInfo.duration && (
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      <div><span className="font-medium">Pickup:</span> {formatDate(rentalInfo.startDate)} at {formatTime(rentalInfo.time)}</div>
                      <div><span className="font-medium">Return:</span> {formatDate(rentalInfo.endDate)} at {returnTime}</div>
                      <div><span className="font-medium">Duration:</span> {rentalInfo.duration}</div>
                      <div><span className="font-medium">Vehicle:</span> <span>{selectedCarData?.brand}</span> <span>{selectedCarData?.model}</span> <span>({selectedCarData?.year})</span> • {rentalInfo.area}</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={handleBack} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200">Back</button>
                  <button type="submit" disabled={!rentalInfo.duration || dateRangeError !== null} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            </form>
          </div>
        );
      case 3:
        const bookingFee = 500;
        const carWashFee = 300;
        const initialPayment = totalPrice || 0;
        const totalPayment = bookingFee + carWashFee + initialPayment;

        return (
          <div className="relative p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <p className="text-sm text-gray-700 mb-4">Please scan the QR Code for GCash Payment and pay the booking fee. For the <strong>total payment</strong>, you may pay through face-to-face.</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700"><strong>Booking Fee:</strong> ₱{bookingFee}</p>
                      <p className="text-sm text-gray-700"><strong>Cost Breakdown:</strong> ₱{initialPayment} (Rental) + ₱{carWashFee} (Car Wash)</p>
                    </div>
                    <p className="mt-6 text-sm font-semibold text-gray-800">Total Payment: ₱{totalPayment}</p>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload the reference number below: <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" name="referenceNumber" value={paymentInfo.referenceNumber} onChange={handlePaymentInputChange} placeholder="Enter GCash reference number" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <img src="/images/qr-sample.png" alt="QR Code" className="w-48 h-48 border rounded-md shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={handleBack} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-8 rounded-md transition-colors duration-200">Back</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200">Book</button>
              </div>
            </form>

            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                  {bookingSuccess ? (
                    <div className="text-center">
                      <div className="text-green-500 text-4xl mb-4">✓</div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h2>
                      <p className="text-sm text-gray-600 mb-4">Your booking has been successfully submitted. Redirecting...</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                        {submitting ? "Submitting Booking..." : "Confirmation"}
                      </h2>
                      
                      {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                          <p className="text-sm text-red-600">{submitError}</p>
                        </div>
                      )}

                      {!submitting && (
                        <>
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Where should we send notifications?</p>
                            <div className="flex gap-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="notificationType"
                                  value="SMS"
                                  checked={notificationType === 'SMS'}
                                  onChange={() => setNotificationType('SMS')}
                                  className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">SMS</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="notificationType"
                                  value="Email"
                                  checked={notificationType === 'Email'}
                                  onChange={() => setNotificationType('Email')}
                                  className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Email</span>
                              </label>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between"><span>Total Payment:</span><span className="font-semibold">₱{totalPayment}</span></div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between gap-3">
                        <button onClick={handleCancelConfirm} disabled={submitting} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50">Cancel</button>
                        <button onClick={handleFinalSubmit} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400 flex items-center justify-center">
                          {submitting ? 'Processing...' : 'Confirm'}
                        </button>
                      </div>
                    </>
                  )}
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
          {/* ... (Header and Progress Bar logic same as before) ... */}
          <div className="lg:hidden mb-6 text-center">
            <span className="text-lg font-semibold text-gray-900">{["Personal Information", "Rental Details", "Payment Details"][currentStep - 1]}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 3) * 100}%` }}></div></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block lg:w-1/5">
              <div className="space-y-4">
                {["Personal Information", "Rental Details", "Payment Details"].map((step, index) => (
                  <div key={step} className={`p-4 rounded-lg border-2 ${index + 1 === currentStep ? "border-blue-600 bg-[rgba(161,227,249,1)]" : "border-gray-300 bg-white"}`}>
                    <div className={`font-medium text-sm ${index + 1 === currentStep ? "text-gray-900" : "text-gray-600"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index + 1 === currentStep ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"} font-bold text-sm mb-2`}>{index + 1}</div>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-4/5 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{["Personal Information", "Rental Details", "Payment Details"][currentStep - 1]}</h1>
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