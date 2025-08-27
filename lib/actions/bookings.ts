"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { BookingInsert, BookingUpdate } from "@/lib/supabase/types"

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const providerId = formData.get("provider_id") as string
  const householdId = formData.get("household_id") as string
  const taskId = formData.get("task_id") as string
  const startsAt = formData.get("starts_at") as string
  const endsAt = formData.get("ends_at") as string
  const notes = formData.get("notes") as string
  const priceCents = formData.get("price_cents") as string

  if (!providerId || !householdId || !startsAt) {
    throw new Error("Provider ID, household ID, and start time are required")
  }

  const bookingData: BookingInsert = {
    provider_id: providerId,
    household_id: householdId,
    task_id: taskId || null,
    requester_id: user.id,
    starts_at: startsAt,
    ends_at: endsAt || null,
    notes: notes || null,
    price_cents: priceCents ? Number.parseInt(priceCents) : null,
  }

  const { data, error } = await supabase.from("bookings").insert(bookingData).select().single()

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  revalidatePath(`/households/${householdId}`)
  revalidatePath("/bookings")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateBookingStatus(id: string, status: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("bookings").update({ status }).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`)
  }

  revalidatePath(`/households/${data.household_id}`)
  revalidatePath("/bookings")
  revalidatePath(`/bookings/${id}`)
  return { success: true, data }
}

export async function updateBooking(id: string, formData: FormData) {
  const supabase = await createClient()

  const startsAt = formData.get("starts_at") as string
  const endsAt = formData.get("ends_at") as string
  const notes = formData.get("notes") as string
  const priceCents = formData.get("price_cents") as string

  const updateData: BookingUpdate = {
    starts_at: startsAt || undefined,
    ends_at: endsAt || null,
    notes: notes || null,
    price_cents: priceCents ? Number.parseInt(priceCents) : null,
  }

  const { data, error } = await supabase.from("bookings").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update booking: ${error.message}`)
  }

  revalidatePath(`/households/${data.household_id}`)
  revalidatePath("/bookings")
  revalidatePath(`/bookings/${id}`)
  return { success: true, data }
}

export async function deleteBooking(id: string) {
  const supabase = await createClient()

  // Get household_id before deletion for revalidation
  const { data: booking } = await supabase.from("bookings").select("household_id").eq("id", id).single()

  const { error } = await supabase.from("bookings").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete booking: ${error.message}`)
  }

  if (booking) {
    revalidatePath(`/households/${booking.household_id}`)
  }
  revalidatePath("/bookings")
  revalidatePath("/dashboard")
  return { success: true }
}
