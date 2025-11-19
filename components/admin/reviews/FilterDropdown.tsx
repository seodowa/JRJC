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
    <div className="absolute top-14 right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-10 border">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Filter</h3>
      </div>
      <div className="border-t border-gray-200"></div>
      <div className="p-4">
        <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">Date</label>
        <input
            type="date"
            id="date-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <div className="p-4">
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <CustomStarSelect selectedRating={selectedRating} onRatingChange={setSelectedRating} />
      </div>
      <div className="p-4">
        <label htmlFor="car-filter" className="block text-sm font-medium text-gray-700">Car</label>
        <select
            id="car-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedCar}
            onChange={(e) => setSelectedCar(e.target.value)}
        >
          <option value="">Car</option>
          {cars.map(car => (
            <option key={car.id} value={car.id}>{car.make} {car.model}</option>
          ))}
        </select>
      </div>
      <div className="border-t border-gray-200"></div>
      <div className="p-4 flex justify-between">
        <button onClick={() => {
            setSelectedRating(0);
            setSelectedDate('');
            setSelectedCar('');
            onReset();
        }} className="text-sm text-red-600">Reset all</button>
        <button onClick={() => {
            onApply({ rating: selectedRating > 0 ? selectedRating.toString() : '', car: selectedCar, date: selectedDate });
        }} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterDropdown;
