"use client"

import "@/app/globals.css";
import { REVIEWS } from "@/lib/data/reviews";
import Carousel from "../Carousel";
import Modal from "../Modal";
import { useMemo, useState } from "react";
import { Review, ReviewForDisplay } from "@/types";
import ReviewCardPreview from "../ReviewCardPreview";
import ReviewCardFull from "../ReviewCardFull";

export default function ReviewsSection() {
  const CAROUSEL_HEIGHT = 25 * 16; // rem * 16 = px
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [helpfulMap, setHelpfulMap] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const handleToggleHelpful = (clickedId: number) => {
    const id = clickedId; 

    setHelpfulMap(currentMap => {
      return {
        ...currentMap,
        [id]: !currentMap[id] 
      };
    });
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

  // Function to open the modal with the correct review data
  const handleCardClick = (id: number) => {
    setSelectedReviewId(id);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReviewId(null);
  };

  const selectedReview = reviewsForDisplay.find(
    review => review.id === selectedReviewId
  )

  return (
    <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-40">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-4 text-center">Customer Reviews</h1>
        <div className="flex justify-center items-start w-screen">
          {REVIEWS.length > 0 && (
            <Carousel 
              items={reviewsForDisplay} 
              renderItem={(review) => <ReviewCardPreview review={review} onCardClick={handleCardClick} onToggleHelpful={handleToggleHelpful} />}
              height={CAROUSEL_HEIGHT}
            />
          )}
          
          {/* The Modal Component */}
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            {selectedReview && (
              <ReviewCardFull review={selectedReview} onToggleHelpful={handleToggleHelpful} />
            )}
          </Modal>

          {REVIEWS.length <= 0 && (
            <p className="font-main-font pt-16 text-xl md:text-2xl">No reviews yet. Be the first to leave a review.</p>
          )}
        </div>
    </section>
  );
}