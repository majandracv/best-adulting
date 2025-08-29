"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, AlertCircle, Phone, ExternalLink, Plus, Users } from "lucide-react"
import Link from "next/link"

interface BookingStatusWidgetProps {
  bookings: any[]
}

export function BookingStatusWidget({ bookings }: BookingStatusWidgetProps) {
  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.scheduled_date)
    const today = new Date()
    return bookingDate >= today && booking.status === "confirmed"
  })

  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const completedThisMonth = bookings.filter((booking) => {
    const bookingDate = new Date(booking.scheduled_date)
    const thisMonth = new Date()
    thisMonth.setDate(1)
    return bookingDate >= thisMonth && booking.status === "completed"
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-3 h-3" />
      case "pending":
        return <Clock className="w-3 h-3" />
      case "completed":
        return <CheckCircle className="w-3 h-3" />
      case "cancelled":
        return <AlertCircle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Service Bookings
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completedThisMonth.length} This Month
            </Badge>
            <Link href="/booking">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Book Service
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Status Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-lg font-bold">{upcomingBookings.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <p className="text-lg font-bold text-yellow-700">{pendingBookings.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-700">{completedThisMonth.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Next Appointments ({upcomingBookings.length})</h4>
            </div>
            <div className="space-y-2">
              {upcomingBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{booking.service_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.providers?.name} • {new Date(booking.scheduled_date).toLocaleDateString()} at{" "}
                      {booking.scheduled_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </Badge>
                    {booking.provider_phone && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Phone className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <h4 className="text-sm font-medium text-yellow-700">Awaiting Confirmation ({pendingBookings.length})</h4>
            </div>
            <div className="space-y-2">
              {pendingBookings.slice(0, 2).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded"
                >
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{booking.service_type}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested for {new Date(booking.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/bookings/${booking.id}`}>
                    <Button size="sm" variant="outline" className="h-6 px-2 bg-transparent">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No bookings yet</p>
            <Link href="/booking">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Book First Service
              </Button>
            </Link>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="pt-2 border-t">
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Bookings
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
