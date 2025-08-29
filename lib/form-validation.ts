"use client"

import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().email("Please enter a valid email address")
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""))
export const urlSchema = z.string().url("Please enter a valid URL").optional().or(z.literal(""))
export const priceSchema = z.number().min(0, "Price must be positive").max(999999, "Price is too high")

// Asset form validation
export const assetFormSchema = z.object({
  name: z.string().min(1, "Asset name is required").max(100, "Name is too long"),
  room_id: z.string().min(1, "Please select a room"),
  type: z.string().max(50, "Type is too long").optional(),
  brand: z.string().max(50, "Brand name is too long").optional(),
  model: z.string().max(100, "Model is too long").optional(),
  serial: z.string().max(100, "Serial number is too long").optional(),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
})

// Booking form validation
export const bookingFormSchema = z.object({
  provider_id: z.string().min(1, "Provider is required"),
  service_date: z.string().min(1, "Service date is required"),
  scheduled_start_time: z.string().min(1, "Start time is required"),
  service_type: z.string().min(1, "Service type is required"),
  estimated_duration_hours: z
    .number()
    .min(0.5, "Duration must be at least 30 minutes")
    .max(12, "Duration cannot exceed 12 hours"),
  customer_notes: z.string().max(1000, "Notes are too long").optional(),
  task_id: z.string().optional(),
})

// Profile form validation
export const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50, "First name is too long"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  phone: phoneSchema,
  bio: z.string().max(500, "Bio is too long").optional(),
  timezone: z.string().min(1, "Please select a timezone"),
  language: z.string().min(1, "Please select a language"),
})

// Price alert form validation
export const priceAlertFormSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(200, "Product name is too long"),
  target_price: z.number().min(0.01, "Target price must be greater than $0").max(999999, "Target price is too high"),
  retailer: z.string().max(100, "Retailer name is too long").optional(),
  product_url: urlSchema,
  alert_frequency: z.enum(["immediate", "daily", "weekly"], {
    errorMap: () => ({ message: "Please select a valid alert frequency" }),
  }),
})

// Task completion form validation
export const taskCompletionSchema = z.object({
  time_spent_min: z
    .number()
    .min(1, "Time spent must be at least 1 minute")
    .max(1440, "Time spent cannot exceed 24 hours")
    .optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
  cost_amount: z.number().min(0, "Cost cannot be negative").max(999999, "Cost is too high").optional(),
  cost_vendor: z.string().max(100, "Vendor name is too long").optional(),
  cost_category: z.enum(["maintenance", "repair", "replacement", "supplies", "professional", "other"]).optional(),
})

// Review form validation
export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating cannot exceed 5 stars"),
  review_text: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review is too long"),
  service_date: z.string().min(1, "Service date is required"),
  would_recommend: z.boolean(),
})

// Validation helper functions
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: any,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}

export function getFieldError(errors: Record<string, string>, fieldName: string): string | undefined {
  return errors[fieldName]
}
