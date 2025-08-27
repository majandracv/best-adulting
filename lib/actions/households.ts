"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { HouseholdInsert, HouseholdUpdate } from "@/lib/supabase/types"

export async function createHousehold(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const name = formData.get("name") as string
  const zip = formData.get("zip") as string
  const homeType = formData.get("home_type") as string

  if (!name) {
    throw new Error("Household name is required")
  }

  const householdData: HouseholdInsert = {
    owner_id: user.id,
    name,
    zip: zip || null,
    home_type: homeType || null,
  }

  const { data, error } = await supabase.from("households").insert(householdData).select().single()

  if (error) {
    throw new Error(`Failed to create household: ${error.message}`)
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateHousehold(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const zip = formData.get("zip") as string
  const homeType = formData.get("home_type") as string

  const updateData: HouseholdUpdate = {
    name: name || undefined,
    zip: zip || null,
    home_type: homeType || null,
  }

  const { data, error } = await supabase.from("households").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update household: ${error.message}`)
  }

  revalidatePath("/dashboard")
  revalidatePath(`/households/${id}`)
  return { success: true, data }
}

export async function deleteHousehold(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("households").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete household: ${error.message}`)
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function addHouseholdMember(householdId: string, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const role = formData.get("role") as string

  if (!email) {
    throw new Error("Email is required")
  }

  // First, find the user by email (this would need to be implemented based on your user lookup strategy)
  // For now, we'll assume the user_id is provided directly
  const userId = formData.get("user_id") as string

  if (!userId) {
    throw new Error("User not found")
  }

  const { data, error } = await supabase
    .from("household_members")
    .insert({
      household_id: householdId,
      user_id: userId,
      role: role || "member",
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add household member: ${error.message}`)
  }

  revalidatePath(`/households/${householdId}`)
  return { success: true, data }
}
