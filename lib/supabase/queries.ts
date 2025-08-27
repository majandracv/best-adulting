// Database query utilities for Best Adulting
import { createClient } from "./server"
import type { Database } from "@/lib/database.types"

type Tables = Database["public"]["Tables"]
type Household = Tables["households"]["Row"]
type Asset = Tables["assets"]["Row"]
type Task = Tables["tasks"]["Row"]
type Room = Tables["rooms"]["Row"]

// Household queries
export async function getUserHouseholds() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("user_households").select("*")

  if (error) throw error
  return data
}

export async function getHouseholdById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("households")
    .select(`
      *,
      rooms(*),
      household_members(
        *,
        users_profile(full_name)
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

// Asset queries
export async function getHouseholdAssets(householdId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("assets")
    .select(`
      *,
      rooms(name)
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getAssetById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("assets")
    .select(`
      *,
      rooms(name, household_id),
      tasks(*)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

// Task queries
export async function getHouseholdTasks(householdId: string, includeArchived = false) {
  const supabase = await createClient()

  let query = supabase
    .from("tasks")
    .select(`
      *,
      assets(name, type),
      users_profile!tasks_assigned_to_fkey(full_name)
    `)
    .eq("household_id", householdId)
    .order("next_due", { ascending: true, nullsFirst: false })

  if (!includeArchived) {
    query = query.eq("is_archived", false)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getUpcomingTasks(householdId: string, days = 7) {
  const supabase = await createClient()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assets(name, type),
      users_profile!tasks_assigned_to_fkey(full_name)
    `)
    .eq("household_id", householdId)
    .eq("is_archived", false)
    .lte("next_due", futureDate.toISOString().split("T")[0])
    .order("next_due", { ascending: true })

  if (error) throw error
  return data
}

// Room queries
export async function getHouseholdRooms(householdId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("rooms")
    .select(`
      *,
      assets(count)
    `)
    .eq("household_id", householdId)
    .order("name")

  if (error) throw error
  return data
}

// User profile queries
export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("users_profile").select("*").eq("user_id", user.id).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

// Booking queries
export async function getHouseholdBookings(householdId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      providers(name, category, rating),
      tasks(title),
      users_profile!bookings_requester_id_fkey(full_name)
    `)
    .eq("household_id", householdId)
    .order("starts_at", { ascending: false })

  if (error) throw error
  return data
}

// Cost queries
export async function getHouseholdCosts(householdId: string, limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("costs")
    .select(`
      *,
      tasks(title)
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
