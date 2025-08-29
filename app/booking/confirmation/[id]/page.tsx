import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, Phone, Mail } from "lucide-react"
import { getBooking } from "@/lib/actions/bookings"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BookingConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const booking = await getBooking(params.id)
  if (!booking) {
    notFound()
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  return (
    <AppLayout>
      <Container>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your service appointment has been successfully booked. You'll receive a confirmation email shortly.
              </p>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Service Date</p>
                    <p className="text-muted-foreground">
                      {new Date(booking.service_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">
                      {formatTime(booking.scheduled_start_time)} ({booking.estimated_duration_hours} hours)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="font-medium">Service Type</p>
                  <p className="text-muted-foreground capitalize">{booking.service_type}</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {booking.status}
                </Badge>
              </div>

              {booking.total_cost_cents && (
                <div className="flex items-center justify-between pt-2">
                  <p className="font-medium">Estimated Cost</p>
                  <p className="text-lg font-semibold">{formatCost(booking.total_cost_cents)}</p>
                </div>
              )}

              {booking.customer_notes && (
                <div className="pt-2">
                  <p className="font-medium mb-1">Notes</p>
                  <p className="text-muted-foreground text-sm">{booking.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  {booking.providers.profile_image_url ? (
                    <img
                      src={booking.providers.profile_image_url || "/placeholder.svg"}
                      alt={booking.providers.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-muted-foreground">{booking.providers.name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{booking.providers.name}</h3>
                  <p className="text-muted-foreground capitalize">{booking.providers.service_type}</p>

                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    {booking.providers.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${booking.providers.phone}`} className="text-primary hover:underline">
                          {booking.providers.phone}
                        </a>
                      </div>
                    )}

                    {booking.providers.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${booking.providers.email}`} className="text-primary hover:underline">
                          {booking.providers.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Task */}
          {booking.tasks && (
            <Card>
              <CardHeader>
                <CardTitle>Related Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.tasks.title}</p>
                    {booking.tasks.description && (
                      <p className="text-muted-foreground text-sm">{booking.tasks.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/bookings">View All Bookings</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </Container>
    </AppLayout>
  )
}
