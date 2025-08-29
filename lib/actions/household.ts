"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateHousehold(data: {
  name: string
  home_type: string
  zip: string
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

    // Get user's household
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("household_id")
      .eq("user_id", user.id)
      .single()

    if (!profile?.household_id) {
      return { success: false, error: "No household found" }
    }

    // Check if user is admin
    const { data: member } = await supabase
      .from("household_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("household_id", profile.household_id)
      .single()

    if (member?.role !== "admin") {
      return { success: false, error: "Only admins can update household settings" }
    }

    const { error } = await supabase.from("households").update(data).eq("id", profile.household_id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function inviteHouseholdMember(email: string) {
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

    // Get user's household
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("household_id")
      .eq("user_id", user.id)
      .single()

    if (!profile?.household_id) {
      return { success: false, error: "No household found" }
    }

    // Check if user is admin
    const { data: member } = await supabase
      .from("household_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("household_id", profile.household_id)
      .single()

    if (member?.role !== "admin") {
      return { success: false, error: "Only admins can invite members" }
    }

    // In a real app, this would send an email invitation
    // For now, we'll just simulate success
    console.log(`[v0] Invitation would be sent to: ${email}`)

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function removeHouseholdMember(memberId: string) {
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

    // Get user's household
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("household_id")
      .eq("user_id", user.id)
      .single()

    if (!profile?.household_id) {
      return { success: false, error: "No household found" }
    }

    // Check if user is admin
    const { data: member } = await supabase
      .from("household_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("household_id", profile.household_id)
      .single()

    if (member?.role !== "admin") {
      return { success: false, error: "Only admins can remove members" }
    }

    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("id", memberId)
      .eq("household_id", profile.household_id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
