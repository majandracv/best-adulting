"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createBooking(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's household
  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single()

  if (!member) {
    throw new Error("User not part of any household")
  }

  const providerId = formData.get("provider_id") as string
  const serviceDate = formData.get("service_date") as string
  const scheduledStartTime = formData.get("scheduled_start_time") as string
  const serviceType = formData.get("service_type") as string
  const estimatedDurationHours = Number.parseInt(formData.get("estimated_duration_hours") as string)
  const totalCostCents = Number.parseInt(formData.get("total_cost_cents") as string)
  const customerNotes = formData.get("customer_notes") as string
  const taskId = (formData.get("task_id") as string) || null

  if (!providerId || !serviceDate || !scheduledStartTime || !serviceType) {
    throw new Error("Provider, service date, time, and service type are required")
  }

  const bookingData = {
    provider_id: providerId,
    household_id: member.household_id,
    service_date: serviceDate,
    scheduled_start_time: scheduledStartTime,
    service_type: serviceType,
    estimated_duration_hours: estimatedDurationHours,
    total_cost_cents: totalCostCents,
    customer_notes: customerNotes,
    task_id: taskId,
    status: "pending",
    notes: customerNotes, // For backward compatibility
  }

  const { data, error } = await supabase.from("bookings").insert(bookingData).select().single()

  if (error) {
    console.error("Booking creation error:", error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  revalidatePath("/booking")
  revalidatePath("/dashboard")
  redirect(`/booking/confirmation/${data.id}`)
}

export async function updateBookingStatus(id: string, status: string) {
  const supabase = createServerClient()

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
  const supabase = createServerClient()

  const startsAt = formData.get("starts_at") as string
  const endsAt = formData.get("ends_at") as string
  const notes = formData.get("notes") as string
  const priceCents = formData.get("price_cents") as string

  const updateData = {
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
  const supabase = createServerClient()

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

export async function getBookingsForHousehold(householdId: string) {
  const supabase = createServerClient()

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      providers (
        id,
        name,
        service_type,
        rating,
        phone,
        email
      ),
      tasks (
        id,
        title,
        description
      )
    `)
    .eq("household_id", householdId)
    .order("service_date", { ascending: true })

  if (error) {
    console.error("Error fetching bookings:", error)
    return []
  }

  return bookings || []
}

export async function getBooking(id: string) {
  const supabase = createServerClient()

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      providers (
        id,
        name,
        service_type,
        rating,
        phone,
        email,
        profile_image_url
      ),
      tasks (
        id,
        title,
        description
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching booking:", error)
    return null
  }

  return booking
}
