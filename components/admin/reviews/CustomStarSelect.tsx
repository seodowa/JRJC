'use client';

import { useState } from 'react';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.959a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.539 1.118l-3.365-2.446a1 1 0 00-1.175 0l-3.365 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.959a1 1 0 00-.364-1.118L2.25 9.386c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.959z" />
            </svg>
        ))}
    </div>
);

interface CustomStarSelectProps {
    selectedRating: number;
    onRatingChange: (rating: number) => void;
}

const CustomStarSelect = ({ selectedRating, onRatingChange }: CustomStarSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (rating: number) => {
        onRatingChange(rating);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-center">
                    {selectedRating > 0 ? <StarRating rating={selectedRating} /> : 'Rating'}
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10 border">
                    <ul className="py-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                            <li
                                key={rating}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelect(rating)}
                            >
                                <StarRating rating={rating} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomStarSelect;
