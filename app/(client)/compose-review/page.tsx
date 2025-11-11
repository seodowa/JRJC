'use client'
import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { useReviewSubmission } from '@/hooks/useReviewSubmissions'
import { CARS } from '@/lib/data/cars'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'

interface ReviewFormData {
    name: string
    rating: number
    title: string
    body: string
    carId?: number
}

interface WriteReviewProps {
    carName?: string
    carId?: number
    onClose?: () => void
    allowCarSelection?: boolean
}

export default function ComposeReviewPage({
    carName,
    carId,
    onClose,
    allowCarSelection = true
}: WriteReviewProps) {
    const [formData, setFormData] = useState<ReviewFormData>({
        name: '',
        rating: 0,
        title: '',
        body: '',
        carId: carId
    })
    const [hoveredRating, setHoveredRating] = useState(0)
    const [errors, setErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({})
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const { submitReview, isSubmitting, error: submissionError } = useReviewSubmission({
        carId: formData.carId,
        onSuccess: () => {
            setSubmitSuccess(true)
            console.log('Review submitted successfully', getSelectedCarName())
          
            setFormData({ name: '', rating: 0, title: '', body: '', carId: carId })

            setTimeout(() => {
                setSubmitSuccess(false)
                onClose?.()
                redirect("/#reviews")
            }, 1000)
        },
        onError: (error) => {
            console.error('Review submission failed:', error)
       
        }
    })

    const handleStarClick = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }))
        setErrors(prev => ({ ...prev, rating: undefined }))
    }

    const handleChange = (field: keyof ReviewFormData, value: string | number | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const getSelectedCarName = () => {
        if (carName) return carName
        if (formData.carId) {
            const car = CARS.find(c => c.id === formData.carId)
            return car ? `${car.year} ${car.brand} ${car.model}` : undefined
        }
        return undefined
    }

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ReviewFormData, string>> = {}
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }
        if (formData.rating === 0) {
            newErrors.rating = 'Please select a rating'
        }
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }
        if (!formData.body.trim()) {
            newErrors.body = 'Review text is required'
        } else if (formData.body.trim().length < 10) {
            newErrors.body = 'Review must be at least 10 characters'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        await submitReview(formData)
    }

    const displayRating = hoveredRating || formData.rating

    return (
        <div className='w-full min-h-screen -mt-12 bg-secondary-50 py-16 overflow-y-auto'>
            <div className="w-full max-w-2xl mx-auto bg-transparent rounded-lg px-8">
                {/* Header */}
                <div className="mb-6 main-w-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                        {getSelectedCarName() && (
                            <p className="text-gray-600 mt-1">Reviewing: <span className="font-medium">{getSelectedCarName()}</span></p>
                        )}
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>


                {/* Form */}
                <form className="space-y-6 max-w-xl">
                    {/* Car Selection Field */}
                    {allowCarSelection && !carId && (
                        <div>
                            <label htmlFor="carId" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Car <span className="text-gray-500">(Optional)</span>
                            </label>
                            <select
                                id="carId"
                                value={formData.carId || ''}
                                onChange={(e) => handleChange('carId', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            >
                                <option value="">General Review (No specific car)</option>
                                {CARS.map((car) => (
                                    <option key={car.id} value={car.id}>
                                        {car.year} {car.brand} {car.model}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-sm text-gray-500">
                                Choose a car to review, or leave blank for a general review
                            </p>
                        </div>
                    )}

                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-400'
                            }`}
                            placeholder="Enter your name"
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Rating Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating <span className='text-red-500'>*</span>
                        </label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                    disabled={isSubmitting}
                                >
                                    <Star
                                        size={32}
                                        className={`${
                                            star <= displayRating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-400'
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                            {formData.rating > 0 && (
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
                                </span>
                            )}
                        </div>
                        {errors.rating && (
                            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                        )}
                    </div>

                    {/* Title Field */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Review Title <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.title ? 'border-red-500' : 'border-gray-400'
                            }`}
                            placeholder="Summarize your experience"
                            maxLength={100}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.title ? (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            ) : (
                                <span className="text-sm text-gray-500">
                                    Brief summary of your review
                                </span>
                            )}
                            <span className="text-sm text-gray-400">
                                {formData.title.length}/100
                            </span>
                        </div>
                    </div>

                    {/* Body Field */}
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review <span className='text-red-500'>*</span>
                        </label>
                        <textarea
                            id="body"
                            value={formData.body}
                            onChange={(e) => handleChange('body', e.target.value)}
                            rows={6}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                                errors.body ? 'border-red-500' : 'border-gray-400'
                            }`}
                            placeholder="Share details of your experience..."
                            maxLength={500}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.body ? (
                                <p className="text-sm text-red-600">{errors.body}</p>
                            ) : (
                                <span className="text-sm text-gray-500">
                                    Minimum 10 characters
                                </span>
                            )}
                            <span className="text-sm text-gray-400">
                                {formData.body.length}/500
                            </span>
                        </div>
                    </div>

                    {/* Success Message */}
                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                            <p className="text-green-800 font-medium">✓ Review submitted successfully!</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {submissionError && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                            <p className="text-red-800 font-medium">✗ {submissionError}</p>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex-1 py-3 px-6 hover:cursor-pointer rounded-lg font-semibold text-white transition-colors ${
                                isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-6 py-3 border border-gray-400 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                </form>

                {/* Guidelines */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Review Guidelines:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Be honest and detailed about your experience</li>
                        <li>• Focus on the service, vehicle condition, and overall experience</li>
                        <li>• Avoid using offensive language or personal attacks</li>
                        <li>• Reviews are public and will help other customers</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}