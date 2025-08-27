"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { AssetInsert, AssetUpdate } from "@/lib/supabase/types"

export async function createAsset(formData: FormData) {
  const supabase = await createClient()

  const roomId = formData.get("room_id") as string
  const householdId = formData.get("household_id") as string
  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const brand = formData.get("brand") as string
  const model = formData.get("model") as string
  const serial = formData.get("serial") as string
  const purchaseDate = formData.get("purchase_date") as string
  const warrantyExpiry = formData.get("warranty_expiry") as string
  const photoUrl = formData.get("photo_url") as string

  if (!roomId || !householdId || !name) {
    throw new Error("Room ID, household ID, and asset name are required")
  }

  const assetData: AssetInsert = {
    room_id: roomId,
    household_id: householdId,
    name,
    type: type || null,
    brand: brand || null,
    model: model || null,
    serial: serial || null,
    purchase_date: purchaseDate || null,
    warranty_expiry: warrantyExpiry || null,
    photo_url: photoUrl || null,
  }

  const { data, error } = await supabase.from("assets").insert(assetData).select().single()

  if (error) {
    throw new Error(`Failed to create asset: ${error.message}`)
  }

  revalidatePath(`/households/${householdId}`)
  revalidatePath("/assets")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateAsset(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const brand = formData.get("brand") as string
  const model = formData.get("model") as string
  const serial = formData.get("serial") as string
  const purchaseDate = formData.get("purchase_date") as string
  const warrantyExpiry = formData.get("warranty_expiry") as string
  const photoUrl = formData.get("photo_url") as string

  const updateData: AssetUpdate = {
    name: name || undefined,
    type: type || null,
    brand: brand || null,
    model: model || null,
    serial: serial || null,
    purchase_date: purchaseDate || null,
    warranty_expiry: warrantyExpiry || null,
    photo_url: photoUrl || null,
  }

  const { data, error } = await supabase.from("assets").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update asset: ${error.message}`)
  }

  revalidatePath(`/households/${data.household_id}`)
  revalidatePath("/assets")
  revalidatePath(`/assets/${id}`)
  return { success: true, data }
}

export async function deleteAsset(id: string) {
  const supabase = await createClient()

  // Get household_id before deletion for revalidation
  const { data: asset } = await supabase.from("assets").select("household_id").eq("id", id).single()

  const { error } = await supabase.from("assets").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete asset: ${error.message}`)
  }

  if (asset) {
    revalidatePath(`/households/${asset.household_id}`)
  }
  revalidatePath("/assets")
  revalidatePath("/dashboard")
  return { success: true }
}
