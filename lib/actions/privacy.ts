"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateNotificationSettings(settings: {
  email_tasks: boolean
  email_bookings: boolean
  email_price_alerts: boolean
  email_marketing: boolean
  push_tasks: boolean
  push_bookings: boolean
  push_price_alerts: boolean
  push_marketing: boolean
  frequency: string
  quiet_hours_start: string
  quiet_hours_end: string
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

    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      notification_settings: settings,
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

export async function updatePrivacySettings(settings: {
  profile_visibility: string
  data_sharing: boolean
  analytics_tracking: boolean
  marketing_emails: boolean
  third_party_sharing: boolean
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

    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      privacy_settings: settings,
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

export async function exportUserData() {
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

    // In a real app, this would initiate a data export process
    console.log(`[v0] Data export initiated for user ${user.id}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteUserAccount() {
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

    // In a real app, this would initiate account deletion process
    console.log(`[v0] Account deletion initiated for user ${user.id}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
