"use client";

import { useState } from 'react';

interface PersonalInformationFormProps {
  onNext: () => void;
}

const PersonalInformationForm = ({ onNext }: PersonalInformationFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    suffix: '',
    email: '',
    mobileNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Personal Information</h2>
      <form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name: *
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your first name"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name: *
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your last name"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
              Suffix:
            </label>
            <input
              type="text"
              name="suffix"
              id="suffix"
              value={formData.suffix}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address: *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number: *
            </label>
            <input
              type="text"
              name="mobileNumber"
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your mobile number"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onNext}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformationForm;
