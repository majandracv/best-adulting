"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { RoomInsert, RoomUpdate } from "@/lib/supabase/types"

export async function createRoom(formData: FormData) {
  const supabase = await createClient()

  const householdId = formData.get("household_id") as string
  const name = formData.get("name") as string

  if (!householdId || !name) {
    throw new Error("Household ID and room name are required")
  }

  const roomData: RoomInsert = {
    household_id: householdId,
    name,
  }

  const { data, error } = await supabase.from("rooms").insert(roomData).select().single()

  if (error) {
    throw new Error(`Failed to create room: ${error.message}`)
  }

  revalidatePath(`/households/${householdId}`)
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateRoom(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string

  if (!name) {
    throw new Error("Room name is required")
  }

  const updateData: RoomUpdate = {
    name,
  }

  const { data, error } = await supabase.from("rooms").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update room: ${error.message}`)
  }

  revalidatePath(`/households/${data.household_id}`)
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function deleteRoom(id: string) {
  const supabase = await createClient()

  // Get household_id before deletion for revalidation
  const { data: room } = await supabase.from("rooms").select("household_id").eq("id", id).single()

  const { error } = await supabase.from("rooms").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete room: ${error.message}`)
  }

  if (room) {
    revalidatePath(`/households/${room.household_id}`)
  }
  revalidatePath("/dashboard")
  return { success: true }
}
