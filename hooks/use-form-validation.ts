"use client"

import { useState, useCallback } from "react"
import { z } from "zod"
import { validateFormData } from "@/lib/form-validation"
import { feedback } from "@/lib/feedback-system"

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void>
  onSuccess?: (data: T) => void
  onError?: (errors: Record<string, string>) => void
  validateOnChange?: boolean
  successMessage?: string
  errorMessage?: string
}

export function useFormValidation<T>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  validateOnChange = false,
  successMessage = "Form submitted successfully",
  errorMessage = "Please fix the errors below",
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback(
    (fieldName: string, value: any) => {
      if (!validateOnChange && !touched[fieldName]) return

      try {
        const fieldSchema = schema.shape?.[fieldName as keyof typeof schema.shape]
        if (fieldSchema) {
          fieldSchema.parse(value)
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          })
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error.errors[0]?.message || "Invalid value",
          }))
        }
      }
    },
    [schema, validateOnChange, touched],
  )

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }))
      validateField(fieldName, value)
    },
    [validateField],
  )

  const handleSubmit = useCallback(
    async (formData: Record<string, any>) => {
      setIsSubmitting(true)
      setErrors({})

      const validation = validateFormData(schema, formData)

      if (!validation.success) {
        setErrors(validation.errors)
        feedback.error(errorMessage, {
          description: "Please check the form for errors and try again",
        })
        if (onError) {
          onError(validation.errors)
        }
        setIsSubmitting(false)
        return
      }

      try {
        await onSubmit(validation.data)
        feedback.success(successMessage)
        if (onSuccess) {
          onSuccess(validation.data)
        }
        setErrors({})
        setTouched({})
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred"
        feedback.error("Submission failed", {
          description: errorMsg,
        })
        setErrors({ general: errorMsg })
      } finally {
        setIsSubmitting(false)
      }
    },
    [schema, onSubmit, onSuccess, onError, successMessage, errorMessage],
  )

  const getFieldError = useCallback(
    (fieldName: string) => {
      return errors[fieldName]
    },
    [errors],
  )

  const hasFieldError = useCallback(
    (fieldName: string) => {
      return !!errors[fieldName]
    },
    [errors],
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  return {
    errors,
    isSubmitting,
    touched,
    handleFieldChange,
    handleSubmit,
    getFieldError,
    hasFieldError,
    clearErrors,
    validateField,
  }
}
