"use client";

import "@/app/globals.css";
import { TOP_FIVE_REVIEWS } from "@/lib/data/reviews";
import Carousel from "../Carousel";
import Modal from "../Modal";
import { useEffect, useMemo, useState } from "react";
import { Review } from "@/types";
import ReviewCardPreview from "../ReviewCardPreview";
import ReviewCardFull from "../ReviewCardFull";
import { LoadingSpinner } from "../LoadingSpinner";
import { updateHelpfulCount } from "@/lib/supabase/mutations/updateReview";

export default function ReviewsSection() {
  const CAROUSEL_HEIGHT = 25 * 16; // rem * 16 = px
  const [reviews, setReviews] = useState<Review[]>(TOP_FIVE_REVIEWS);
  const [isFullReviewModalOpen, setisFullReviewModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [helpfulMap, setHelpfulMap] = useState<Record<number, boolean>>({});

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

  // Function to open the modal with the correct review data
  const handleCardClick = (id: number) => {
    setSelectedReviewId(id);
    setisFullReviewModalOpen(true);
  };

  // Function to close the modal
  const closeFullReviewModal = () => {
    setisFullReviewModalOpen(false);
    setSelectedReviewId(null);
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

  const selectedReview = reviewsForDisplay.find(
    review => review.id === selectedReviewId
  )

  // 3. This NEW effect runs *only* on the client, *after* hydration
  useEffect(() => {
    // Set hasMounted to true immediately
    setHasMounted(true); 

    // Now, load the state from localStorage
    try {
      const storedMap = localStorage.getItem('helpfulVotes');
      if (storedMap) {
        setHelpfulMap(JSON.parse(storedMap));
      }
    } catch (error) {
      console.error('Failed to parse helpful votes', error);
    }
  }, []); // Empty array runs ONCE on mount


  useEffect(() => {
      try {
        // Convert the object into a JSON string and save it
        localStorage.setItem('helpfulVotes', JSON.stringify(helpfulMap));
      } catch (error) {
        console.error('Failed to save helpful votes to localStorage', error);
      }
  }, [helpfulMap, hasMounted]); // The dependency array


  if (!hasMounted) {
    return (
        <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-40">
          <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-4 text-center">Customer Reviews</h1>
          <LoadingSpinner/>
        </section>
        )
  }

  return (
    <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-40">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-4 text-center">Customer Reviews</h1>
        <div className="flex justify-center items-start w-screen">
          {TOP_FIVE_REVIEWS.length > 0 && (
            <Carousel height={CAROUSEL_HEIGHT}>
              {reviewsForDisplay.map((review) => (
                <ReviewCardPreview 
                  key={review.id} 
                  review={review} 
                  onCardClick={handleCardClick} 
                  onToggleHelpful={handleToggleHelpful} 
                />
              ))}
            </Carousel>
          )}
          
          {/* The Modal Component */}
          <Modal isOpen={isFullReviewModalOpen} onClose={closeFullReviewModal}>
            {selectedReview && (
              <ReviewCardFull review={selectedReview} onToggleHelpful={handleToggleHelpful} />
            )}
          </Modal>

          {TOP_FIVE_REVIEWS.length <= 0 && (
            <p className="font-main-font pt-16 text-xl md:text-2xl">No reviews yet. Be the first to leave a review.</p>
          )}

        </div>
        <a href={"/compose-review"} className="font-main-font mt-8 text-[#3674B5]
                                                            hover:cursor-pointer hover:text-hover-color">Write a review</a>
        <a href={"/reviews"} className="font-main-font mt-4 text-[#3674B5]
                                                            hover:cursor-pointer hover:text-hover-color">See all reviews</a>
    </section>
  );
}