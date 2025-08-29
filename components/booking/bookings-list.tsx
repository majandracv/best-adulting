"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Phone, CheckCircle, AlertCircle, XCircle, Loader } from "lucide-react"
import Link from "next/link"
import { updateBookingStatus } from "@/lib/actions/bookings"
import { useState } from "react"

interface BookingsListProps {
  bookings: any[]
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(bookingId)
    try {
      await updateBookingStatus(bookingId, newStatus)
    } catch (error) {
      console.error("Failed to update booking status:", error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Loader className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "in-progress":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatCost = (cents?: number) => {
    if (!cents) return "Cost TBD"
    return `$${(cents / 100).toFixed(0)}`
  }

  const groupedBookings = bookings.reduce(
    (groups, booking) => {
      const serviceDate = new Date(booking.service_date)
      const today = new Date()
      const isUpcoming = serviceDate >= today
      const key = isUpcoming ? "upcoming" : "past"

      if (!groups[key]) groups[key] = []
      groups[key].push(booking)
      return groups
    },
    {} as Record<string, any[]>,
  )

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-4">Book your first service to get started</p>
          <Button asChild>
            <Link href="/booking">Find Service Providers</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      {groupedBookings.upcoming && groupedBookings.upcoming.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {groupedBookings.upcoming.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {booking.providers.profile_image_url ? (
                            <img
                              src={booking.providers.profile_image_url || "/placeholder.svg"}
                              alt={booking.providers.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-muted-foreground">
                              {booking.providers.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground">{booking.providers.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{booking.service_type}</p>
                        </div>

                        <Badge className={getStatusColor(booking.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(booking.service_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{formatTime(booking.scheduled_start_time)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCost(booking.total_cost_cents)}</span>
                        </div>
                      </div>

                      {booking.tasks && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">Related Task:</span> {booking.tasks.title}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button asChild size="sm">
                        <Link href={`/bookings/${booking.id}`}>View Details</Link>
                      </Button>

                      {booking.providers.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${booking.providers.phone}`}>
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {groupedBookings.past && groupedBookings.past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {groupedBookings.past.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {booking.providers.name.charAt(0)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-medium text-foreground">{booking.providers.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{booking.service_type}</p>
                        </div>

                        <Badge variant="outline" className={getStatusColor(booking.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(booking.service_date).toLocaleDateString()}</span>
                        <span>{formatTime(booking.scheduled_start_time)}</span>
                        <span>{formatCost(booking.total_cost_cents)}</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
