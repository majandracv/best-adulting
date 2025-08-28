"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { AssetInsert, AssetUpdate } from "@/lib/supabase/types"
import { checkAssetLimit } from "@/lib/tier-management"

export async function uploadAssetPhoto(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const file = formData.get("photo") as File
  if (!file) {
    throw new Error("No photo provided")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from("assets").upload(fileName, file)

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("assets").getPublicUrl(data.path)

  return { success: true, url: publicUrl }
}

export async function createAssetMinimal(data: { name: string; room?: string; brand?: string; model?: string }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    // Find household for user (adjust to your schema)
    const { data: hh } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .single()
    if (!hh) return false
    const { error } = await supabase.from("assets").insert({
      household_id: hh.household_id,
      name: data.name,
      room: data.room ?? null,
      brand: data.brand ?? null,
      model: data.model ?? null,
    })
    if (error) return false
    revalidatePath("/assets")
    return true
  } catch {
    return false
  }
}

export async function createAsset(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users_profile").select("tier").eq("id", user.id).single()

  const { data: existingAssets } = await supabase
    .from("assets")
    .select("id")
    .eq("household_id", formData.get("household_id") as string)

  const userTier = userProfile?.tier || "free"
  if (!checkAssetLimit(existingAssets?.length || 0, userTier)) {
    throw new Error("Asset limit reached for your current plan")
  }

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
