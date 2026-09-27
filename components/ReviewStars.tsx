import { Star } from "lucide-react"

export default function ReviewStars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span role="img" className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          aria-hidden="true"
          className={i < rating ? 'fill-current text-clay' : 'text-line-strong'}
        />
      ))}
    </span>
  )
}
