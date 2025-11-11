"use client"

import { useMemo, useState } from "react";
import { ALL_REVIEWS } from "@/lib/data/reviews";
import { ChevronDown, Filter, Star } from "lucide-react";
import ReviewCardFull from "@/components/ReviewCardFull";

const ReviewsPage = () => {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Calculate rating statistics
  const ratingStats = useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ALL_REVIEWS.forEach(review => {
      stats[review.rating as keyof typeof stats]++
    })
    const total = ALL_REVIEWS.length
    const average = ALL_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / total
    return { stats, total, average }
  }, [])

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...ALL_REVIEWS]

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating)
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => (b.createdAt - a.createdAt))
    } else if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpfulCount - a.helpfulCount)
    }

    return filtered
  }, [sortBy, filterRating])

  return (
    <div className="min-h-screen bg-main-color -mt-12 pt-12">
      {/* Header */}
      <div className="bg-main-color border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Reviews</h1>
          <p className="text-gray-600">See what our customers are saying about their rental experience</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full flex items-center justify-between mb-4 px-4 py-2 bg-gray-100 rounded-lg"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Filter size={20} />
                  Filters
                </span>
                <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                {/* Overall Rating */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Overall Rating</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {ratingStats.average.toFixed(1)}
                    </span>
                    <div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={20} 
                            className={i < Math.round(ratingStats.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{ratingStats.total} reviews</p>
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSortBy('recent')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        sortBy === 'recent' 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      Most Recent
                    </button>
                    <button
                      onClick={() => setSortBy('helpful')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        sortBy === 'helpful' 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      Most Helpful
                    </button>
                  </div>
                </div>

                {/* Filter by Rating */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Filter by Rating</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilterRating(null)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterRating === null 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      All Ratings ({ratingStats.total})
                    </button>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                          filterRating === rating 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span>{rating}</span>
                        </div>
                        <span className="text-sm">({ratingStats.stats[rating as keyof typeof ratingStats.stats]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {filterRating !== null && (
                  <button
                    onClick={() => setFilterRating(null)}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Reviews */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <strong>{filteredReviews.length}</strong> of <strong>{ratingStats.total}</strong> reviews
                {filterRating && ` with ${filterRating} stars`}
              </p>
            </div>

            {/* Reviews List */}
            {filteredReviews.length > 0 ? (
              <div className="space-y-6">
                {filteredReviews.map(review => (
                  <ReviewCardFull key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">No reviews found with the selected filters.</p>
                <button
                  onClick={() => setFilterRating(null)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default ReviewsPage;