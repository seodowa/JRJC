"use client"

import "@/app/globals.css";
import ReviewCard from "../ReviewCard";
import { REVIEWS } from "@/lib/data/reviews";
import Carousel from "../Carousel";

export default function ReviewsSection() {
  const CAROUSEL_HEIGHT = 25 * 16; // rem * 16 = px

  return (
    <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-40">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-4 text-center">Customer Reviews</h1>
        <div className="flex justify-center items-start w-screen">
          <Carousel 
              items={REVIEWS} 
              renderItem={(review) => <ReviewCard review={review} />}
              height={CAROUSEL_HEIGHT}
          />
        </div>
    </section>
  );
}