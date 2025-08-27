"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { createBooking } from "@/lib/actions/bookings"

interface BookingDialogProps {
  provider: any
  household: any
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
}

export function BookingDialog({ provider, household, open, onOpenChange, locale }: BookingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState("")
  const t = useTranslations("booking")

  const handleSubmit = async (formData: FormData) => {
    if (!provider || !household) return

    setIsLoading(true)
    try {
      formData.append("provider_id", provider.id)
      formData.append("household_id", household.id)
      if (selectedTask) {
        formData.append("task_id", selectedTask)
      }

      await createBooking(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create booking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!provider) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-indigo">Book {provider.name}</DialogTitle>
          <DialogDescription>Schedule a service appointment</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="starts_at">Preferred Date & Time *</Label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              className="border-indigo/20"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ends_at">Expected End Time</Label>
            <Input id="ends_at" name="ends_at" type="datetime-local" className="border-indigo/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_cents">Estimated Price ($)</Label>
            <Input
              id="price_cents"
              name="price_cents"
              type="number"
              step="0.01"
              placeholder="150.00"
              className="border-indigo/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Service Details</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Describe what you need help with..."
              className="border-indigo/20"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo hover:bg-indigo/90 text-white">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("requestBooking")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
