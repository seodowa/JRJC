'use client';

import { useState, useEffect } from 'react';
import { Review, Car } from '@/types';
import ReviewsTableView from './ReviewsTableView';
import FilterDropdown from './FilterDropdown';

const ReviewsPageClient = ({ reviews, cars }: { reviews: Review[]; cars: Car[] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    car: '',
    date: '',
  });
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);

  useEffect(() => {
    setFilteredReviews(reviews);
  }, [reviews]);

  const applyFilters = (newFilters: { rating: string; car: string; date: string }) => {
    setFilters(newFilters);

    const predicates: ((review: Review) => boolean)[] = [];

    if (newFilters.rating) {
        const rating = parseInt(newFilters.rating);
        predicates.push(review => Number(review.rating) === rating);
    }
    if (newFilters.car) {
        const carId = parseInt(newFilters.car);
        predicates.push(review => review.car?.id === carId);
    }
    if (newFilters.date) {
        const filterDate = new Date(newFilters.date);
        // Adjust for timezone differences by comparing UTC dates
        const filterUTCDate = new Date(filterDate.getUTCFullYear(), filterDate.getUTCMonth(), filterDate.getUTCDate());
        predicates.push(review => {
            const reviewDate = new Date(review.createdAt);
            const reviewUTCDate = new Date(reviewDate.getUTCFullYear(), reviewDate.getUTCMonth(), reviewDate.getUTCDate());
            return reviewUTCDate.getTime() === filterUTCDate.getTime();
        });
    }

    const updatedReviews = reviews.filter(review => predicates.every(p => p(review)));

    setFilteredReviews(updatedReviews);
    setIsDropdownOpen(false);
  };

  const resetFilters = () => {
    setFilters({ rating: '', car: '', date: '' });
    setFilteredReviews(reviews);
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-md">
      <header className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">See Reviews</h1>
          <div className="relative"> {/* Added relative for dropdown positioning */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-5.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            {isDropdownOpen && (
              <FilterDropdown
                cars={cars}
                onApply={applyFilters}
                onReset={resetFilters}
                initialFilters={filters}
              />
            )}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-12 gap-x-6 px-6 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Review Content</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-4">Review Details</div>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8">
        {filteredReviews.length > 0 ? (
          <ReviewsTableView reviews={filteredReviews} />
        ) : (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
            <p className="text-gray-500">No reviews found.</p>
          </div>
        )}
      </main>
      <footer className="flex-shrink-0 p-6 border-t border-gray-200">
        {/* Footer content can go here */}
      </footer>
    </div>
  );
};

export default ReviewsPageClient;