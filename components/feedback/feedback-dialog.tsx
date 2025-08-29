"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from "@/components/ui/form-field"
import { SelectItem } from "@/components/ui/select"
import { useFormValidation } from "@/hooks/use-form-validation"
import { z } from "zod"
import { errorReporting } from "@/lib/error-reporting"
import { MessageSquare, Bug, Lightbulb, Settings, HelpCircle } from "lucide-react"

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "general"], {
    errorMap: () => ({ message: "Please select a feedback type" }),
  }),
  category: z.string().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Please select a priority" }),
  }),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

interface FeedbackDialogProps {
  trigger?: React.ReactNode
  defaultType?: "bug" | "feature" | "improvement" | "general"
}

export function FeedbackDialog({ trigger, defaultType = "general" }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: defaultType,
    category: "",
    title: "",
    description: "",
    priority: "medium",
  })

  const { handleSubmit, getFieldError, isSubmitting, clearErrors } = useFormValidation({
    schema: feedbackSchema,
    onSubmit: async (data) => {
      await errorReporting.submitUserFeedback(data)
      setOpen(false)
      setFormData({
        type: defaultType,
        category: "",
        title: "",
        description: "",
        priority: "medium",
      })
    },
    successMessage: "Feedback submitted successfully",
    errorMessage: "Failed to submit feedback",
  })

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      clearErrors()
    }
  }

  const getCategoriesForType = (type: string) => {
    switch (type) {
      case "bug":
        return ["UI/UX Issue", "Performance", "Data Loss", "Crash", "Login/Auth", "Other"]
      case "feature":
        return ["New Feature", "Integration", "Mobile App", "API", "Automation", "Other"]
      case "improvement":
        return ["User Experience", "Performance", "Accessibility", "Design", "Workflow", "Other"]
      case "general":
        return ["Question", "Suggestion", "Compliment", "Documentation", "Support", "Other"]
      default:
        return ["Other"]
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="w-4 h-4" />
      case "feature":
        return <Lightbulb className="w-4 h-4" />
      case "improvement":
        return <Settings className="w-4 h-4" />
      case "general":
        return <HelpCircle className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIconForType(formData.type)}
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Best Adulting by sharing your thoughts, reporting issues, or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(formData)
          }}
          className="space-y-4"
        >
          <ValidatedSelect
            label="Feedback Type"
            name="type"
            value={formData.type}
            onValueChange={(value) => {
              setFormData({ ...formData, type: value as any, category: "" })
            }}
            error={getFieldError("type")}
            required
          >
            <SelectItem value="bug">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Bug Report
              </div>
            </SelectItem>
            <SelectItem value="feature">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Feature Request
              </div>
            </SelectItem>
            <SelectItem value="improvement">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Improvement
              </div>
            </SelectItem>
            <SelectItem value="general">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                General Feedback
              </div>
            </SelectItem>
          </ValidatedSelect>

          <ValidatedSelect
            label="Category"
            name="category"
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            error={getFieldError("category")}
            placeholder="Select a category"
            required
          >
            {getCategoriesForType(formData.type).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </ValidatedSelect>

          <ValidatedInput
            label="Title"
            name="title"
            value={formData.title}
            onValueChange={(value) => setFormData({ ...formData, title: value })}
            error={getFieldError("title")}
            placeholder="Brief summary of your feedback"
            required
          />

          <ValidatedTextarea
            label="Description"
            name="description"
            value={formData.description}
            onValueChange={(value) => setFormData({ ...formData, description: value })}
            error={getFieldError("description")}
            placeholder="Please provide details about your feedback..."
            rows={4}
            required
          />

          <ValidatedSelect
            label="Priority"
            name="priority"
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
            error={getFieldError("priority")}
            required
          >
            <SelectItem value="low">Low - Minor issue or suggestion</SelectItem>
            <SelectItem value="medium">Medium - Moderate impact</SelectItem>
            <SelectItem value="high">High - Significant issue or important feature</SelectItem>
          </ValidatedSelect>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
