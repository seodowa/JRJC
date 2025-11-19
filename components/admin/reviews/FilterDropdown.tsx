'use client';

import { useState, useEffect } from 'react';
import { Car } from '@/types';
import CustomStarSelect from './CustomStarSelect';

interface FilterDropdownProps {
  cars: Car[];
  onApply: (filters: { rating: string; car: string; date: string }) => void;
  onReset: () => void;
  initialFilters: { rating: string; car: string; date: string };
}

const FilterDropdown = ({ cars, onApply, onReset, initialFilters }: FilterDropdownProps) => {
  const [selectedRating, setSelectedRating] = useState(parseInt(initialFilters.rating || '0'));
  const [selectedDate, setSelectedDate] = useState(initialFilters.date || '');
  const [selectedCar, setSelectedCar] = useState(initialFilters.car || '');

  return (
    <div className="absolute top-10 right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-10 border border-gray-200">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Filter Reviews</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        <div className="px-4 py-3">
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative mt-1">
                <input
                    type="date"
                    id="date-filter"
                    className="block w-full pl-3 pr-2 py-2 text-base border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>
        </div>

        <div className="px-4 py-3">
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <CustomStarSelect className="mt-1" selectedRating={selectedRating} onRatingChange={setSelectedRating} />
        </div>

        <div className="px-4 py-3">
            <label htmlFor="car-filter" className="block text-sm font-medium text-gray-700 mb-1">Car</label>
            <div className="relative mt-1">
                <select
                    id="car-filter"
                    className="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedCar}
                    onChange={(e) => setSelectedCar(e.target.value)}
                >
                  <option value="">All Cars</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>{car.brand} {car.model} {car.year}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-center">
            <button onClick={() => {
                setSelectedRating(0);
                setSelectedDate('');
                setSelectedCar('');
                onReset();
            }} className="text-sm font-medium text-red-600 hover:text-red-800">Reset</button>
            <button onClick={() => {
                onApply({ rating: selectedRating > 0 ? selectedRating.toString() : '', car: selectedCar, date: selectedDate });
            }} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Apply
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;
