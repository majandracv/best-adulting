"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface Provider {
  id: string
  name: string
  service_type: string
  rating: number
  contact_info: string
  bio?: string
  specialties?: string[]
  hourly_rate_cents?: number
  availability_schedule?: any
  profile_image_url?: string
  years_experience?: number
  license_number?: string
  insurance_verified?: boolean
  service_radius_miles?: number
  phone?: string
  email?: string
  website_url?: string
  is_active?: boolean
  household_id: string
  created_at: string
  review_count?: number
  recent_reviews?: any[]
}

export async function getProviders(serviceType?: string, location?: string) {
  const supabase = createServerClient()

  let query = supabase
    .from("providers")
    .select(`
      *,
      provider_reviews (
        id,
        rating,
        review_text,
        service_date,
        would_recommend,
        created_at
      )
    `)
    .eq("is_active", true)
    .order("rating", { ascending: false })

  if (serviceType) {
    query = query.eq("service_type", serviceType)
  }

  const { data: providers, error } = await query

  if (error) {
    console.error("Error fetching providers:", error)
    return []
  }

  // Calculate review statistics
  return (
    providers?.map((provider) => ({
      ...provider,
      review_count: provider.provider_reviews?.length || 0,
      recent_reviews: provider.provider_reviews?.slice(0, 3) || [],
    })) || []
  )
}

export async function getProvider(id: string) {
  const supabase = createServerClient()

  const { data: provider, error } = await supabase
    .from("providers")
    .select(`
      *,
      provider_reviews (
        id,
        rating,
        review_text,
        service_date,
        would_recommend,
        created_at,
        user_id
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching provider:", error)
    return null
  }

  return {
    ...provider,
    review_count: provider.provider_reviews?.length || 0,
    average_rating:
      provider.provider_reviews?.length > 0
        ? provider.provider_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
          provider.provider_reviews.length
        : provider.rating,
  }
}

export async function createProviderReview(formData: FormData) {
  const supabase = createServerClient()

  const providerId = formData.get("provider_id") as string
  const rating = Number.parseInt(formData.get("rating") as string)
  const reviewText = formData.get("review_text") as string
  const wouldRecommend = formData.get("would_recommend") === "true"
  const serviceDate = formData.get("service_date") as string
  const bookingId = (formData.get("booking_id") as string) || null

  // Get user's household
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single()

  if (!member) {
    throw new Error("User not part of any household")
  }

  const { error } = await supabase.from("provider_reviews").insert({
    provider_id: providerId,
    user_id: user.id,
    household_id: member.household_id,
    booking_id: bookingId,
    rating,
    review_text: reviewText,
    would_recommend: wouldRecommend,
    service_date: serviceDate,
  })

  if (error) {
    console.error("Error creating review:", error)
    throw new Error("Failed to create review")
  }

  // Update provider's average rating
  const { data: reviews } = await supabase.from("provider_reviews").select("rating").eq("provider_id", providerId)

  if (reviews && reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

    await supabase
      .from("providers")
      .update({ rating: Math.round(averageRating * 10) / 10 })
      .eq("id", providerId)
  }

  revalidatePath("/booking")
  revalidatePath(`/booking/providers/${providerId}`)
}
