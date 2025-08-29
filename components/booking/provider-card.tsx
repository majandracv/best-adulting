"use client"

import type { Provider } from "@/lib/actions/providers"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Shield, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface ProviderCardProps {
  provider: Provider
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const formatRate = (cents?: number) => {
    if (!cents) return "Rate on request"
    return `$${(cents / 100).toFixed(0)}/hr`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
      />
    ))
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              {provider.profile_image_url ? (
                <img
                  src={provider.profile_image_url || "/placeholder.svg"}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">{provider.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{provider.name}</h3>
              <p className="text-sm text-muted-foreground">{provider.service_type}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              {renderStars(provider.rating || 0)}
              <span className="text-sm text-muted-foreground ml-1">({provider.review_count || 0})</span>
            </div>
            <p className="text-sm font-medium text-foreground">{formatRate(provider.hourly_rate_cents)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {provider.bio && <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio}</p>}

        <div className="flex flex-wrap gap-2">
          {provider.specialties?.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            {provider.years_experience && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{provider.years_experience} years</span>
              </div>
            )}

            {provider.insurance_verified && (
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-primary" />
                <span>Insured</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{provider.service_radius_miles || 25} miles</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/booking/providers/${provider.id}`}>View Profile & Book</Link>
          </Button>

          {provider.phone && (
            <Button variant="outline" size="icon" asChild>
              <a href={`tel:${provider.phone}`}>
                <Phone className="w-4 h-4" />
              </a>
            </Button>
          )}

          {provider.email && (
            <Button variant="outline" size="icon" asChild>
              <a href={`mailto:${provider.email}`}>
                <Mail className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
