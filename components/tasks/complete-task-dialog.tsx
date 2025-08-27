"use client"

import type React from "react"

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
  const t = useTranslations("tasks")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId) return

    const formData = new FormData()
    if (timeSpent) formData.append("time_spent_min", timeSpent)
    if (notes) formData.append("notes", notes)

    await onComplete(taskId, formData)

    // Reset form
    setTimeSpent("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
