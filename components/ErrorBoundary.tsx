"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { feedback } from "@/lib/feedback-system"
import { errorReporting } from "@/lib/error-reporting"
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class Boundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })

    // Log error for debugging
    console.error("[v0] Error caught by boundary:", error, errorInfo)

    errorReporting.reportError(error, {
      type: "react_error_boundary",
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Show error feedback
    feedback.error("Something went wrong", {
      description: "An unexpected error occurred. Please try refreshing the page.",
      action: {
        label: "Report Issue",
        onClick: () => {
          // Could integrate with error reporting service
          console.log("Error reported:", error)
        },
      },
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred. Don't worry, your data is safe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                <FeedbackDialog
                  defaultType="bug"
                  trigger={
                    <Button variant="ghost" size="sm" className="w-full">
                      <Bug className="w-4 h-4 mr-2" />
                      Report This Error
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log("Error details:", this.state.error, this.state.errorInfo)
                    feedback.info("Error details logged to console")
                  }}
                  className="w-full"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Show Error Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use
export function ErrorBoundary({ children, ...props }: ErrorBoundaryProps) {
  return <Boundary {...props}>{children}</Boundary>
}
