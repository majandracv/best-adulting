"use client"

import type { Provider } from "@/lib/actions/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Shield, Phone, Mail, Globe, Award } from "lucide-react"
import { ReviewsList } from "./reviews-list"

interface ProviderProfileProps {
  provider: Provider & {
    review_count: number
    average_rating: number
    provider_reviews: any[]
  }
}

export function ProviderProfile({ provider }: ProviderProfileProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
      />
    ))
  }

  const formatRate = (cents?: number) => {
    if (!cents) return "Rate on request"
    return `$${(cents / 100).toFixed(0)}/hour`
  }

  return (
    <div className="space-y-6">
      {/* Provider Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              {provider.profile_image_url ? (
                <img
                  src={provider.profile_image_url || "/placeholder.svg"}
                  alt={provider.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">{provider.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                  <p className="text-lg text-muted-foreground">{provider.service_type}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(provider.average_rating || provider.rating || 0)}
                    <span className="text-sm text-muted-foreground ml-2">({provider.review_count} reviews)</span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">{formatRate(provider.hourly_rate_cents)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                {provider.years_experience && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{provider.years_experience} years experience</span>
                  </div>
                )}

                {provider.insurance_verified && (
                  <div className="flex items-center space-x-1 text-primary">
                    <Shield className="w-4 h-4" />
                    <span>Insured & Bonded</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Services {provider.service_radius_miles || 25} mile radius</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* About Section */}
      {provider.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{provider.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Specialties */}
      {provider.specialties && provider.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {provider.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {provider.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <a href={`tel:${provider.phone}`} className="text-primary hover:underline">
                  {provider.phone}
                </a>
              </div>
            )}

            {provider.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <a href={`mailto:${provider.email}`} className="text-primary hover:underline">
                  {provider.email}
                </a>
              </div>
            )}

            {provider.website_url && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <a
                  href={provider.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}

            {provider.license_number && (
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">License: {provider.license_number}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <ReviewsList reviews={provider.provider_reviews || []} providerId={provider.id} />
    </div>
  )
}
