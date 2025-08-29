"use client"

import { useState, useCallback } from "react"
import { feedback } from "@/lib/feedback-system"

interface UseLoadingStateOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (asyncFunction: () => Promise<any>, loadingMessage?: string): Promise<any | null> => {
      setIsLoading(true)
      setError(null)

      let toastId: string | undefined
      if (loadingMessage) {
        toastId = feedback.loading(loadingMessage)
      }

      try {
        const result = await asyncFunction()

        if (toastId && options.successMessage) {
          feedback.updateLoading(toastId, "success", options.successMessage)
        } else if (options.successMessage) {
          feedback.success(options.successMessage)
        }

        if (options.onSuccess) {
          options.onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An unknown error occurred")
        setError(error)

        if (toastId) {
          feedback.updateLoading(toastId, "error", options.errorMessage || "Operation failed", {
            description: error.message,
          })
        } else {
          feedback.error(options.errorMessage || "Operation failed", {
            description: error.message,
          })
        }

        if (options.onError) {
          options.onError(error)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [options],
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    execute,
    reset,
  }
}

export function useFormSubmission<T = any>(options: UseLoadingStateOptions = {}) {
  const loadingState = useLoadingState(options)

  const submitForm = useCallback(
    async (
      formData: FormData | Record<string, any>,
      submitFunction: (data: FormData | Record<string, any>) => Promise<T>,
      loadingMessage = "Submitting form...",
    ) => {
      return loadingState.execute(() => submitFunction(formData), loadingMessage)
    },
    [loadingState],
  )

  return {
    ...loadingState,
    submitForm,
  }
}

export function useDataFetching<T = any>(options: UseLoadingStateOptions = {}) {
  const loadingState = useLoadingState(options)
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = useCallback(
    async (fetchFunction: () => Promise<T>, loadingMessage = "Loading data...") => {
      return loadingState.execute(fetchFunction, loadingMessage)
    },
    [loadingState],
  )

  const retry = useCallback(
    async (fetchFunction: () => Promise<T>, maxRetries = 3) => {
      if (retryCount >= maxRetries) {
        feedback.error("Maximum retry attempts reached", {
          description: "Please refresh the page or try again later",
        })
        return null
      }

      setRetryCount((prev) => prev + 1)
      return fetchData(fetchFunction, `Retrying... (${retryCount + 1}/${maxRetries})`)
    },
    [fetchData, retryCount],
  )

  return {
    ...loadingState,
    fetchData,
    retry,
    retryCount,
  }
}
