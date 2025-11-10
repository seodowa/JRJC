import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Review } from '@/types/review'

interface ReviewFormData {
  name: string
  rating: number
  title: string
  body: string
}

interface UseReviewSubmissionProps {
  carId?: number
  onSuccess?: (review: Review) => void
  onError?: (error: Error) => void
}

interface DatabaseReview {
  id: number
  created_at: string
  user_name: string
  rating: number
  title: string
  comment: string
  car_id: number | null
  helpful_count: number
}

export function useReviewSubmission({ 
  carId, 
  onSuccess, 
  onError 
}: UseReviewSubmissionProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const mapDatabaseToReview = (dbReview: DatabaseReview): Review => ({
    id: dbReview.id,
    userName: dbReview.user_name,
    rating: dbReview.rating,
    title: dbReview.title,
    comment: dbReview.comment,
    helpfulCount: dbReview.helpful_count,
    createdAt: new Date(dbReview.created_at)
  })

  const submitReview = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: insertedReview, error: insertError } = await supabase
        .from('Reviews')
        .insert({
          user_name: data.name.trim(),
          rating: data.rating,
          title: data.title.trim(),
          comment: data.body.trim(),
          car_id: carId || null,
          created_at: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
          helpful_count: 0
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      if (!insertedReview) {
        throw new Error('No data returned from insert')
      }

      const mappedReview = mapDatabaseToReview(insertedReview as DatabaseReview)
      onSuccess?.(mappedReview)
      return { success: true, data: mappedReview }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      return { success: false, error: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetError = () => setError(null)

  return {
    submitReview,
    isSubmitting,
    error,
    resetError
  }
}