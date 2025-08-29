"use client"

import { feedback } from "@/lib/feedback-system"

export interface NetworkError extends Error {
  status?: number
  code?: string
  retryable?: boolean
}

export class NetworkErrorHandler {
  private retryAttempts = new Map<string, number>()
  private maxRetries = 3
  private retryDelay = 1000

  async handleRequest<T>(
    requestFn: () => Promise<T>,
    options: {
      retryKey?: string
      maxRetries?: number
      showLoading?: boolean
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      onRetry?: (attempt: number) => void
    } = {},
  ): Promise<T | null> {
    const {
      retryKey = Math.random().toString(),
      maxRetries = this.maxRetries,
      showLoading = true,
      loadingMessage = "Processing request...",
      successMessage,
      errorMessage = "Request failed",
      onRetry,
    } = options

    let toastId: string | undefined
    if (showLoading) {
      toastId = feedback.loading(loadingMessage)
    }

    try {
      const result = await requestFn()

      if (toastId && successMessage) {
        feedback.updateLoading(toastId, "success", successMessage)
      } else if (toastId) {
        feedback.dismiss(toastId)
      }

      // Reset retry count on success
      this.retryAttempts.delete(retryKey)
      return result
    } catch (error) {
      const networkError = this.parseError(error)
      const currentAttempts = this.retryAttempts.get(retryKey) || 0

      // Check if we should retry
      if (networkError.retryable && currentAttempts < maxRetries) {
        this.retryAttempts.set(retryKey, currentAttempts + 1)

        if (toastId) {
          feedback.updateLoading(toastId, "error", `Retrying... (${currentAttempts + 1}/${maxRetries})`, {
            description: "Connection issue detected, retrying automatically",
          })
        }

        if (onRetry) {
          onRetry(currentAttempts + 1)
        }

        // Wait before retrying
        await this.delay(this.retryDelay * (currentAttempts + 1))

        // Recursive retry
        return this.handleRequest(requestFn, { ...options, retryKey })
      }

      // Max retries reached or non-retryable error
      if (toastId) {
        feedback.updateLoading(toastId, "error", errorMessage, {
          description: this.getErrorMessage(networkError),
          action: networkError.retryable
            ? {
                label: "Retry",
                onClick: () => this.handleRequest(requestFn, options),
              }
            : undefined,
        })
      } else {
        feedback.error(errorMessage, {
          description: this.getErrorMessage(networkError),
          action: networkError.retryable
            ? {
                label: "Retry",
                onClick: () => this.handleRequest(requestFn, options),
              }
            : undefined,
        })
      }

      this.retryAttempts.delete(retryKey)
      return null
    }
  }

  private parseError(error: any): NetworkError {
    const networkError: NetworkError = new Error(error.message || "Unknown error")

    if (error.status) {
      networkError.status = error.status
    }

    if (error.code) {
      networkError.code = error.code
    }

    // Determine if error is retryable
    networkError.retryable = this.isRetryableError(error)

    return networkError
  }

  private isRetryableError(error: any): boolean {
    // Network errors
    if (!navigator.onLine) return true
    if (error.code === "NETWORK_ERROR") return true
    if (error.message?.includes("fetch")) return true

    // HTTP status codes that are retryable
    if (error.status) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504]
      return retryableStatuses.includes(error.status)
    }

    // Timeout errors
    if (error.name === "TimeoutError") return true
    if (error.message?.includes("timeout")) return true

    return false
  }

  private getErrorMessage(error: NetworkError): string {
    if (!navigator.onLine) {
      return "You appear to be offline. Please check your internet connection."
    }

    if (error.status) {
      switch (error.status) {
        case 400:
          return "Invalid request. Please check your input and try again."
        case 401:
          return "Authentication required. Please log in and try again."
        case 403:
          return "You don't have permission to perform this action."
        case 404:
          return "The requested resource was not found."
        case 408:
          return "Request timed out. Please try again."
        case 429:
          return "Too many requests. Please wait a moment and try again."
        case 500:
          return "Server error. Please try again later."
        case 502:
        case 503:
        case 504:
          return "Service temporarily unavailable. Please try again later."
        default:
          return `Request failed with status ${error.status}. Please try again.`
      }
    }

    return error.message || "An unexpected error occurred. Please try again."
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Utility method for common form submissions
  async submitForm<T>(
    submitFn: () => Promise<T>,
    options: {
      successMessage?: string
      errorMessage?: string
      loadingMessage?: string
    } = {},
  ): Promise<T | null> {
    return this.handleRequest(submitFn, {
      loadingMessage: options.loadingMessage || "Submitting form...",
      successMessage: options.successMessage || "Form submitted successfully",
      errorMessage: options.errorMessage || "Form submission failed",
      maxRetries: 2, // Fewer retries for form submissions
    })
  }

  // Utility method for data fetching
  async fetchData<T>(
    fetchFn: () => Promise<T>,
    options: {
      loadingMessage?: string
      errorMessage?: string
    } = {},
  ): Promise<T | null> {
    return this.handleRequest(fetchFn, {
      loadingMessage: options.loadingMessage || "Loading data...",
      errorMessage: options.errorMessage || "Failed to load data",
      maxRetries: 3,
    })
  }
}

export const networkHandler = new NetworkErrorHandler()
