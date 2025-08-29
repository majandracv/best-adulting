"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function upgradePlan(planId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // In a real app, this would integrate with Stripe or another payment processor
    console.log(`[v0] Plan upgrade to ${planId} would be processed for user ${user.id}`)

    // Update user profile with new plan
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      plan_tier: planId,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateBillingInfo(data: {
  card_number: string
  expiry_month: string
  expiry_year: string
  cvv: string
  billing_name: string
  billing_address: string
  billing_city: string
  billing_state: string
  billing_zip: string
}) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // In a real app, this would securely store payment info with a payment processor
    console.log(`[v0] Billing info would be updated for user ${user.id}`)

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
