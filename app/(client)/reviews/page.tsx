"use client"

import { useEffect, useMemo, useState } from "react";
import { ALL_REVIEWS } from "@/lib/data/reviews";
import { ChevronDown, Filter, Star } from "lucide-react";
import ReviewCardFull from "@/components/ReviewCardFull";
import { Review } from "@/types";
import { updateHelpfulCount } from "@/lib/supabase/mutations/updateReview";

const ReviewsPage = () => {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(ALL_REVIEWS)
  const [helpfulMap, setHelpfulMap] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false) 

  const handleToggleHelpful = (clickedId: number) => {
    const id = clickedId; 
    const currentCount = reviews.filter(review => review.id === id)[0].helpfulCount

    setHelpfulMap(currentMap => {
      return {
        ...currentMap,
        [id]: !currentMap[id] 
      };
    });

    if (!helpfulMap[id]) {
      updateHelpfulCount(id, currentCount+1)
      setReviews(reviews.map((review) => {
        if (review.id === id) {
          return {
            ...review,
            helpfulCount: currentCount+1
          }
        }
        
        return review;
      }))
    } else {
      updateHelpfulCount(id, currentCount-1)
      setReviews(reviews.map((review) => {
        if (review.id === id) {
          return {
            ...review,
            helpfulCount: currentCount-1
          }
        }
        
        return review;
      }))
    }
  };

   // This hook creates the final array for your UI
  const reviewsForDisplay = useMemo(() => {
    // Loop over the server data
    return reviews.map(review => {
      return {
        ...review,
        // Create the 'isHelpful' prop on the fly
        // by looking it up in the client state map
        isHelpful: helpfulMap[review.id] || false
      };
    });
  }, [reviews, helpfulMap]); // Dependencies

  // Calculate rating statistics
  const ratingStats = useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewsForDisplay.forEach(review => {
      stats[review.rating as keyof typeof stats]++
    })
    const total = reviewsForDisplay.length
    const average = reviewsForDisplay.reduce((sum, r) => sum + r.rating, 0) / total
    return { stats, total, average }
  }, [reviewsForDisplay])

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviewsForDisplay]

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating)
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } else if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpfulCount - a.helpfulCount)
    }

    return filtered
  }, [sortBy, filterRating, reviewsForDisplay])


  // 3. This NEW effect runs *only* on the client, *after* hydration
  useEffect(() => {
    // Now, load the state from localStorage
    try {
      const storedMap = localStorage.getItem('helpfulVotes');
      if (storedMap) {
        const parsed = JSON.parse(storedMap)
        setHelpfulMap(parsed);
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (parsed[review.id] && !helpfulMap[review.id]) {
              // User had voted before, increment count
              return { ...review, helpfulCount: review.helpfulCount }
            }
            return review
          })
        )
      }
    } catch (error) {
      console.error('Failed to parse helpful votes', error);
    }

    setMounted(true)
  }, []); // Empty array runs ONCE on mount


  useEffect(() => {
    if (!mounted) return
    try {
        // Convert the object into a JSON string and save it
        localStorage.setItem('helpfulVotes', JSON.stringify(helpfulMap));
      } catch (error) {
        console.error('Failed to save helpful votes to localStorage', error);
      }
  }, [helpfulMap]); // The dependency array


  if (!mounted) {
    return (
      <div className="min-h-screen bg-main-color -mt-12 pt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 bg-gray-200 h-96 rounded"></div>
              <div className="lg:col-span-3 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-48 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-16">
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
                  <ReviewCardFull key={review.id} review={review} onToggleHelpful={handleToggleHelpful}/>
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