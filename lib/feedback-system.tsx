"use client"

import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

export type FeedbackType = "success" | "error" | "warning" | "info" | "loading"

interface FeedbackOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

class FeedbackSystem {
  private loadingToasts = new Map<string, string>()

  success(message: string, options?: FeedbackOptions) {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <CheckCircle className="w-4 h-4" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    })
  }

  error(message: string, options?: FeedbackOptions) {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: <XCircle className="w-4 h-4" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    })
  }

  warning(message: string, options?: FeedbackOptions) {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <AlertCircle className="w-4 h-4" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    })
  }

  info(message: string, options?: FeedbackOptions) {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <Info className="w-4 h-4" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    })
  }

  loading(message: string, id?: string): string {
    const toastId = id || Math.random().toString(36).substr(2, 9)

    toast.loading(message, {
      id: toastId,
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    })

    if (id) {
      this.loadingToasts.set(id, toastId)
    }

    return toastId
  }

  updateLoading(id: string, type: "success" | "error", message: string, options?: FeedbackOptions) {
    const toastId = this.loadingToasts.get(id) || id

    if (type === "success") {
      toast.success(message, {
        id: toastId,
        description: options?.description,
        duration: options?.duration || 4000,
        icon: <CheckCircle className="w-4 h-4" />,
      })
    } else {
      toast.error(message, {
        id: toastId,
        description: options?.description,
        duration: options?.duration || 6000,
        icon: <XCircle className="w-4 h-4" />,
      })
    }

    this.loadingToasts.delete(id)
  }

  dismiss(toastId?: string) {
    toast.dismiss(toastId)
  }

  dismissAll() {
    toast.dismiss()
  }

  // Utility methods for common scenarios
  networkError(retryAction?: () => void) {
    return this.error("Network connection failed", {
      description: "Please check your internet connection and try again",
      action: retryAction
        ? {
            label: "Retry",
            onClick: retryAction,
          }
        : undefined,
    })
  }

  validationError(field: string, message: string) {
    return this.error(`${field} validation failed`, {
      description: message,
      duration: 5000,
    })
  }

  operationSuccess(operation: string) {
    return this.success(`${operation} completed successfully`, {
      duration: 3000,
    })
  }

  operationError(operation: string, error?: string) {
    return this.error(`${operation} failed`, {
      description: error || "An unexpected error occurred. Please try again.",
      duration: 6000,
    })
  }
}

export const feedback = new FeedbackSystem()
