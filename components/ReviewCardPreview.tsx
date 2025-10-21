"use client"

import { Review, ReviewForDisplay } from "@/types"
import { Star, ThumbsUp } from "lucide-react"
import { useState } from "react"

interface ReviewCardPreviewProps {
  review: ReviewForDisplay;
  onCardClick: (id: number) => void;
  onToggleHelpful: (id: number) => void;
}

// Review Card Component
export default function ReviewCardPreview({ review, onCardClick, onToggleHelpful }: ReviewCardPreviewProps) {
  const handleHelpful = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleHelpful(review.id);
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg hover:cursor-pointer 
                      transition-shadow p-6 relative min-w-xs max-w-xs md:min-w-md 
                      md:max-w-md lg:min-w-lg lg:max-w-lg"
         onClick={() => onCardClick(review.id)}
    >

      {/* Header - User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          
          {/* User Details */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={18} 
              className={`${
                i < review.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 font-semibold text-gray-900">{review.rating}.0</span>
        </div>
        <span className="text-sm text-gray-500">{getTimeAgo(new Date(review.createdAt))}</span>
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2 text-lg">{review.title}</h5>
      )}
      
      {/* Review Text */}
      <p className="text-gray-700 leading-relaxed mb-4 text-ellipsis overflow-hidden text-nowrap">{review.comment}</p>

      {/* Car Name (if available) */}
      <div className="mb-4 flex flex-col items-start justify-between md:justify-between">
        {review.car?.model && (
          <div className="px-3 py-2 bg-gray-50 rounded-lg inline-block">
            <span className="text-sm text-gray-600">Reviewed: </span>
            <span className="text-sm font-medium text-gray-900">{review.car?.brand} {review.car?.model}</span>
          </div>
        )}

      </div>

      {/* Footer - Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button 
          onClick={handleHelpful}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            review.isHelpful 
              ? 'bg-secondary-100 text-darker-color ' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsUp size={18} className={review.isHelpful ? 'fill-current' : ''} />
          <span className="text-sm font-medium">
            Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
          </span>
        </button>
        
        
        
      </div>
    </div>
  )
}