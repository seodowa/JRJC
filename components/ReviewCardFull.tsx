"use client"

import { ReviewForDisplay } from "@/types"
import { ThumbsUp } from "lucide-react"
import { getTimeAgo } from "@/utils/dateUtils"
import { useEffect, useState } from "react";
import ReviewStars from "./ReviewStars";

interface ReviewCardFullProps {
  review: ReviewForDisplay;
  onToggleHelpful: (id: number) => void;
}

export default function ReviewCardFull({ review, onToggleHelpful }: ReviewCardFullProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')

  const handleHelpful = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleHelpful(review.id);
  }

  useEffect(() => {
    setTimeAgo(getTimeAgo(new Date(review.createdAt)))
  }, [review.createdAt])

  return (
    <article className="relative flex flex-col gap-5 rounded-md border border-line bg-surface p-6 shadow-xl sm:p-8">
      <div className="flex items-center gap-3 pr-10">
        <ReviewStars rating={review.rating} size={17} />
        <span className="num text-xs text-ink-2">{timeAgo}</span>
      </div>

      <span aria-hidden="true" className="-mb-6 h-10 font-display text-7xl leading-none text-clay">“</span>
      {review.title && (
        <h4 className="font-display text-3xl leading-tight tracking-tight">{review.title}</h4>
      )}
      <p className="font-display text-xl leading-relaxed font-light text-ink">{review.comment}</p>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium tracking-[0.1em] uppercase">{review.userName}</span>
          {review.car?.model && (
            <span className="text-sm text-ink-2">{review.car?.brand} {review.car?.model}</span>
          )}
        </div>
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            review.isHelpful ? 'bg-forest-tint text-forest' : 'text-ink-2 hover:bg-gray-200'
          }`}
        >
          <ThumbsUp size={16} strokeWidth={1.75} className={review.isHelpful ? 'fill-current' : ''} />
          Helpful{review.helpfulCount > 0 && <span className="num">({review.helpfulCount})</span>}
        </button>
      </div>
    </article>
  )
}
