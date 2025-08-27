"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, DollarSign, Calendar } from "lucide-react"
import { BookingDialog } from "./booking-dialog"

interface ProviderListProps {
  providers: any[]
  household: any
  locale: string
}

export function ProviderList({ providers, household, locale }: ProviderListProps) {
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const t = useTranslations("booking")

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (providers.length === 0) {
    return (
      <Card className="border-indigo/10">
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 text-indigo/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-indigo mb-2">{t("noProviders")}</h3>
          <p className="text-indigo/60">Check back later for available service providers</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-indigo mb-4">{t("providers")}</h2>
        <div className="grid gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="border-indigo/10 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-indigo">{provider.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {renderStars(provider.rating || 0)}
                        <span className="text-sm text-indigo/70 ml-1">
                          {provider.rating || 0} ({provider.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-indigo/70">{provider.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-indigo/60">
                    {provider.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location}</span>
                      </div>
                    )}
                    {provider.response_time_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Responds in {provider.response_time_hours}h</span>
                      </div>
                    )}
                    {provider.hourly_rate_cents && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatPrice(provider.hourly_rate_cents)}/hour</span>
                      </div>
                    )}
                  </div>

                  {provider.services && (
                    <div className="flex flex-wrap gap-2">
                      {provider.services.slice(0, 3).map((service: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-indigo/20 text-indigo">
                          {service}
                        </Badge>
                      ))}
                      {provider.services.length > 3 && (
                        <Badge variant="outline" className="border-indigo/20 text-indigo">
                          +{provider.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setSelectedProvider(provider)}
                      className="bg-indigo hover:bg-indigo/90 text-white"
                    >
                      {t("requestBooking")}
                    </Button>
                    <Button variant="outline" className="border-indigo/20 text-indigo hover:bg-indigo/5 bg-transparent">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BookingDialog
        provider={selectedProvider}
        household={household}
        open={!!selectedProvider}
        onOpenChange={(open) => !open && setSelectedProvider(null)}
        locale={locale}
      />
    </>
  )
}
