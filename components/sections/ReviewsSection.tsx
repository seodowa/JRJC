"use client";

import { TOP_FIVE_REVIEWS } from "@/lib/data/reviews";
import Carousel from "../Carousel";
import Modal from "../Modal";
import { useEffect, useMemo, useState } from "react";
import { Review } from "@/types";
import ReviewCardPreview from "../ReviewCardPreview";
import ReviewCardFull from "../ReviewCardFull";
import SectionHeader from "../ui/SectionHeader";
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
        <section id="reviews" className="bg-gray-200/60">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-24 sm:px-8 lg:px-16">
            <SectionHeader index="02" label="Reviews" title="What renters say." />
            <LoadingSpinner/>
          </div>
        </section>
        )
  }

  return (
    <section id="reviews" className="bg-gray-200/60">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-24 sm:px-8 lg:px-16">
        <SectionHeader index="02" label="Reviews" title="What renters say.">
          <div className="flex gap-6 text-[15px] font-medium">
            <a href="/compose-review" className="text-forest hover:text-forest-hover">Write a review</a>
            <a href="/reviews" className="text-forest hover:text-forest-hover">All reviews →</a>
          </div>
        </SectionHeader>
        <div className="flex justify-center items-start w-full">
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
            <p className="font-display text-2xl text-ink-2">No reviews yet. Be the first to leave one.</p>
          )}

        </div>
      </div>
    </section>
  );
}