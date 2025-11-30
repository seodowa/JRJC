"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect
import dayjs from 'dayjs';
import SelectCar from '@/components/SelectCar';
import BookingCalendar from '@/components/BookingCalendar';
import { LocalizationProvider, MobileTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useWalkInBooking } from '@/app/(admin)/context/WalkInBookingContext';
import AsyncButton from "@/components/AsyncButton";
import { formatDate, formatTime } from '@/utils/dateUtils';
import { Dispatch, SetStateAction } from 'react';

interface RentalDetailsFormProps {
  onBack: () => void;
  onNext: () => void;
}

const RentalDetailsForm = ({ onBack, onNext }: RentalDetailsFormProps) => {
  const {
    rentalInfo,
    setRentalInfo,
    selectedCar,
    setSelectedCar,
    selectedCarData,
    setSelectedCarData,
    cars,
    pricingData,
    loading,
    error,
    selectedTime,
    setSelectedTime,
    dateRangeError,
    setDateRangeError,
    calculateRentalDetails,
    calculateReturnTime
  } = useWalkInBooking();

  // --- FIX START: Add Mounted State ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // --- FIX END ---

  const {
    hours,
    days,
    totalPrice,
    twelveHourPrice,
    twentyFourHourPrice,
    multiDayPrice,
    show12HourOption,
    show24HourOption,
    isSameDay
  } = calculateRentalDetails();

  const { returnTime, returnDate } = calculateReturnTime();

  const handleRentalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRentalInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-8 rounded-4xl shadow-md mt-8">
      <h2 className="text-xl font-bold mb-6">Rental Details</h2>
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SelectCar 
                selectedCar={selectedCar} 
                setSelectedCar={setSelectedCar as Dispatch<SetStateAction<number | null>>}
                onCarSelect={setSelectedCarData}
                cars={cars}
              />              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
              <input
                type="text"
                disabled
                value={selectedCarData?.transmission || "—"}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                name="area"
                value={rentalInfo.area}
                onChange={handleRentalInputChange}
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm"
                required
                disabled={loading}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pick-up Time <span className="text-red-500">*</span>
              </label>
              {/* --- FIX START: Conditional Rendering --- */}
              {isMounted ? (
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
              ) : (
                // Optional: Loading placeholder to prevent layout shift
                <div className="w-full h-[40px] border border-gray-300 rounded-md bg-gray-50 animate-pulse" />
              )}
              {/* --- FIX END --- */}
            </div>

           <div className="md:col-span-2">
            <BookingCalendar
              selectedCar={selectedCarData?.id}
              startDate={rentalInfo.startDate}
              endDate={rentalInfo.endDate}
              onStartDateChange={(date) => 
                setRentalInfo(prev => ({ ...prev, startDate: date }))
              }
              onEndDateChange={(date) => 
                setRentalInfo(prev => ({ ...prev, endDate: date }))
              }
              onRangeError={setDateRangeError}
              minDate={dayjs()}
            />
        
            {dateRangeError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{dateRangeError}</p>
              </div>
            )}
          </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self-drive? <span className="text-red-500">*</span>
              </label>
              <select
                name="selfDrive"
                value={rentalInfo.selfDrive}
                onChange={handleRentalInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              
              {(hours > 0 || isSameDay) ? (
                <select
                  name="duration"
                  value={rentalInfo.duration}
                  onChange={handleRentalInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select duration</option>
                  
                  {show12HourOption && (
                    <option value="12 hours">
                      ₱{twelveHourPrice}/12 hours
                    </option>
                  )}
                  
                  {show24HourOption && (
                    <option value="24 hours">
                      ₱{twentyFourHourPrice}/24 hours
                    </option>
                  )}
                  
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
                ) : isSameDay ? (
                    "Same day selected • Choose 12 or 24 hours"
                ) : (
                  "Select dates and time to calculate duration"
                )}
              </div>
            </div>
          </div>
        </div>

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
                  <span className="font-medium">Return:</span> {formatDate( rentalInfo.endDate)} at {returnTime}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {rentalInfo.duration}
                </div>
                <div>
                  <span className="font-medium">Vehicle:</span> <span>{selectedCarData?.brand}</span>{" "}
                  <span>{selectedCarData?.model}</span>{" "}
                  <span>({selectedCarData?.year})</span> • {rentalInfo.area}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <AsyncButton
              type="button"
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 shadow-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back
            </AsyncButton>
            <AsyncButton
              type="submit"
              disabled={!rentalInfo.duration || dateRangeError !== null}
              className="bg-[#A1E3F9] hover:bg-blue-400 shadow-sm text-white font-bold py-2 px-4 rounded-lg"
            >
              Next
            </AsyncButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RentalDetailsForm;