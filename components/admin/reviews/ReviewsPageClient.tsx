'use client';

import { buttonClass } from "@/components/ui/button";
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
    <div className="flex h-full flex-col gap-7">
      <header className="flex items-end justify-between">
        <h1 className="text-4xl leading-none font-normal tracking-[-0.03em] md:text-5xl">Reviews</h1>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={buttonClass("secondary", "sm")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
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
      </header>
      <div className="flex-grow overflow-y-auto rounded-md border border-line bg-surface custom-scrollbar">
        <div className="num hidden grid-cols-12 gap-x-6 border-b border-ink px-6 py-3.5 text-[11px] font-medium tracking-[0.1em] text-ink-2 uppercase md:grid">
          <div className="col-span-6">Review</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-4">Details</div>
        </div>
        {filteredReviews.length > 0 ? (
          <ReviewsTableView reviews={filteredReviews} />
        ) : (
          <p className="p-12 text-center text-ink-2">No reviews found.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsPageClient;