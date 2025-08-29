"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import type { Provider } from "@/lib/actions/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { createBooking } from "@/lib/actions/bookings"

interface BookingFormProps {
  provider: Provider
}

export function BookingForm({ provider }: BookingFormProps) {
  const searchParams = useSearchParams()
  const taskId = searchParams.get("task")

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [serviceType, setServiceType] = useState<string>("")
  const [estimatedHours, setEstimatedHours] = useState<number>(1)
  const [customerNotes, setCustomerNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (taskId) {
      // Pre-select maintenance service type when booking from a task
      setServiceType("maintenance")
      setCustomerNotes("Booking for household maintenance task")
    }
  }, [taskId])

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !serviceType) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("provider_id", provider.id)
      formData.append("service_date", format(selectedDate, "yyyy-MM-dd"))
      formData.append("scheduled_start_time", selectedTime)
      formData.append("service_type", serviceType)
      formData.append("estimated_duration_hours", estimatedHours.toString())
      formData.append("customer_notes", customerNotes)

      if (taskId) {
        formData.append("task_id", taskId)
      }

      const totalCost = (provider.hourly_rate_cents || 0) * estimatedHours
      formData.append("total_cost_cents", totalCost.toString())

      await createBooking(formData)
    } catch (error) {
      console.error("Booking failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalCost = (provider.hourly_rate_cents || 0) * estimatedHours

  return (
    <Card>
      <CardHeader>
        <CardTitle>{taskId ? "Book Service for Task" : "Book This Provider"}</CardTitle>
        {taskId && (
          <p className="text-sm text-muted-foreground">This booking will be linked to your maintenance task</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Service Needed</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
              required
            >
              <option value="">Select a service</option>
              <option value="consultation">Consultation</option>
              <option value="repair">Repair</option>
              <option value="installation">Installation</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Time</label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                      selectedTime === time
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-input text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Estimated Duration (hours)</label>
            <select
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hour{hours > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Describe the work needed, any specific requirements, or questions..."
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground"
              rows={4}
            />
          </div>

          {/* Cost Summary */}
          {provider.hourly_rate_cents && (
            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <span>Rate: ${(provider.hourly_rate_cents / 100).toFixed(0)}/hour</span>
                <span>Duration: {estimatedHours} hours</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg mt-2">
                <span>Estimated Total:</span>
                <span>${(totalCost / 100).toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Final cost may vary based on actual work performed</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedDate || !selectedTime || !serviceType || isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
