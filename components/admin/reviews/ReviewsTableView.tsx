'use client';

import { Review } from '@/types';

// Helper function to format the date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

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

const ReviewsTableView = ({ reviews }: { reviews: Review[] }) => {
  return (
    <div className="divide-y divide-gray-200">
      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-x-6 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
          {/* Review Content */}
          <div className="col-span-12 md:col-span-6 space-y-2 md:space-y-1">
            <div className="flex justify-between items-start md:block">
                <h3 className="text-sm font-bold text-gray-900">{review.title}</h3>
                <div className="md:hidden">
                    <StarRating rating={review.rating} />
                </div>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-3 md:line-clamp-2">{review.comment}</p>
            <p className="text-xs text-gray-400">by <span className="text-gray-700 font-medium">{review.userName}</span></p>
          </div>
          
          {/* Rating (Desktop Only) */}
          <div className="hidden md:flex col-span-2 items-start pt-1">
            <StarRating rating={review.rating} />
          </div>

          {/* Booking Details */}
          <div className="col-span-12 md:col-span-4 flex flex-col space-y-2 mt-2 md:mt-0">
            <div className="flex items-center justify-between md:justify-start">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.car ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {review.car ? `${review.car.brand} ${review.car.model} ${review.car.year}` : 'No Car Linked'}
                </span>
                <span className="md:hidden text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                </span>
            </div>
            
            <div className="flex items-center text-xs text-gray-500 space-x-4">
                <span className="hidden md:inline">
                    {formatDate(review.createdAt)}
                </span>
                <span>
                    {review.helpfulCount} helpful
                </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsTableView;