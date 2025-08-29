"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Phone, Mail, CheckCircle, AlertCircle, XCircle, Loader } from "lucide-react"
import { updateBookingStatus, deleteBooking } from "@/lib/actions/bookings"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BookingDetailProps {
  booking: any
}

export function BookingDetail({ booking }: BookingDetailProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      await updateBookingStatus(booking.id, newStatus)
    } catch (error) {
      console.error("Failed to update booking status:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return

    setIsDeleting(true)
    try {
      await deleteBooking(booking.id)
      router.push("/bookings")
    } catch (error) {
      console.error("Failed to cancel booking:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />
      case "confirmed":
        return <CheckCircle className="w-5 h-5" />
      case "in-progress":
        return <Loader className="w-5 h-5" />
      case "completed":
        return <CheckCircle className="w-5 h-5" />
      case "cancelled":
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
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

  const canUpdateStatus = booking.status !== "completed" && booking.status !== "cancelled"
  const isPastDate = new Date(booking.service_date) < new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking Details</h1>
          <p className="text-muted-foreground">Manage your service appointment</p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(booking.status)}
          <Badge className={getStatusColor(booking.status)}>
            <span className="capitalize">{booking.status}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
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
                {booking.total_cost_cents && (
                  <div className="text-right">
                    <p className="font-medium">Estimated Cost</p>
                    <p className="text-lg font-semibold">{formatCost(booking.total_cost_cents)}</p>
                  </div>
                )}
              </div>

              {booking.customer_notes && (
                <div className="pt-4 border-t">
                  <p className="font-medium mb-2">Service Notes</p>
                  <p className="text-muted-foreground text-sm bg-muted/50 p-3 rounded">{booking.customer_notes}</p>
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
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  {booking.providers.profile_image_url ? (
                    <img
                      src={booking.providers.profile_image_url || "/placeholder.svg"}
                      alt={booking.providers.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-muted-foreground">
                      {booking.providers.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{booking.providers.name}</h3>
                  <p className="text-muted-foreground capitalize mb-3">{booking.providers.service_type}</p>

                  <div className="space-y-2">
                    {booking.providers.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${booking.providers.phone}`} className="text-primary hover:underline">
                          {booking.providers.phone}
                        </a>
                      </div>
                    )}

                    {booking.providers.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
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
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{booking.tasks.title}</p>
                    {booking.tasks.description && (
                      <p className="text-muted-foreground text-sm mt-1">{booking.tasks.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canUpdateStatus && !isPastDate && (
                <>
                  {booking.status === "pending" && (
                    <Button
                      onClick={() => handleStatusUpdate("confirmed")}
                      disabled={updatingStatus}
                      className="w-full"
                    >
                      Confirm Booking
                    </Button>
                  )}

                  {booking.status === "confirmed" && (
                    <Button
                      onClick={() => handleStatusUpdate("in-progress")}
                      disabled={updatingStatus}
                      variant="outline"
                      className="w-full"
                    >
                      Mark In Progress
                    </Button>
                  )}

                  {booking.status === "in-progress" && (
                    <Button
                      onClick={() => handleStatusUpdate("completed")}
                      disabled={updatingStatus}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Mark Completed
                    </Button>
                  )}
                </>
              )}

              {booking.providers.phone && (
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={`tel:${booking.providers.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Provider
                  </a>
                </Button>
              )}

              {booking.providers.email && (
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={`mailto:${booking.providers.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email Provider
                  </a>
                </Button>
              )}

              {canUpdateStatus && (
                <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" className="w-full">
                  {isDeleting ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/bookings">Back to Bookings</Link>
            </Button>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/booking">Book Another Service</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
