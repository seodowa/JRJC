import "@/app/globals.css";
import ReviewCard from "../ReviewCard";
import { REVIEWS } from "@/lib/data/reviews";

export default function ReviewsSection() {
  return (
    <section id="reviews" className="min-h-screen relative bg-secondary-50 flex flex-col items-center pt-16">
        <h1 className="font-main-font text-4xl sm:text-5xl md:text-6xl py-16 text-center">Customer Reviews</h1>
        <div className="flex justify-center items-start border-2 w-screen h-100">
          <ReviewCard review={REVIEWS[0]}/>
        </div>
    </section>
  );
}