"use client";

import { useState } from 'react';

interface RentalDetailsFormProps {
  onBack: () => void;
  onNext: () => void;
}

const RentalDetailsForm = ({ onBack, onNext }: RentalDetailsFormProps) => {
  const [formData, setFormData] = useState({
    model: '',
    transmission: '',
    fuelType: '',
    area: '',
    date: '',
    time: '',
    selfDrive: '',
    duration: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-6">Rental Details</h2>
      <form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model: *
            </label>
            <button
              type="button"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-blue-500 text-white py-2 px-4"
            >
              Select car
            </button>
          </div>
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
              Transmission:
            </label>
            <input
              type="text"
              name="transmission"
              id="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              disabled
            />
          </div>
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
              Fuel Type:
            </label>
            <input
              type="text"
              name="fuelType"
              id="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              disabled
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="md:col-span-1">
            <label htmlFor="area" className="block text-sm font-medium text-gray-700">
              Area: *
            </label>
            <input
              type="text"
              name="area"
              id="area"
              value={formData.area}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date: *
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time: *
            </label>
            <input
              type="time"
              name="time"
              id="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="selfDrive" className="block text-sm font-medium text-gray-700">
              Self-drive? *
            </label>
            <select
              name="selfDrive"
              id="selfDrive"
              value={formData.selfDrive}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="md:col-span-1">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration: *
            </label>
            <input
              type="text"
              name="duration"
              id="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
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

export default RentalDetailsForm;
