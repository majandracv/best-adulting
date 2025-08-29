"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { ReviewForm } from "./review-form"

interface Review {
  id: string
  rating: number
  review_text: string
  service_date: string
  would_recommend: boolean
  created_at: string
  user_id: string
}

interface ReviewsListProps {
  reviews: Review[]
  providerId: string
}

export function ReviewsList({ reviews, providerId }: ReviewsListProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
      />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews ({reviews.length})</CardTitle>
          <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
            Write a Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showReviewForm && (
          <div className="mb-6">
            <ReviewForm providerId={providerId} onClose={() => setShowReviewForm(false)} />
          </div>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reviews yet. Be the first to review this provider!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>

                  {review.would_recommend && (
                    <div className="flex items-center space-x-1 text-primary">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Recommends</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-2">{review.review_text}</p>

                {review.service_date && (
                  <p className="text-xs text-muted-foreground">
                    Service completed: {format(new Date(review.service_date), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
