"use client"

import "@/app/globals.css";
import { REVIEWS } from "@/lib/data/reviews";
import Carousel from "../Carousel";
import Modal from "../Modal";
import { useState } from "react";
import { Review } from "@/types";
import ReviewCardPreview from "../ReviewCardPreview";
import ReviewCardFull from "../ReviewCardFull";

export default function ReviewsSection() {
  const CAROUSEL_HEIGHT = 25 * 16; // rem * 16 = px

  // State to control the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold the review that should be displayed in the modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Function to open the modal with the correct review data
  const handleCardClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  return (
    <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-40">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-4 text-center">Customer Reviews</h1>
        <div className="flex justify-center items-start w-screen">
          {REVIEWS.length > 0 && (
            <Carousel 
              items={REVIEWS} 
              renderItem={(review) => <ReviewCardPreview review={review} onCardClick={handleCardClick} />}
              height={CAROUSEL_HEIGHT}
            />
          )}
          
          {/* The Modal Component */}
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            {selectedReview && (
              // We render a non-truncated version of the card inside the modal
              // Or you can create a dedicated "FullReview" component for a custom layout
              <ReviewCardFull review={selectedReview} />
            )}
          </Modal>

          {REVIEWS.length <= 0 && (
            <p className="font-main-font pt-16 text-xl md:text-2xl">No reviews yet. Be the first to leave a review.</p>
          )}
        </div>
    </section>
  );
}