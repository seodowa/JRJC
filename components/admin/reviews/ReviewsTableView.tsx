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
        <div key={review.id} className="grid grid-cols-12 gap-x-6 px-6 py-4">
          <div className="col-span-4 whitespace-normal">
            <div className="text-sm font-bold text-gray-900">{review.title}</div>
            <div className="text-sm text-gray-500 my-2">{review.comment}</div>
            <div className="text-sm text-gray-700">by {review.userName}</div>
          </div>
          <div className="col-span-2">
            <StarRating rating={review.rating} />
          </div>
          <div className="col-span-2 text-sm text-gray-500">
            {formatDate(review.createdAt)}
          </div>
          <div className="col-span-2 text-sm text-gray-500">
            {review.car ? `${review.car.make} ${review.car.model} ${review.car.year}` : 'N/A'}
          </div>
          <div className="col-span-2 text-sm text-gray-500">
            {review.helpfulCount}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsTableView;