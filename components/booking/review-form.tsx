"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useState } from "react"
import { createProviderReview } from "@/lib/actions/providers"

interface ReviewFormProps {
  providerId: string
  onClose: () => void
}

export function ReviewForm({ providerId, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [serviceDate, setServiceDate] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("provider_id", providerId)
      formData.append("rating", rating.toString())
      formData.append("review_text", reviewText)
      formData.append("service_date", serviceDate)
      formData.append("would_recommend", wouldRecommend.toString())

      await createProviderReview(formData)
      onClose()
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)} className="p-1">
                  <Star className={`w-6 h-6 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Service Date</label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this provider..."
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recommend"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="recommend" className="text-sm text-foreground">
              I would recommend this provider
            </label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
