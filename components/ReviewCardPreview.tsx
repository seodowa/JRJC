"use client"

import { ReviewForDisplay } from "@/types"
import { ThumbsUp } from "lucide-react"
import { getTimeAgo } from "@/utils/dateUtils"
import ReviewStars from "./ReviewStars"

interface ReviewCardPreviewProps {
  review: ReviewForDisplay;
  onCardClick: (id: number) => void;
  onToggleHelpful: (id: number) => void;
}

export default function ReviewCardPreview({ review, onCardClick, onToggleHelpful }: ReviewCardPreviewProps) {
  const handleHelpful = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleHelpful(review.id);
  }

  return (
    <article
      className="group relative flex min-w-xs max-w-xs cursor-pointer flex-col gap-4 rounded-md border border-line bg-surface p-6
                 transition-colors hover:border-ink md:min-w-md md:max-w-md lg:min-w-lg lg:max-w-lg"
      onClick={() => onCardClick(review.id)}
    >
      <div className="flex items-center justify-between">
        <ReviewStars rating={review.rating} />
        <span className="num text-xs text-ink-2">{getTimeAgo(new Date(review.createdAt))}</span>
      </div>

      <div className="flex flex-col gap-2">
        {review.title && (
          <h4 className="font-display text-2xl leading-tight tracking-tight">{review.title}</h4>
        )}
        <p className="line-clamp-2 leading-relaxed text-ink-2">{review.comment}</p>
      </div>

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
