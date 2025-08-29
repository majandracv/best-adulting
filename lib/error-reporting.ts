"use client"

import { feedback } from "@/lib/feedback-system"

export interface ErrorReport {
  id: string
  timestamp: string
  error: {
    message: string
    stack?: string
    name: string
  }
  context: {
    url: string
    userAgent: string
    userId?: string
    sessionId: string
  }
  metadata?: Record<string, any>
}

export interface UserFeedback {
  id: string
  timestamp: string
  type: "bug" | "feature" | "improvement" | "general"
  category: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  context: {
    url: string
    userAgent: string
    userId?: string
    sessionId: string
  }
  attachments?: string[]
}

class ErrorReportingService {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandlers()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.reportError(new Error(event.reason), {
        type: "unhandled_promise_rejection",
        reason: event.reason,
      })
    })

    // Handle global JavaScript errors
    window.addEventListener("error", (event) => {
      this.reportError(event.error || new Error(event.message), {
        type: "javascript_error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })
  }

  async reportError(error: Error, metadata?: Record<string, any>): Promise<void> {
    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId,
      },
      metadata,
    }

    try {
      // In a real app, this would send to your error reporting service
      console.error("[v0] Error Report:", errorReport)

      // Store locally for debugging
      const existingReports = JSON.parse(localStorage.getItem("error_reports") || "[]")
      existingReports.push(errorReport)

      // Keep only last 50 reports
      if (existingReports.length > 50) {
        existingReports.splice(0, existingReports.length - 50)
      }

      localStorage.setItem("error_reports", JSON.stringify(existingReports))

      // Show user-friendly notification
      feedback.error("An error occurred", {
        description: "The error has been reported automatically",
        action: {
          label: "Report Details",
          onClick: () => this.showErrorReportDialog(errorReport),
        },
      })
    } catch (reportingError) {
      console.error("[v0] Failed to report error:", reportingError)
    }
  }

  async submitUserFeedback(feedbackData: Omit<UserFeedback, "id" | "timestamp" | "context">): Promise<void> {
    const userFeedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId,
      },
      ...feedbackData,
    }

    try {
      // In a real app, this would send to your feedback service
      console.log("[v0] User Feedback:", userFeedback)

      // Store locally for debugging
      const existingFeedback = JSON.parse(localStorage.getItem("user_feedback") || "[]")
      existingFeedback.push(userFeedback)

      // Keep only last 100 feedback items
      if (existingFeedback.length > 100) {
        existingFeedback.splice(0, existingFeedback.length - 100)
      }

      localStorage.setItem("user_feedback", JSON.stringify(existingFeedback))

      feedback.success("Feedback submitted", {
        description: "Thank you for helping us improve Best Adulting!",
      })
    } catch (error) {
      console.error("[v0] Failed to submit feedback:", error)
      feedback.error("Failed to submit feedback", {
        description: "Please try again later",
      })
    }
  }

  private showErrorReportDialog(errorReport: ErrorReport) {
    // This would open a dialog with error details
    const details = `
Error: ${errorReport.error.message}
Time: ${errorReport.timestamp}
Page: ${errorReport.context.url}
Session: ${errorReport.context.sessionId}
    `.trim()

    navigator.clipboard?.writeText(details).then(() => {
      feedback.info("Error details copied to clipboard")
    })
  }

  getStoredReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem("error_reports") || "[]")
    } catch {
      return []
    }
  }

  getStoredFeedback(): UserFeedback[] {
    try {
      return JSON.parse(localStorage.getItem("user_feedback") || "[]")
    } catch {
      return []
    }
  }

  clearStoredData() {
    localStorage.removeItem("error_reports")
    localStorage.removeItem("user_feedback")
    feedback.info("Stored error data cleared")
  }
}

export const errorReporting = new ErrorReportingService()
