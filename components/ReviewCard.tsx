"use client"

import { Review } from "@/types"
import { Star, ThumbsUp, Flag, MoreVertical } from "lucide-react"
import { useState } from "react"

// Review Card Component
export default function ReviewCard({ review }: { review: Review }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false)

  const handleHelpful = () => {
    if (!hasVotedHelpful) {
      setHelpfulCount(count => count + 1)
      setHasVotedHelpful(true)
    } else {
      setHelpfulCount(count => count - 1)
      setHasVotedHelpful(false)
    }
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative max-w-xs">
      {/* Header - User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          
          {/* User Details */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
              {review.verified && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
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
        <span className="text-sm text-gray-500">{getTimeAgo(review.createdAt)}</span>
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2 text-lg">{review.title}</h5>
      )}

      {/* Review Text */}
      <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>


      {/* Car Name (if available) */}
      {review.car?.model && (
        <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg inline-block">
          <span className="text-sm text-gray-600">Reviewed: </span>
          <span className="text-sm font-medium text-gray-900">{review.car?.brand} {review.car?.model}</span>
        </div>
      )}

      {/* Footer - Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button 
          onClick={handleHelpful}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            hasVotedHelpful 
              ? 'bg-secondary-100 text-darker-color ' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsUp size={18} className={hasVotedHelpful ? 'fill-current' : ''} />
          <span className="text-sm font-medium">
            Helpful {helpfulCount > 0 && `(${helpfulCount})`}
          </span>
        </button>

        {review.updatedAt && review.updatedAt !== review.createdAt && (
          <span className="text-xs text-gray-400 italic">Edited</span>
        )}
      </div>
    </div>
  )
}