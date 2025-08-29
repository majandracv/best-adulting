"use client"

import type React from "react"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign } from "lucide-react"

interface CompleteTaskDialogProps {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (taskId: string, formData: FormData) => Promise<void>
  isLoading: boolean
}

export function CompleteTaskDialog({ taskId, open, onOpenChange, onComplete, isLoading }: CompleteTaskDialogProps) {
  const [timeSpent, setTimeSpent] = useState("")
  const [notes, setNotes] = useState("")
  const [costAmount, setCostAmount] = useState("")
  const [costVendor, setCostVendor] = useState("")
  const [costCategory, setCostCategory] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId) return

    const formData = new FormData()
    if (timeSpent) formData.append("time_spent_min", timeSpent)
    if (notes) formData.append("notes", notes)
    if (costAmount) formData.append("cost_amount", costAmount)
    if (costVendor) formData.append("cost_vendor", costVendor)
    if (costCategory) formData.append("cost_category", costCategory)

    await onComplete(taskId, formData)

    // Reset form
    setTimeSpent("")
    setNotes("")
    setCostAmount("")
    setCostVendor("")
    setCostCategory("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-indigo">Complete Task</DialogTitle>
          <DialogDescription>Add details about completing this task (optional)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time_spent">Time Spent (minutes)</Label>
            <Input
              id="time_spent"
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="30"
              className="border-indigo/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about completing this task..."
              className="border-indigo/20"
              rows={3}
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo">
              <DollarSign className="w-4 h-4" />
              Cost Tracking (Optional)
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cost_amount">Amount ($)</Label>
                <Input
                  id="cost_amount"
                  type="number"
                  step="0.01"
                  value={costAmount}
                  onChange={(e) => setCostAmount(e.target.value)}
                  placeholder="25.99"
                  className="border-indigo/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_category">Category</Label>
                <Select value={costCategory} onValueChange={setCostCategory}>
                  <SelectTrigger className="border-indigo/20">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="professional">Professional Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_vendor">Vendor/Store</Label>
              <Input
                id="cost_vendor"
                value={costVendor}
                onChange={(e) => setCostVendor(e.target.value)}
                placeholder="Home Depot, Amazon, Local HVAC..."
                className="border-indigo/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Mark Complete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
