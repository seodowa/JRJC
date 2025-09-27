// components/BookingPage.tsx
"use client";

import React, { useState } from 'react';
import InputField from '@/components/InputField';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  suffix: string;
  email: string;
  mobileNumber: string;
  validId: File | null;
}

const suffixOptions = [
  { value: '', label: 'Select suffix' },
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
];

const BookingPage: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    suffix: '',
    email: '',
    mobileNumber: '',
    validId: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPersonalInfo(prev => ({
      ...prev,
      validId: file
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Personal Info Submitted:', personalInfo);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Lip at Top - Mobile only */}
      <div className="lg:hidden bg-blue-600 h-5 rounded-b-lg"></div>
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Progress Bar - Only shows on mobile */}
          <div className="lg:hidden mb-6 text-center">
            <span className="text-lg font-semibold text-gray-900">Personal Information</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Stacked Rectangles (Progress Indicators) - Desktop only */}
            <div className="hidden lg:block lg:w-1/5">
              <div className="space-y-4">
                {['Personal Information', 'Rental Details', 'Payment Details'].map((step, index) => (
                  <div 
                    key={step}
                    className={`p-4 rounded-lg border-2 ${
                      index === 0 
                        ? 'border-blue-600' 
                        : 'border-gray-300'
                    } ${index === 0 ? 'bg-[rgba(161,227,249,1)]' : 'bg-white'}`}
                  >
                    <div className={`font-medium text-sm ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      } font-bold text-sm mb-2`}>
                        {index + 1}
                      </div>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-4/5">
              {/* Form Header - Shows on both mobile and desktop */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Personal Information</h1>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* On larger screens, 3 columns and 2 rows */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* On smaller screens, expand to full width */}
                        <InputField
                          label="First Name"
                          name="firstName"
                          type="text"
                          value={personalInfo.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                          required
                          className='col-span-3 md:col-span-1'
                        />

                        {/* On smaller screens, Last Name occupies 2 cols and Suffix 1*/}
                        <InputField
                          label="Last Name"
                          name="lastName"
                          type="text"
                          value={personalInfo.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                          required
                          className='col-span-2 md:col-span-1'
                        />
                    
                        <InputField
                          label="Suffix"
                          name="suffix"
                          type="text"
                          value={personalInfo.suffix}
                          onChange={handleInputChange}
                          placeholder='(e.g., Jr.)'
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
                          className='col-span-3 md:col-span-1'
                        />
                      
                        <InputField
                          label="Mobile Number"
                          name="mobileNumber"
                          type="tel"
                          value={personalInfo.mobileNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your mobile number"
                          required
                          className='col-span-2 md:col-span-1'
                        />

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Valid ID
                            <span className="inline text-red-500 ml-1">*</span>
                          </label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-6 h-6 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-1 text-xs text-gray-500 text-center">
                                  <span className="font-semibold">Upload ID</span>
                                </p>
                                <p className="text-xs text-gray-500 text-center">PDF, PNG, JPG</p>
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

                    {/* Submit Button */}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;