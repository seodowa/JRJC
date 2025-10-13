"use client"

import "@/app/globals.css";
import ReviewCard from "../ReviewCard";
import { REVIEWS } from "@/lib/data/reviews";
import Carousel from "../Carousel";

export default function ReviewsSection() {
  return (
    <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-16">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-4 text-center">Customer Reviews</h1>
        <div className="flex justify-center items-start w-screen h-100">
          <Carousel 
              items={REVIEWS} 
              renderItem={(review) => <ReviewCard review={review} />}
              height={100}
          />
        </div>
    </section>
  );
}