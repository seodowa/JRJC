'use client';

import { Review } from '@/types';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to format the date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const TILES_PER_PAGE_LG = 3;
const TILES_PER_PAGE_MD = 2;

interface RecentFeedbackProps {
  reviews: Review[];
}

const RecentFeedback = ({ reviews }: RecentFeedbackProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [tilesPerPage, setTilesPerPage] = useState(TILES_PER_PAGE_LG);
  const [animationClass, setAnimationClass] = useState('opacity-100');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setTilesPerPage(1);
      } else if (window.innerWidth < 1024) {
        setTilesPerPage(TILES_PER_PAGE_MD);
      } else {
        setTilesPerPage(TILES_PER_PAGE_LG);
      }
      setCurrentPage(0); // Reset to first page on resize
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(reviews.length / tilesPerPage);
  const startIndex = currentPage * tilesPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + tilesPerPage);

  const handleNavigation = (direction: 'prev' | 'next') => {
    setAnimationClass('opacity-0');
    setTimeout(() => {
      if (direction === 'prev') {
        setCurrentPage(prev => (prev > 0 ? prev - 1 : totalPages > 1 ? totalPages - 1 : 0));
      } else {
        setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));
      }
      setAnimationClass('opacity-100');
    }, 300); // Match transition duration
  };

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl">Recent feedback</h2>
        <span className="num text-xs text-ink-2">Last 30 days</span>
      </div>
      
      {reviews.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-line-strong">
            <p>No feedback in the last 30 days.</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="relative">
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${animationClass}`}
          >
            {currentReviews.map((review) => (
              <div key={review.id} className="flex h-40 min-h-0 flex-col justify-between rounded-md border border-line bg-paper p-4">
                {/* Top part of the card (title, user, car, rating) */}
                <div className="flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display text-lg leading-tight">{review.title}</h3>
                      <p className="text-sm text-gray-600">By {review.userName}</p>
                      <p className="text-sm text-gray-500">{review.car?.brand} {review.car?.model}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-clay' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.959a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.539 1.118l-3.365-2.446a1 1 0 00-1.175 0l-3.365 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.959a1 1 0 00-.364-1.118L2.25 9.386c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.959z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Scrollable comment section */}
                <div className="mt-2 text-gray-700 text-sm flex-grow overflow-y-auto">
                  <p>
                    {review.comment}
                  </p>
                </div>

                {/* Bottom part of the card (date) */}
                <p className="text-xs text-gray-500 mt-2 text-right flex-shrink-0">{formatDate(review.createdAt)}</p>
              </div>
            ))}
            {/* Placeholder tiles for consistent layout */}
            {Array.from({ length: tilesPerPage - currentReviews.length }).map((_, index) => (
              <div key={`placeholder-${index}`} className="hidden md:block p-4 border border-transparent rounded-lg h-40" />
            ))}
          </div>

          {totalPages > 1 && (
            <>
              <button 
                onClick={() => handleNavigation('prev')} 
                aria-label="Previous" className="absolute top-1/2 -left-4 z-10 -translate-y-1/2 rounded-md border border-ink bg-paper p-1.5 transition-colors hover:bg-ink hover:text-paper"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button 
                onClick={() => handleNavigation('next')} 
                aria-label="Next" className="absolute top-1/2 -right-4 z-10 -translate-y-1/2 rounded-md border border-ink bg-paper p-1.5 transition-colors hover:bg-ink hover:text-paper"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentFeedback;