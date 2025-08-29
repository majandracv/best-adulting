"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Clock, UserCheck, ArrowRight } from "lucide-react"
import { getProviders } from "@/lib/actions/providers"
import type { Provider } from "@/lib/actions/providers"
import Link from "next/link"

interface TaskBookingDialogProps {
  task: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskBookingDialog({ task, open, onOpenChange }: TaskBookingDialogProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && task) {
      loadProviders()
    }
  }, [open, task])

  const loadProviders = async () => {
    setIsLoading(true)
    try {
      // Map task types to service types
      const serviceTypeMap: Record<string, string> = {
        hvac: "hvac",
        plumbing: "plumbing",
        electrical: "electrical",
        appliance: "appliance-repair",
        maintenance: "handyman",
        repair: "handyman",
        cleaning: "cleaning",
      }

      const taskTitle = task?.title?.toLowerCase() || ""
      const taskDescription = task?.description?.toLowerCase() || ""
      const assetName = task?.assets?.name?.toLowerCase() || ""

      let serviceType = "handyman" // default

      // Try to match service type from task content
      for (const [key, value] of Object.entries(serviceTypeMap)) {
        if (taskTitle.includes(key) || taskDescription.includes(key) || assetName.includes(key)) {
          serviceType = value
          break
        }
      }

      const providerList = await getProviders(serviceType)
      setProviders(providerList.slice(0, 3)) // Show top 3 providers
    } catch (error) {
      console.error("Failed to load providers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
      />
    ))
  }

  const formatRate = (cents?: number) => {
    if (!cents) return "Rate on request"
    return `$${(cents / 100).toFixed(0)}/hr`
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Service for Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">{task.title}</h3>
              {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
              <div className="flex items-center gap-4 text-sm">
                {task.assets && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Asset:</span>
                    <span>{task.assets.name}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Providers */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Recommended Service Providers</h4>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Finding providers...</p>
              </div>
            ) : providers.length > 0 ? (
              <div className="space-y-3">
                {providers.map((provider) => (
                  <Card key={provider.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            {provider.profile_image_url ? (
                              <img
                                src={provider.profile_image_url || "/placeholder.svg"}
                                alt={provider.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold text-muted-foreground">{provider.name.charAt(0)}</span>
                            )}
                          </div>

                          <div>
                            <h5 className="font-semibold text-foreground">{provider.name}</h5>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="flex items-center space-x-1">
                                {renderStars(provider.rating || 0)}
                                <span className="text-muted-foreground">({provider.review_count || 0})</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{formatRate(provider.hourly_rate_cents)}</span>
                            </div>
                          </div>
                        </div>

                        <Button asChild size="sm">
                          <Link href={`/booking/providers/${provider.id}?task=${task.id}`}>
                            Book Now
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/booking?task=${task.id}`}>View All Providers</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No providers found for this service type</p>
                <Button variant="outline" asChild>
                  <Link href="/booking">Browse All Providers</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
